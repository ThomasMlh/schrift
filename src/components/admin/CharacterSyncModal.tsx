import {
  Alert, AlertIcon, Badge, Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
  ModalOverlay, SimpleGrid, Stat, StatLabel, StatNumber, Text, VStack,
} from "@chakra-ui/react";
import type { ICharacterSyncResult } from "@/types/character";

const TARGET_LABELS: Record<string, string> = {
  thumbnail: "miniature", artwork: "artwork", quote: "phrase FR", quote_en: "phrase EN", attack: "attaque",
};

const List = ({ title, items }: { title: string; items: string[] }) => (items.length === 0 ? null : (
  <Box>
    <Text fontSize="sm" fontWeight="semibold" color="text.strong" mb={1}>{title}</Text>
    <VStack align="stretch" spacing={0.5} maxH="160px" overflowY="auto" pl={2}>
      {items.map((item, i) => <Text key={i} fontSize="xs" color="text.secondary">{item}</Text>)}
    </VStack>
  </Box>
));

// Result of a dry run, so the admin sees what the sync will create before applying it
export const CharacterSyncModal = ({ preview, isOpen, onClose, onApply, isApplying }: {
  preview: ICharacterSyncResult | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  isApplying: boolean;
}) => {
  if (!preview) return null;
  const { statistics: stats, preview: details } = preview;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Synchroniser les personnages</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Text fontSize="sm" color="text.muted">
              Simulation sur le fichier actuel : rien n'a encore été modifié.
            </Text>
            <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={3}>
              <Stat><StatLabel>Nouveaux</StatLabel><StatNumber>{stats.inserted}</StatNumber></Stat>
              <Stat><StatLabel>Mis à jour</StatLabel><StatNumber>{stats.updated}</StatNumber></Stat>
              <Stat><StatLabel>Renommés</StatLabel><StatNumber>{stats.renamed}</StatNumber></Stat>
              <Stat><StatLabel>Images à refaire</StatLabel><StatNumber>{stats.imagesChanged ?? 0}</StatNumber></Stat>
            </SimpleGrid>
            {(stats.silhouettes ?? 0) > 0 && (
              <Text fontSize="sm" color="text.secondary">
                {stats.silhouettes} personnage(s) avec une silhouette : elle sera fusionnée sur l'artwork.
              </Text>
            )}
            {stats.inserted > 20 && (
              <Alert status="warning" borderRadius="md" fontSize="sm">
                <AlertIcon />
                Beaucoup de nouveaux personnages : vérifie qu'ils n'existent pas déjà sous un autre « Nom de recherche ».
              </Alert>
            )}
            {details && (
              <>
                <List title="Nouveaux personnages" items={details.inserted.map((c) => `${c.name || "?"} · ${c.search_name}`)} />
                <List title="Renommés (même miniature, retrouvés sans doublon)" items={details.renamed.map((c) => `${c.previous} → ${c.search_name}`)} />
                <List
                  title="Images modifiées"
                  items={details.images.map((c) => `${c.name || c.search_name} : ${c.targets.map((t) => TARGET_LABELS[t] ?? t).join(", ")}`)}
                />
                {details.duplicates.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="text.strong" mb={1}>
                      En double dans le fichier <Badge colorScheme="orange" ml={1}>la dernière ligne gagne</Badge>
                    </Text>
                    <Text fontSize="xs" color="text.secondary" pl={2}>
                      {details.duplicates.map((d) => `${d.search_name} (×${d.count})`).join(" · ")}
                    </Text>
                  </Box>
                )}
              </>
            )}
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
