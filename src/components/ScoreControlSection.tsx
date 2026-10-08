import {
  Alert, AlertIcon, Badge, Box, Button, Container, Flex, HStack, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay, NumberInput, NumberInputField, Skeleton, Tab, Table, TableContainer, TabList,
  TabPanel, TabPanels, Tabs, Tbody, Td, Text, Th, Thead, Tooltip, Tr, VStack, useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useGuilds, useScoreAnomalies, useScoreHistory } from "@/hooks/useAPI";
import { useScoreMutations } from "@/hooks/useAPIMutations";
import { useAuth } from "@/providers/AuthProvider";
import type { IScoreAnomaly, IScoreHistoryEntry, ScoreAnomalyType, ScoreHistoryAction } from "@/interfaces";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { AlterationImage } from "@/components/ui/AlterationImage";
import { Pagination } from "@/components/ui/Pagination";
import CustomLink from "@/components/ui/CustomLink";
import { buildPlayerUrl } from "@/utils/playerUrl";
import { MissingScoresPanel } from "@/components/scoreControl/MissingScoresPanel";

const formatScore = (n: number | undefined | null) => (n == null ? "—" : n.toLocaleString("fr-FR"));
const cycleLabel = (name: string | null, year: number | null, position: number | null) =>
  [[name, year].filter(Boolean).join(" "), position != null ? `R${position}` : null].filter(Boolean).join(" · ");

const ISSUE_LABELS: Record<ScoreAnomalyType, string> = {
  above_killer_record: "Au-dessus du record du killer",
  far_above_usual: "Très au-dessus de son habitude",
  far_below_usual: "Très en dessous de son habitude",
  missing_base: "Score de base manquant",
  same_value: "Même score qu'un autre joueur",
};

const issueDetail = (issue: IScoreAnomaly["issues"][number]) => {
  switch (issue.type) {
    case "above_killer_record":
      return `Meilleur score de tous les joueurs sur ce killer : ${formatScore(issue.reference)}`;
    case "far_above_usual":
    case "far_below_usual":
      return `Sa moyenne sur ce killer : ${formatScore(issue.reference)}`;
    case "missing_base":
      return "Rotation différentielle saisie sans le score de la rotation précédente : le score affiché vaut tout le cumul de la semaine. Saisis le score de base pour corriger.";
    case "same_value":
      return `Même score brut que : ${(issue.with ?? []).join(", ")}`;
  }
};

const ACTION_LABELS: Record<ScoreHistoryAction, { label: string; color: string }> = {
  create: { label: "Création", color: "green" },
  update: { label: "Modification", color: "blue" },
  delete: { label: "Suppression", color: "red" },
  transfer_account: { label: "Transfert de compte", color: "purple" },
  transfer_rotation: { label: "Transfert de rotation", color: "purple" },
  recalculate: { label: "Recalcul auto", color: "gray" },
};

const SOURCE_LABELS: Record<string, string> = { manual: "Manuel", bulk: "Saisie groupée", ocr: "OCR", auto: "Automatique" };

const ACTION_OPTIONS = [
  { value: "", label: "Toutes les actions" },
  ...Object.entries(ACTION_LABELS).map(([value, { label }]) => ({ value, label })),
];

