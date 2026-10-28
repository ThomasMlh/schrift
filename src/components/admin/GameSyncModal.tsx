import {
  Alert, AlertIcon, Badge, Box, Button, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
  ModalOverlay, SimpleGrid, Stat, StatLabel, StatNumber, Text, VStack, Wrap, WrapItem,
} from "@chakra-ui/react";
import type { IGameSyncEntry, IGameSyncResult } from "@/types/character";

const FIELD_LABELS: Record<string, string> = {
  game_id: "lien au jeu", resource_2d_id: "visuel", identity: "identité", name: "nom", names: "noms", short_names: "noms courts",
  game_version: "version", affinity: "affinité", killers: "killers", categories: "catégories", is_growth_event: "event de croissance",
  stats: "stats", base_stats: "stats de base", stats_tiers: "paliers de stats", traits: "traits", special: "spécial",
  profile: "profil", filter_types: "filtres", resurrection: "résurrection", attack_type: "type d'attaque",
  release_date: "date de sortie", resurrection_release: "date de résurrection",
};

const entryLabel = (e: IGameSyncEntry) => `${e.name}${e.version ? ` · ${e.version}` : ""}${e.game_id ? ` (#${e.game_id})` : ""}`;

const List = ({ title, items }: { title: string; items: string[] }) => (items.length === 0 ? null : (
  <Box>
    <Text fontSize="sm" fontWeight="semibold" color="text.strong" mb={1}>{title}</Text>
    <VStack align="stretch" spacing={0.5} maxH="160px" overflowY="auto" pl={2}>
      {items.map((item, i) => <Text key={i} fontSize="xs" color="text.secondary">{item}</Text>)}
    </VStack>
  </Box>
));

// Simulation of a sync from the game tables, applied only on "Appliquer"
export const GameSyncModal = ({ preview, isOpen, onClose, onApply, isApplying }: {
  preview: IGameSyncResult | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  isApplying: boolean;
}) => {
  if (!preview) return null;
  const { statistics: stats, preview: details, fieldCounts } = preview;
  const fields = Object.entries(fieldCounts).sort((a, b) => b[1] - a[1]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Synchroniser depuis les tables du jeu</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between" wrap="wrap" gap={2}>
              <Text fontSize="sm" color="text.muted">Simulation : rien n'a encore été modifié.</Text>
              <HStack spacing={1}>
                <Text fontSize="xs" color="text.muted">Langues :</Text>
                {preview.languages.map((lang) => <Badge key={lang} colorScheme="purple">{lang}</Badge>)}
              </HStack>
            </HStack>
            <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
              <Stat><StatLabel>Reliés au jeu</StatLabel><StatNumber>{stats.linked}</StatNumber></Stat>
              <Stat><StatLabel>Mis à jour</StatLabel><StatNumber>{stats.updated}</StatNumber></Stat>
              <Stat><StatLabel>Nouveaux</StatLabel><StatNumber>{stats.created}</StatNumber></Stat>
              <Stat>
                <StatLabel>Images à envoyer</StatLabel>
                <StatNumber>{stats.newImages + (stats.bannerImages ?? 0) + (stats.accessoryImages ?? 0)}</StatNumber>
                {(stats.bannerImages ?? 0) > 0 && <Text fontSize="xs" color="text.muted">dont {stats.bannerImages} visuel(s) de loterie</Text>}
                {(stats.accessoryImages ?? 0) > 0 && <Text fontSize="xs" color="text.muted">dont {stats.accessoryImages} accessoire(s)</Text>}
              </Stat>
              <Stat><StatLabel>Doublons à fusionner</StatLabel><StatNumber>{stats.duplicates}</StatNumber></Stat>
              <Stat><StatLabel>Non reliés</StatLabel><StatNumber>{stats.unmatched + stats.ambiguous}</StatNumber></Stat>
            </SimpleGrid>
            {stats.firstLinks > 0 && (
              <Alert status="info" borderRadius="md" fontSize="sm">
                <AlertIcon />
                {stats.firstLinks} personnage(s) seront reliés au jeu pour la première fois. Ils gardent leur identifiant : albums, builds et images restent valides.
              </Alert>
            )}
            {(stats.newBanners ?? 0) > 0 && (
              <Text fontSize="sm" color="text.secondary">
                {stats.newBanners} nouvelle(s) invocation(s) sur {stats.banners}. Leurs visuels seront archivés sur le bucket.
              </Text>
            )}
            {(stats.newAccessories ?? 0) > 0 && (
              <Text fontSize="sm" color="text.secondary">
                {stats.newAccessories} nouvel(s) accessoire(s) sur {stats.accessories}, dans leur version la plus forte (5★+ quand elle existe).
              </Text>
            )}
            {(stats.legacyAccessories ?? 0) > 0 && (
              <Alert status="warning" borderRadius="md" fontSize="sm">
                <AlertIcon />
                {stats.legacyAccessories} ancien(s) accessoire(s) et sous-effet(s) du site seront supprimés : ils sont remplacés par ceux du jeu.
              </Alert>
            )}
            {(stats.newSkills ?? 0) > 0 && (
              <Text fontSize="sm" color="text.secondary">
                {stats.newSkills} nouvelle(s) compétence(s) bonus sur {stats.skills}.
              </Text>
            )}
            {(stats.legacySkills ?? 0) > 0 && (
              <Alert status="warning" borderRadius="md" fontSize="sm">
                <AlertIcon />
                {stats.legacySkills} ancienne(s) compétence(s) bonus du site seront supprimées : elles sont remplacées par celles du jeu.
              </Alert>
            )}
            {(stats.legacyBanners ?? 0) > 0 && (
              <Alert status="warning" borderRadius="md" fontSize="sm">
                <AlertIcon />
                {stats.legacyBanners} ancienne(s) bannière(s) du site seront supprimées : elles sont remplacées par les invocations du jeu.
              </Alert>
            )}
            {stats.duplicates > 0 && (
              <Alert status="warning" borderRadius="md" fontSize="sm">
                <AlertIcon />
                {stats.duplicates} doublon(s) : leurs albums et builds seront reportés sur la fiche la plus ancienne, puis le doublon sera supprimé.
              </Alert>
            )}
            {fields.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="text.strong" mb={1}>Champs modifiés</Text>
                <Wrap spacing={1.5}>
                  {fields.map(([field, count]) => (
                    <WrapItem key={field}><Badge variant="subtle" textTransform="none">{FIELD_LABELS[field] ?? field} · {count}</Badge></WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}
            <List title="Nouveaux personnages" items={details.created.map(entryLabel)} />
            <List
              title="Personnages mis à jour (50 premiers)"
              items={details.updated.map((e) => `${entryLabel(e)} : ${e.changes.map((c) => FIELD_LABELS[c] ?? c).join(", ")}`)}
            />
            <List title="Introuvables dans le jeu (gardés tels quels)" items={details.unmatched.map(entryLabel)} />
            <List title="Plusieurs correspondances possibles (non reliés)" items={details.ambiguous.map((e) => `${entryLabel(e)} → #${e.candidates.join(", #")}`)} />
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button colorScheme="purple" onClick={onApply} isLoading={isApplying}>Appliquer</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
