import {
  Alert, AlertIcon, Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  SimpleGrid, Stat, StatHelpText, StatLabel, StatNumber, Text, VStack, Wrap, WrapItem, Badge,
} from "@chakra-ui/react";
import type { IBotDatabaseResult } from "@/types/character";

const REASONS: Record<IBotDatabaseResult["preview"]["unresolved"][number]["reason"], string> = {
  none: "aucun perso ne correspond",
  several: "plusieurs persos possibles",
  duplicate: "perso déjà relié à une autre ligne",
};

const METHODS: Record<IBotDatabaseResult["preview"]["updated"][number]["method"], string> = {
  id: "par ID",
  search_name: "par nom de recherche",
  identity: "par nom, affinité et date",
};

const List = ({ title, items }: { title: string; items: string[] }) => (items.length === 0 ? null : (
  <Box>
    <Text fontSize="sm" fontWeight="semibold" color="text.strong" mb={1}>{title}</Text>
    <VStack align="stretch" spacing={0.5} maxH="180px" overflowY="auto" pl={2}>
      {items.map((item, i) => <Text key={i} fontSize="xs" color="text.secondary">{item}</Text>)}
    </VStack>
  </Box>
));

// Simulation of the filling of the bot database.json, written only on "Appliquer"
export const BotDatabaseModal = ({ preview, isOpen, onClose, onApply, isApplying }: {
  preview: IBotDatabaseResult | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  isApplying: boolean;
}) => {
  if (!preview) return null;
  const { statistics: stats, preview: details, fieldCounts } = preview;
  const upToDate = stats.updated === 0 && stats.rarities === 0;
  const fields = Object.entries(fieldCounts).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Compléter database.json du bot</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Text fontSize="sm" color="text.muted">
              Simulation : rien n'a encore été modifié. Les IDs du site et du jeu et les URL de nos images sont écrits dans chaque
              ligne reliée à un perso ; le reste du fichier ne change pas.
            </Text>
            <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
              <Stat><StatLabel>Lignes</StatLabel><StatNumber>{stats.rows}</StatNumber></Stat>
              <Stat>
                <StatLabel>Reliées à un perso</StatLabel>
                <StatNumber>{stats.matched}</StatNumber>
                {stats.matchedByIdentity > 0 && <StatHelpText mb={0}>dont {stats.matchedByIdentity} nouvelle(s)</StatHelpText>}
              </Stat>
              <Stat><StatLabel>À compléter</StatLabel><StatNumber>{stats.updated}</StatNumber></Stat>
              <Stat><StatLabel>Raretés à reprendre</StatLabel><StatNumber>{stats.rarities}</StatNumber></Stat>
            </SimpleGrid>

            {fields.length > 0 && (
              <Wrap spacing={1}>
                {fields.map(([field, count]) => (
                  <WrapItem key={field}><Badge colorScheme="purple" textTransform="none">{field} · {count}</Badge></WrapItem>
                ))}
              </Wrap>
            )}
            {upToDate && (
              <Alert status="success" borderRadius="md" fontSize="sm"><AlertIcon />Le fichier est déjà à jour.</Alert>
            )}
            {stats.unresolved > 0 && (
              <Alert status="warning" borderRadius="md" fontSize="sm">
                <AlertIcon />
                {stats.unresolved} ligne(s) sans perso certain : elles ne sont pas modifiées. Corrige leur nom de recherche ou ajoute
                leur « Base ID » à la main.
              </Alert>
            )}

            <List
              title="Lignes à compléter"
              items={details.updated.map((u) => `${u.label} (${METHODS[u.method]}) : ${u.fields.join(", ")}`)}
            />
            <List
              title="Lignes sans perso certain"
              items={details.unresolved.map((u) => `${u.label} : ${REASONS[u.reason]}${u.other ? ` (${u.other})` : ""}`)}
            />
            <List
              title="Persos du site sans ligne dans le fichier"
              items={details.missing.map((m) => `${m.name}${m.version ? ` · ${m.version}` : ""}`)}
            />
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
          <Button colorScheme="purple" onClick={onApply} isLoading={isApplying} isDisabled={upToDate}>
            Appliquer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