// Espace chefs/admins : scores probablement mal saisis à vérifier, et historique de toutes les
// modifications de scores (qui, quand, avant/après). Un chef ne voit que ses guildes.
const ScoreControlSection = () => {
  const { isAdmin, managedGuildIds } = useAuth();
  const { guilds } = useGuilds(true);
  const toast = useToast();
  const { updateScore, reviewScoreAnomaly } = useScoreMutations();

  const [guildId, setGuildId] = useState("");
  const [action, setAction] = useState<ScoreHistoryAction | "">("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<IScoreAnomaly | null>(null);
  const [newScore, setNewScore] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const { anomalies, isLoading: anomaliesLoading, error: anomaliesError } = useScoreAnomalies(guildId || undefined);
  const { entries, pagination, isLoading: historyLoading, error: historyError } = useScoreHistory({
    guildId: guildId || undefined, action: action || undefined, page,
  });

  const cardBg = "bg.card";
  const border = "border.subtle";
  const mutedText = "text.muted";
  const headerBg = "bg.subtle";

  const selectableGuilds = isAdmin
    ? guilds.filter((g) => !g.disabled)
    : guilds.filter((g) => managedGuildIds.includes(g._id));
  const guildOptions = [
    { value: "", label: isAdmin ? "Toutes les guildes" : "Toutes mes guildes" },
    ...selectableGuilds.map((g) => ({ value: g._id, label: g.name })),
  ];
  // Les scores manquants portent sur une seule guilde : celle choisie, ou la seule gérée par le chef
  const singleGuildId = guildId || (selectableGuilds.length === 1 ? selectableGuilds[0]._id : "");

  const handleReview = async (anomaly: IScoreAnomaly) => {
    setBusyId(anomaly.score_id);
    try {
      await reviewScoreAnomaly(anomaly.score_id);
      toast({ title: "Score marqué comme vérifié", status: "success", duration: 2500 });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Erreur", status: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const openCorrection = (anomaly: IScoreAnomaly) => {
    setEditing(anomaly);
    setNewScore(String(anomaly.score));
  };

  const handleCorrection = async () => {
    if (!editing) return;
    const value = parseInt(newScore.replace(/\s/g, ""), 10);
    if (isNaN(value) || value < 0) {
      toast({ title: "Score invalide", status: "error" });
      return;
    }
    setBusyId(editing.score_id);
    try {
      await updateScore(editing.score_id, { score: value });
      toast({ title: "Score corrigé", status: "success", duration: 2500 });
      setEditing(null);
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Erreur lors de la correction", status: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const renderKiller = (killer: string | null, attack: string | null, alteration?: string | null) => (
    <HStack spacing={2}>
      {attack && <AttackTypeBadge attackType={attack} size="12px" />}
      <Text fontWeight="medium">{killer ?? "—"}</Text>
      {alteration && <AlterationImage alteration={alteration} size="18px" />}
    </HStack>
  );

  const renderAnomaly = (anomaly: IScoreAnomaly) => (
    <Box key={anomaly.score_id} bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="lg" p={4}>
      <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={3} direction={{ base: "column", md: "row" }}>
        <VStack align="start" spacing={1} minW={0}>
          <HStack spacing={2} wrap="wrap">
            <CustomLink
              to={buildPlayerUrl(anomaly.bbs_name, anomaly.bbs_id)}
              text={anomaly.bbs_name || anomaly.bbs_id}
              textSize="sm"
              sx={{ fontWeight: "semibold" }}
            />
            {anomaly.guild_name && (
              <Badge colorScheme="purple" variant="subtle" fontSize="xs" borderRadius="full" px={2}>{anomaly.guild_name}</Badge>
            )}
          </HStack>
          <HStack spacing={3} fontSize="sm" wrap="wrap">
            {renderKiller(anomaly.killer, anomaly.attack, anomaly.alteration)}
            <Text color={mutedText}>{cycleLabel(anomaly.cycle_name, anomaly.cycle_year, anomaly.rotation_position)}</Text>
            <Text fontWeight="bold">{formatScore(anomaly.score)}</Text>
          </HStack>
          <VStack align="start" spacing={0.5} pt={1}>
            {anomaly.issues.map((issue) => (
              <Text key={issue.type} fontSize="sm">
                ⚠️ <b>{ISSUE_LABELS[issue.type]}</b> <Text as="span" color={mutedText}>— {issueDetail(issue)}</Text>
              </Text>
            ))}
          </VStack>
        </VStack>
        <HStack spacing={2} flexShrink={0}>
          <Button size="sm" colorScheme="blue" onClick={() => openCorrection(anomaly)} isDisabled={busyId === anomaly.score_id}>
            Corriger
          </Button>
          <Tooltip label="Le score est correct : il ne sera plus signalé tant que sa valeur ne change pas" hasArrow>
            <Button size="sm" variant="outline" onClick={() => handleReview(anomaly)} isLoading={busyId === anomaly.score_id}>
              C'est correct
            </Button>
          </Tooltip>
        </HStack>
      </Flex>
    </Box>
  );

  const scoreChange = (entry: IScoreHistoryEntry) => {
    const before = entry.before?.score;
    const after = entry.after?.score;
    if (entry.action === "create") return <Text as="span" fontWeight="semibold">{formatScore(after)}</Text>;
    if (entry.action === "delete") return <Text as="span" textDecoration="line-through" color={mutedText}>{formatScore(before)}</Text>;
    const accountChanged = entry.before?.bbs_id && entry.after?.bbs_id && entry.before.bbs_id !== entry.after.bbs_id;
    return (
      <VStack align="end" spacing={0}>
        <Text as="span">
          {before !== after ? <>{formatScore(before)} → <b>{formatScore(after)}</b></> : formatScore(after)}
        </Text>
        {accountChanged && (
          <Text as="span" fontSize="xs" color={mutedText}>{entry.before?.bbs_name ?? entry.before?.bbs_id} → {entry.after?.bbs_name ?? entry.after?.bbs_id}</Text>
        )}
      </VStack>
    );
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={5} align="stretch">
        <Flex justify="space-between" align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="extrabold" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text" letterSpacing="tight">
              Contrôle des scores
            </Text>
            <Text fontSize="sm" color={mutedText} maxW="2xl">
              Repère les scores probablement mal saisis ou pas encore saisis, et consulte l'historique de toutes les modifications.
              Visible uniquement par les chefs, sous-chefs et admins.
            </Text>
          </VStack>
          {guildOptions.length > 2 && (
            <Box minW={{ md: "260px" }}>
              <CustomSelect value={guildId} onChange={(v) => { setGuildId(v); setPage(1); }} options={guildOptions} allowDeselect={false} size="md" />
            </Box>
          )}
        </Flex>

        <Tabs variant="soft-rounded" colorScheme="purple" isLazy>
          <TabList>
            <Tab>⚠️ À vérifier{anomalies.length > 0 ? ` (${anomalies.length})` : ""}</Tab>
            <Tab>📝 Manquants</Tab>
            <Tab>📜 Historique</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              <Text fontSize="sm" color={mutedText} mb={3}>
                Scores des 2 derniers cycles qui ressemblent à une erreur de saisie : chiffre en trop ou en moins,
                score de base de la semaine manquant, ou même score copié pour plusieurs joueurs.
              </Text>
              {anomaliesLoading ? (
                <VStack spacing={3} align="stretch">{[0, 1, 2].map((i) => <Skeleton key={i} h="110px" borderRadius="lg" />)}</VStack>
              ) : anomaliesError ? (
                <Alert status="error" borderRadius="md"><AlertIcon />Impossible de charger les scores à vérifier.</Alert>
              ) : anomalies.length === 0 ? (
                <Alert status="success" borderRadius="md"><AlertIcon />Aucun score suspect 👍</Alert>
              ) : (
                <VStack spacing={3} align="stretch">{anomalies.map(renderAnomaly)}</VStack>
              )}
            </TabPanel>

            <TabPanel px={0}>
              <MissingScoresPanel guildId={singleGuildId} />
            </TabPanel>

            <TabPanel px={0}>
              <Flex justify="flex-end" mb={3}>
                <Box minW={{ base: "100%", md: "240px" }}>
                  <CustomSelect
                    value={action}
                    onChange={(v) => { setAction(v as ScoreHistoryAction | ""); setPage(1); }}
                    options={ACTION_OPTIONS}
                    allowDeselect={false}
                    size="sm"
                  />
                </Box>
              </Flex>
              {historyLoading && entries.length === 0 ? (
                <Skeleton h="300px" borderRadius="lg" />
              ) : historyError ? (
                <Alert status="error" borderRadius="md"><AlertIcon />Impossible de charger l'historique.</Alert>
              ) : entries.length === 0 ? (
                <Alert status="info" borderRadius="md"><AlertIcon />Aucune modification enregistrée pour l'instant.</Alert>
              ) : (
                <VStack spacing={3} align="stretch">
                  <TableContainer bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="lg">
                    <Table size="sm">
                      <Thead bg={headerBg}>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Action</Th>
                          <Th>Joueur</Th>
                          <Th>Rotation</Th>
                          <Th isNumeric>Score</Th>
                          <Th>Par</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {entries.map((entry) => (
                          <Tr key={entry._id}>
                            <Td color={mutedText} whiteSpace="nowrap">
                              {new Date(entry.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                            </Td>
                            <Td>
                              <Badge colorScheme={ACTION_LABELS[entry.action]?.color ?? "gray"} variant="subtle">
                                {ACTION_LABELS[entry.action]?.label ?? entry.action}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontWeight="medium">{entry.bbs_name || entry.bbs_id || "—"}</Text>
                              {entry.guild_name && <Text fontSize="xs" color={mutedText}>{entry.guild_name}</Text>}
                            </Td>
                            <Td>
                              {renderKiller(entry.killer, entry.attack)}
                              <Text fontSize="xs" color={mutedText}>{cycleLabel(entry.cycle_name, entry.cycle_year, entry.rotation_position)}</Text>
                            </Td>
                            <Td isNumeric>{scoreChange(entry)}</Td>
                            <Td>
                              <Text>{entry.by_name ?? (entry.source === "auto" ? "Automatique" : "—")}</Text>
                              {entry.source !== "auto" && (
                                <Text fontSize="xs" color={mutedText}>{SOURCE_LABELS[entry.source] ?? entry.source}</Text>
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  {pagination && (
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      hasPrevPage={pagination.hasPrevPage}
                      hasNextPage={pagination.hasNextPage}
                      onPageChange={setPage}
                      totalCount={pagination.totalCount}
                      itemsOnPage={pagination.itemsOnPage}
                    />
                  )}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Corriger le score</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editing && (
              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm">
                  <b>{editing.bbs_name || editing.bbs_id}</b> — {editing.killer ?? "—"} ·{" "}
                  {cycleLabel(editing.cycle_name, editing.cycle_year, editing.rotation_position)}
                </Text>
                <Text fontSize="sm" color={mutedText}>
                  Score actuel : {formatScore(editing.score)}
                  {editing.is_differential && " (points de cette rotation seule, hors cumul de la semaine)"}
                </Text>
                <NumberInput value={newScore} onChange={(v) => setNewScore(v)} min={0}>
                  <NumberInputField placeholder="Nouveau score" autoFocus />
                </NumberInput>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setEditing(null)}>Annuler</Button>
            <Button colorScheme="blue" onClick={handleCorrection} isLoading={!!editing && busyId === editing.score_id}>
              Enregistrer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ScoreControlSection;
