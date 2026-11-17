import { useEffect, useState } from "react";
import {
  Alert, AlertIcon, Badge, Box, Button, ButtonGroup, Flex, FormControl, FormHelperText, FormLabel, Grid, HStack, Image, Input,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Slider, SliderFilledTrack,
  SliderThumb, SliderTrack, Spinner, Table, Tbody, Td, Text, Textarea, Th, Thead, Tr, VStack, useToast,
} from "@chakra-ui/react";
import { useAdventCaseAnswers, useAdventCases, useCharacters, useEventAdminActions } from "@/hooks/useAPI";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { bucketUrl } from "@/utils/apiRequest";
import { characterImageUrl } from "@/utils/characterImages";
import type { ClueType, IAdventCase, IAdventCharacter, IClueSettings, ISiteEvent } from "@/interfaces";

const CLUE_LABELS: Record<ClueType, string> = { silhouette: "Silhouette", zoom: "Zoom", blur: "Flou", quote: "Citation" };
const DEFAULT_SETTINGS: IClueSettings = { x: 0.5, y: 0.3, scale: 3, blur: 18 };
const formatDay = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

const SettingSlider = ({ label, value, min, max, step, onChange, hint }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; hint?: string;
}) => (
  <FormControl>
    <FormLabel fontSize="sm" mb={1}>{label}</FormLabel>
    <Slider value={value} min={min} max={max} step={step} onChange={onChange} colorScheme="purple">
      <SliderTrack><SliderFilledTrack /></SliderTrack>
      <SliderThumb />
    </Slider>
    {hint && <FormHelperText mt={0}>{hint}</FormHelperText>}
  </FormControl>
);

const CharacterSearch = ({ onPick }: { onPick: (c: IAdventCharacter) => void }) => {
  const [search, setSearch] = useState("");
  const { characters, isLoading } = useCharacters({ searchQuery: search.trim().length >= 2 ? search.trim() : undefined, limit: 8 });
  return (
    <Box>
      <Input value={search} placeholder="Chercher un perso (nom, version…)" onChange={(e) => setSearch(e.target.value)} />
      {search.trim().length >= 2 && (
        <VStack align="stretch" spacing={1} mt={2} maxH="220px" overflowY="auto">
          {isLoading && <Spinner size="sm" />}
          {characters.map((c) => (
            <HStack key={c._id} as="button" type="button" onClick={() => { onPick({ _id: c._id, name: c.name, version_name: c.version_name ?? null, images_version: c.images_version }); setSearch(""); }} p={1.5} borderRadius="md" _hover={{ bg: "bg.subtle" }} textAlign="left">
              <Image src={characterImageUrl(c, "thumb")} alt="" boxSize="32px" borderRadius="sm" />
              <Text fontSize="sm">{c.name}{c.version_name ? ` · ${c.version_name}` : ""}</Text>
            </HStack>
          ))}
        </VStack>
      )}
    </Box>
  );
};

