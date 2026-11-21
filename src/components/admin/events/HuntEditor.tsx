import { useEffect, useState } from "react";
import {
  Avatar, Badge, Box, Button, Flex, FormControl, FormHelperText, FormLabel, Grid, HStack, Input, Link, Modal, ModalBody, ModalCloseButton,
  Image, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Text, VStack, useToast,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import { useEventAdminActions, useHuntSpots } from "@/hooks/useAPI";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { characterImageUrl } from "@/utils/characterImages";
import { getUserAvatarUrl } from "@/utils/discord";
import { buildPlayerUrl } from "@/utils/playerUrl";
import type { IHuntSpot, IHuntTarget, ISiteEvent } from "@/interfaces";

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

// Address to open a spot: the player's own link (real case, ?compte=), else each part of the path encoded.
// Saved paths are decoded and in lower case, so they cannot be used as is.
const pageUrl = (path: string, target: IHuntTarget | null) => {
  if (target?.kind === "player" && target.player) return buildPlayerUrl(target.player.bbs_name, target.player.bbs_id) ?? "/";
  return path.split("/").map((part) => {
    try {
      return encodeURIComponent(decodeURIComponent(part));
    } catch {
      return encodeURIComponent(part);
    }
  }).join("/");
};

const PAGE_ICONS: Record<IHuntTarget["kind"], string> = { player: "👤", character: "⚔️", page: "📄", unknown: "⚠️" };

const avatarOf = (player: NonNullable<IHuntTarget["player"]>) =>
  (player.avatar && player.discord_id ? getUserAvatarUrl({ discord_id: player.discord_id, avatar: player.avatar }) || undefined : undefined);

// What the page shows: the player (avatar, guild) or the character (picture, version), else the page name
const TargetPreview = ({ target, compact = false }: { target: IHuntTarget; compact?: boolean }) => {
  const size = compact ? "28px" : "72px";
  if (target.kind === "player" && target.player) {
    const { player } = target;
    return (
      <HStack spacing={compact ? 1.5 : 3} minW={0}>
        <Avatar size={compact ? "xs" : "lg"} src={avatarOf(player)} name={player.bbs_name} />
        <Box minW={0}>
          <Text fontSize={compact ? "xs" : "lg"} fontWeight="bold" noOfLines={1}>{player.bbs_name}</Text>
          {player.guild_name
            ? <Badge colorScheme="teal" variant="subtle" textTransform="none" fontSize={compact ? "2xs" : "xs"} borderRadius="full" maxW="100%" isTruncated>{player.guild_name}</Badge>
            : <Text fontSize={compact ? "2xs" : "sm"} color="text.muted">Sans guilde</Text>}
          {!compact && player.global_name && <Text fontSize="xs" color="text.muted">Discord : {player.global_name}</Text>}
        </Box>
      </HStack>
    );
  }
  if (target.kind === "character" && target.character) {
    const { character } = target;
    return (
      <HStack spacing={compact ? 1.5 : 3} minW={0}>
        <Image src={characterImageUrl(character, "thumb")} alt="" boxSize={size} borderRadius="md" objectFit="cover" flexShrink={0} bg="bg.subtle" />
        <Box minW={0}>
          <Text fontSize={compact ? "xs" : "lg"} fontWeight="bold" noOfLines={1}>{character.name}</Text>
          {character.version_name && <Text fontSize={compact ? "2xs" : "sm"} color="text.muted" noOfLines={1}>{character.version_name}</Text>}
        </Box>
      </HStack>
    );
  }
  return (
    <HStack spacing={compact ? 1.5 : 3} minW={0}>
      <Box boxSize={size} display="grid" placeItems="center" borderRadius="md" bg="bg.subtle" fontSize={compact ? "sm" : "2xl"} flexShrink={0} aria-hidden>
        {PAGE_ICONS[target.kind]}
      </Box>
      <Box minW={0}>
        <Text fontSize={compact ? "xs" : "lg"} fontWeight="bold" noOfLines={1} color={target.kind === "unknown" ? "orange.300" : undefined}>{target.label}</Text>
        {!compact && <Text fontSize="sm" color="text.muted" noOfLines={1}>{target.path}</Text>}
      </Box>
    </HStack>
  );
};

const SpotModal = ({ eventId, day, opensAt, current, onClose }: {
  eventId: string; day: number; opensAt: string; current?: IHuntSpot; onClose: () => void;
}) => {
  const actions = useEventAdminActions();
  const toast = useToast();
  const [path, setPath] = useState(current?.path ?? "");
  const [hint, setHint] = useState(current?.hint ?? "");
  const [target, setTarget] = useState<IHuntTarget | null>(current?.target ?? null);
  const [looking, setLooking] = useState(false);
  // Page the preview was read for
  const [described, setDescribed] = useState(current?.path ?? "");
  const [saving, setSaving] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const locked = Boolean(current?.finds);

  // Reads what a typed or pasted page shows, once the admin stops typing
  useEffect(() => {
    const value = pathOf(path);
    if (!value || value === described) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLooking(true);
      actions.describeHuntPage(value)
        .then((next) => {
          if (cancelled) return;
          setTarget(next);
          setDescribed(value);
        })
        .catch(() => undefined)
        .finally(() => { if (!cancelled) setLooking(false); });
    }, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [path, described, actions]);

  const random = async () => {
    setDrawing(true);
    try {
      const suggestion = await actions.randomHuntSpot(eventId);
      setTarget(suggestion.target);
      setDescribed(suggestion.path);
      setPath(suggestion.path);
      setHint(suggestion.hint);
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
              <Input value={path} placeholder="/joueur/Pseudo ou lien copié depuis le site" isDisabled={locked} onChange={(e) => setPath(e.target.value)} />
              <FormHelperText>
                {locked ? "Des joueurs ont déjà trouvé ce cadeau : la page ne peut plus changer."
                  : "Colle le lien d'une page du site (profil, fiche de perso, podium…). Pas l'admin ni la page anniversaire."}
              </FormHelperText>
              {path.trim() && (
                <Link as={RouterLink} to={pageUrl(pathOf(path), described === pathOf(path) ? target : null)} isExternal fontSize="sm" color="purple.300" mt={1} display="inline-flex" alignItems="center" gap={1}>
                  Ouvrir la page <ExternalLinkIcon />
                </Link>
              )}
            </FormControl>
            {path.trim() && (
              <Box borderWidth="1px" borderColor={target?.kind === "unknown" ? "orange.300" : "border.subtle"} borderRadius="lg" p={3} bg="bg.subtle" position="relative">
                {looking || !target ? <Spinner size="sm" /> : <TargetPreview target={target} />}
                {target?.kind === "unknown" && <Text fontSize="xs" color="orange.300" mt={2}>Vérifie le lien : cette page n'existe peut-être pas.</Text>}
              </Box>
            )}
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
                <Box mt={1.5} minW={0}>
                  {spot.target ? <TargetPreview target={spot.target} compact /> : <Text fontSize="xs" fontWeight="semibold" noOfLines={1}>{spot.path}</Text>}
                  <Text fontSize="2xs" color="text.muted" noOfLines={1} mt={1} title={spot.hint}>🎁 {spot.hint}</Text>
                </Box>
              ) : <Text fontSize="xs" color="text.muted" mt={1.5}>Pas de cadeau</Text>}
            </Box>
          );
        })}
      </Grid>
      {open && <SpotModal key={open} eventId={event._id} day={open} opensAt={opensAt(open)} current={byDay.get(open)} onClose={() => setOpen(null)} />}
    </VStack>
  );
};
