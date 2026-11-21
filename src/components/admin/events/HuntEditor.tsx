import { useState } from "react";
import {
  Badge, Box, Button, Flex, FormControl, FormHelperText, FormLabel, Grid, HStack, Input, Link, Modal, ModalBody, ModalCloseButton,
  ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Text, VStack, useToast,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import { useEventAdminActions, useHuntSpots } from "@/hooks/useAPI";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import type { IHuntSpot, ISiteEvent } from "@/interfaces";

const formatDay = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

// Pasted links keep only their path: https://bbs-schrift.fr/joueur/X?compte=1 → /joueur/X
const pathOf = (value: string) => {
  const text = value.trim();
  try {
    return text.startsWith("http") ? new URL(text).pathname : text;
  } catch {
    return text;
  }
};

const SpotModal = ({ eventId, day, opensAt, current, onClose }: {
  eventId: string; day: number; opensAt: string; current?: IHuntSpot; onClose: () => void;
}) => {
  const actions = useEventAdminActions();
  const toast = useToast();
  const [path, setPath] = useState(current?.path ?? "");
  const [hint, setHint] = useState(current?.hint ?? "");
  const [label, setLabel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const locked = Boolean(current?.finds);

  const random = async () => {
    setDrawing(true);
    try {
      const suggestion = await actions.randomHuntSpot(eventId);
      setPath(suggestion.path);
      setHint(suggestion.hint);
      setLabel(suggestion.label);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setDrawing(false);
    }
  };
  const save = async () => {
    setSaving(true);
    try {
      await actions.saveHuntSpot(eventId, day, { path: pathOf(path), hint });
      toast({ status: "success", title: `Cadeau du jour ${day} caché` });
      onClose();
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    setDeleting(true);
    try {
      await actions.deleteHuntSpot(eventId, day);
      onClose();
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Cadeau du jour {day}
          <Text fontSize="sm" fontWeight="normal" color="text.muted">Caché du {formatDay(opensAt)}, pendant 24 h</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Button variant="outline" onClick={random} isLoading={drawing} isDisabled={locked} alignSelf="flex-start">Au hasard</Button>
            <FormControl isRequired>
              <FormLabel>Page</FormLabel>
              <Input value={path} placeholder="/joueur/Pseudo ou lien copié depuis le site" isDisabled={locked} onChange={(e) => { setPath(e.target.value); setLabel(null); }} />
              <FormHelperText>
                {locked ? "Des joueurs ont déjà trouvé ce cadeau : la page ne peut plus changer."
                  : label ? `Suggestion : ${label}.`
                    : "Colle le lien d'une page du site (profil, fiche de perso, podium…). Pas l'admin ni la page anniversaire."}
              </FormHelperText>
              {path.trim() && (
                <Link as={RouterLink} to={pathOf(path)} isExternal fontSize="sm" color="purple.300" mt={1} display="inline-flex" alignItems="center" gap={1}>
                  Ouvrir la page <ExternalLinkIcon />
                </Link>
              )}
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Indice affiché aux joueurs</FormLabel>
              <Input value={hint} maxLength={200} placeholder="Là où l'on compare deux joueurs" onChange={(e) => setHint(e.target.value)} />
              <FormHelperText>Seul l'indice est montré : la page reste sur le serveur.</FormHelperText>
            </FormControl>
            {current && <Text fontSize="sm" color="text.muted">{current.finds} joueur{current.finds > 1 ? "s ont" : " a"} trouvé ce cadeau.</Text>}
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          {current && !locked && <Button variant="ghost" colorScheme="red" mr="auto" onClick={() => setConfirmDelete(true)}>Retirer</Button>}
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
          <Button colorScheme="purple" onClick={save} isLoading={saving} isDisabled={!path.trim() || !hint.trim()}>Enregistrer</Button>
        </ModalFooter>
      </ModalContent>
      <DeleteConfirmationModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        isDeleting={deleting}
        title={`Retirer le cadeau du jour ${day}`}
        description="Ce jour-là, aucun cadeau ne sera caché."
        itemDetails={current?.path}
      />
    </Modal>
  );
};

// Admin of the gift hunt: the page hiding each day's gift and the hint shown to the players
export const HuntEditor = ({ event }: { event: ISiteEvent }) => {
  const { data, isLoading } = useHuntSpots(event._id);
  const [open, setOpen] = useState<number | null>(null);
  if (isLoading || !data) return <Spinner />;
  const byDay = new Map(data.spots.map((s) => [s.day, s]));
  const opensAt = (day: number) => new Date(new Date(event.start_at).getTime() + (day - 1) * 86400000).toISOString();
  const finds = data.spots.reduce((sum, s) => sum + s.finds, 0);
  return (
    <VStack align="stretch" spacing={3}>
      <Flex justify="space-between" align="center" gap={3} wrap="wrap">
        <Text fontSize="sm" color="text.muted">
          {data.spots.length} / {data.days} cadeaux cachés · {data.hunt.points} pts et {data.hunt.tickets} ticket{data.hunt.tickets > 1 ? "s" : ""} par cadeau
          {data.hunt.badge_name ? ` · badge « ${data.hunt.badge_name} » à ${data.hunt.badge_min} cadeaux` : ""}
        </Text>
        <Badge colorScheme="green">{finds} trouvé{finds > 1 ? "s" : ""}</Badge>
      </Flex>
      <Grid templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)", xl: "repeat(6, 1fr)" }} gap={2}>
        {Array.from({ length: data.days }, (_, i) => i + 1).map((day) => {
          const spot = byDay.get(day);
          return (
            <Box
              key={day}
              as="button"
              type="button"
              onClick={() => setOpen(day)}
              textAlign="left"
              p={2.5}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={spot ? "green.300" : "border.subtle"}
              borderStyle={spot ? "solid" : "dashed"}
              bg="bg.card"
              _hover={{ bg: "bg.subtle" }}
              minW={0}
            >
              <Flex justify="space-between" align="center">
                <Text fontWeight="extrabold">{day}</Text>
                {spot && spot.finds > 0 && <Badge colorScheme="green">{spot.finds}</Badge>}
              </Flex>
              <Text fontSize="xs" color="text.muted">{formatDay(opensAt(day))}</Text>
              {spot ? (
                <HStack mt={1.5} spacing={1.5} minW={0}>
                  <Text aria-hidden>🎁</Text>
                  <Box minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" noOfLines={1}>{spot.path}</Text>
                    <Text fontSize="2xs" color="text.muted" noOfLines={1}>{spot.hint}</Text>
                  </Box>
                </HStack>
              ) : <Text fontSize="xs" color="text.muted" mt={1.5}>Pas de cadeau</Text>}
            </Box>
          );
        })}
      </Grid>
      {open && <SpotModal key={open} eventId={event._id} day={open} opensAt={opensAt(open)} current={byDay.get(open)} onClose={() => setOpen(null)} />}
    </VStack>
  );
};