const CaseAnswers = ({ eventId, day }: { eventId: string; day: number }) => {
  const { data: list = [], isLoading } = useAdventCaseAnswers(eventId, day);
  const actions = useEventAdminActions();
  const toast = useToast();
  const review = async (id: string, accept: boolean) => {
    try {
      await actions.reviewAdventAnswer(id, accept);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    }
  };
  if (isLoading) return <Spinner size="sm" />;
  if (!list.length) return <Text fontSize="sm" color="text.muted">Aucune réponse pour l'instant.</Text>;
  return (
    <Table size="sm">
      <Thead><Tr><Th>Joueur</Th><Th>Réponse</Th><Th>Résultat</Th></Tr></Thead>
      <Tbody>
        {list.map((a) => (
          <Tr key={a._id}>
            <Td>{a.bbs_name ?? a.user_name ?? "Joueur"}{a.late && <Badge ml={2} colorScheme="gray">en retard</Badge>}</Td>
            <Td>{a.answer}</Td>
            <Td>
              {a.status === "pending" && !a.reviewed ? (
                <HStack spacing={1}>
                  <Button size="xs" colorScheme="green" onClick={() => review(a._id, true)}>Accepter</Button>
                  <Button size="xs" variant="outline" onClick={() => review(a._id, false)}>Refuser</Button>
                </HStack>
              ) : (
                <Badge colorScheme={a.status === "correct" || a.accepted ? "green" : "red"}>
                  {a.status === "correct" ? "Juste" : a.accepted ? "Accepté à la main" : a.reviewed ? "Refusé" : "Faux"}
                </Badge>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const CaseModal = ({ eventId, day, opensAt, current, onClose }: {
  eventId: string; day: number; opensAt: string; current?: IAdventCase; onClose: () => void;
}) => {
  const actions = useEventAdminActions();
  const toast = useToast();
  const [character, setCharacter] = useState<IAdventCharacter | null>(current?.character ?? null);
  const [clueType, setClueType] = useState<ClueType>(current?.clue_type ?? "silhouette");
  const [settings, setSettings] = useState<IClueSettings>(current?.settings ?? DEFAULT_SETTINGS);
  const [quote, setQuote] = useState(current?.clue_text ?? "");
  const [accepted, setAccepted] = useState((current?.accepted ?? []).join("\n"));
  const [hasArtwork, setHasArtwork] = useState(true);
  const [saved, setSaved] = useState<IAdventCase | undefined>(current);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // A newly picked character brings its names and its quote
  const pick = async (next: IAdventCharacter) => {
    setCharacter(next);
    try {
      const info = await actions.adventCharacterInfo(next._id);
      setAccepted(info.accepted.join("\n"));
      setQuote(info.quote ?? "");
      setHasArtwork(info.has_artwork);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    }
  };
  const random = async () => {
    try {
      await pick(await actions.randomAdventCharacter(eventId));
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    }
  };
  useEffect(() => {
    if (current?.character_id) actions.adventCharacterInfo(current.character_id).then((info) => setHasArtwork(info.has_artwork)).catch(() => undefined);
  }, [current?.character_id, actions]);

  const save = async () => {
    if (!character) return;
    setSaving(true);
    try {
      const result = await actions.saveAdventCase(eventId, day, {
        character_id: character._id,
        clue_type: clueType,
        settings,
        clue_text: clueType === "quote" ? quote : null,
        accepted: accepted.split("\n").map((a) => a.trim()).filter(Boolean),
      });
      setSaved({ ...result, character } as IAdventCase);
      toast({ status: "success", title: `Case ${day} enregistrée` });
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    setDeleting(true);
    try {
      await actions.deleteAdventCase(eventId, day);
      onClose();
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };
  const set = (changes: Partial<IClueSettings>) => setSettings({ ...settings, ...changes });

  return (
    <Modal isOpen onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Case {day}
          <Text fontSize="sm" fontWeight="normal" color="text.muted">S'ouvre le {formatDay(opensAt)} à {new Date(opensAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel>Perso à deviner</FormLabel>
                {character && (
                  <HStack mb={2} p={2} bg="bg.subtle" borderRadius="lg">
                    <Image src={characterImageUrl(character, "thumb")} alt="" boxSize="40px" borderRadius="md" />
                    <Text fontWeight="semibold" fontSize="sm">{character.version ?? character.name}</Text>
                  </HStack>
                )}
                <HStack align="start">
                  <Box flex={1}><CharacterSearch onPick={pick} /></Box>
                  <Button onClick={random} variant="outline">Au hasard</Button>
                </HStack>
                {!hasArtwork && clueType !== "quote" && <FormHelperText color="orange.400">Ce perso n'a pas d'artwork du jeu : choisis l'indice « Citation » ou un autre perso.</FormHelperText>}
              </FormControl>
              <FormControl>
                <FormLabel>Indice</FormLabel>
                <ButtonGroup size="sm" isAttached variant="outline">
                  {(Object.keys(CLUE_LABELS) as ClueType[]).map((type) => (
                    <Button key={type} onClick={() => setClueType(type)} colorScheme={clueType === type ? "purple" : "gray"} variant={clueType === type ? "solid" : "outline"}>
                      {CLUE_LABELS[type]}
                    </Button>
                  ))}
                </ButtonGroup>
              </FormControl>
              {clueType === "zoom" && (
                <VStack align="stretch" spacing={3}>
                  <SettingSlider label="Grossissement" value={settings.scale} min={1.5} max={8} step={0.5} onChange={(v) => set({ scale: v })} hint={`× ${settings.scale}`} />
                  <SettingSlider label="Position horizontale" value={settings.x} min={0} max={1} step={0.05} onChange={(v) => set({ x: v })} hint="Gauche → droite" />
                  <SettingSlider label="Position verticale" value={settings.y} min={0} max={1} step={0.05} onChange={(v) => set({ y: v })} hint="Haut → bas" />
                </VStack>
              )}
              {clueType === "blur" && (
                <SettingSlider label="Force du flou" value={settings.blur} min={4} max={60} step={2} onChange={(v) => set({ blur: v })} hint="Plus c'est haut, plus c'est dur" />
              )}
              {clueType === "quote" && (
                <FormControl>
                  <FormLabel>Citation affichée</FormLabel>
                  <Textarea rows={3} value={quote} onChange={(e) => setQuote(e.target.value)} />
                  <FormHelperText>Vérifie qu'elle ne donne pas le nom du perso.</FormHelperText>
                </FormControl>
              )}
              <FormControl>
                <FormLabel>Réponses acceptées</FormLabel>
                <Textarea rows={5} value={accepted} onChange={(e) => setAccepted(e.target.value)} fontSize="sm" />
                <FormHelperText>Une par ligne. Majuscules, accents et petites fautes sont tolérés ; une réponse proche attend ta validation.</FormHelperText>
              </FormControl>
            </VStack>
            <VStack align="stretch" spacing={3}>
              <Text fontWeight="semibold">Ce que verront les joueurs</Text>
              {saved?.clue_type === "quote" ? (
                <Box bg="bg.subtle" borderRadius="lg" p={4} fontStyle="italic">« {saved.clue_text} »</Box>
              ) : saved?.clue_path ? (
                <Box bg="bg.subtle" borderRadius="lg" p={3} display="grid" placeItems="center">
                  <Image src={`${bucketUrl}/${saved.clue_path}`} alt="Indice" maxH="320px" objectFit="contain" />
                </Box>
              ) : (
                <Text fontSize="sm" color="text.muted">Enregistre la case pour générer l'indice.</Text>
              )}
              <Text fontSize="xs" color="text.muted">L'image est générée par le serveur sous un nom aléatoire : elle ne permet pas de retrouver le perso.</Text>
              {saved && (
                <Box mt={2}>
                  <Text fontWeight="semibold" mb={2}>Réponses des joueurs</Text>
                  <CaseAnswers eventId={eventId} day={day} />
                </Box>
              )}
            </VStack>
          </Grid>
        </ModalBody>
        <ModalFooter gap={2}>
          {saved && <Button variant="ghost" colorScheme="red" mr="auto" onClick={() => setConfirmDelete(true)}>Vider la case</Button>}
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
          <Button colorScheme="purple" onClick={save} isLoading={saving} isDisabled={!character}>Enregistrer et générer l'indice</Button>
        </ModalFooter>
      </ModalContent>
      <DeleteConfirmationModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        isDeleting={deleting}
        title={`Vider la case ${day}`}
        description="Le perso et l'indice de cette case seront retirés. Impossible si des joueurs ont déjà répondu."
        itemDetails={character?.version ?? character?.name}
      />
    </Modal>
  );
};

// Admin of the advent calendar of an event: what each case hides and the answers to check
export const AdventEditor = ({ event }: { event: ISiteEvent }) => {
  const { data, isLoading } = useAdventCases(event._id);
  const [open, setOpen] = useState<number | null>(null);
  if (isLoading || !data) return <Spinner />;
  const byDay = new Map(data.cases.map((c) => [c.day, c]));
  const opensAt = (day: number) => new Date(new Date(event.start_at).getTime() + (day - 1) * 86400000).toISOString();
  const pending = data.cases.reduce((sum, c) => sum + c.pending, 0);
  return (
    <VStack align="stretch" spacing={3}>
      <Flex justify="space-between" align="center" gap={3} wrap="wrap">
        <Text fontSize="sm" color="text.muted">
          {data.cases.length} / {data.days} cases prêtes · {data.advent.points} points par case (moitié en retard)
        </Text>
        {pending > 0 && <Badge colorScheme="orange">{pending} réponse{pending > 1 ? "s" : ""} à vérifier</Badge>}
      </Flex>
      {data.days < data.advent.days && (
        <Alert status="warning" borderRadius="lg"><AlertIcon />L'événement est trop court pour {data.advent.days} cases : seules les {data.days} premières s'ouvriront.</Alert>
      )}
      <Grid templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)", xl: "repeat(6, 1fr)" }} gap={2}>
        {Array.from({ length: data.days }, (_, i) => i + 1).map((day) => {
          const item = byDay.get(day);
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
              borderColor={item ? "purple.300" : "border.subtle"}
              borderStyle={item ? "solid" : "dashed"}
              bg="bg.card"
              _hover={{ bg: "bg.subtle" }}
            >
              <Flex justify="space-between" align="center">
                <Text fontWeight="extrabold">{day}</Text>
                {item && item.pending > 0 && <Badge colorScheme="orange">{item.pending}</Badge>}
              </Flex>
              <Text fontSize="xs" color="text.muted">{formatDay(opensAt(day))}</Text>
              {item?.character ? (
                <HStack mt={1.5} spacing={1.5}>
                  <Image src={characterImageUrl(item.character, "thumb")} alt="" boxSize="24px" borderRadius="sm" />
                  <Box minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" noOfLines={1}>{item.character.name}</Text>
                    <Text fontSize="2xs" color="text.muted">{CLUE_LABELS[item.clue_type]} · {item.answers} rép.</Text>
                  </Box>
                </HStack>
              ) : <Text fontSize="xs" color="text.muted" mt={1.5}>À remplir</Text>}
            </Box>
          );
        })}
      </Grid>
      {open && <CaseModal key={open} eventId={event._id} day={open} opensAt={opensAt(open)} current={byDay.get(open)} onClose={() => setOpen(null)} />}
    </VStack>
  );
};
