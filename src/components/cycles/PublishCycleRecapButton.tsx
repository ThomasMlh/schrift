import {
  IconButton, Tooltip, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, VStack, Box, Text, ButtonGroup, Button, useToast,
  Checkbox, HStack, Skeleton, } from "@chakra-ui/react";
import { useState } from "react";
import type { ICycle, ICycleRecap, PodiumRankingType } from "@/interfaces";
import { useCycleRecapPreview, useGuilds } from "@/hooks/useAPI";
import { usePodiumMutations } from "@/hooks/useAPIMutations";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface PublishCycleRecapButtonProps {
  cycle: ICycle;
}

const RANKING_OPTIONS: { value: PodiumRankingType; label: string }[] = [
  { value: "average", label: "Moyenne" },
  { value: "max", label: "Max" },
  { value: "progression", label: "Progression" },
];

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const formatNumber = (n: number) => n.toLocaleString("fr-FR");
const formatPercent = (n: number) => `${n > 0 ? "+" : ""}${n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

const GOAL_LABELS: Record<string, string> = {
  average: "Moyenne de la guilde",
  clear_rate: "Taux de clear",
  records: "Records battus",
  participation: "Participation",
};
const ATTACK_EMOJIS: Record<string, string> = { R: "🔴", B: "🔵" };

const formatGoalValue = (value: number | null, unit: string) => {
  if (value == null) return "—";
  return unit === "percent" ? `${value.toLocaleString("fr-FR")} %` : formatNumber(value);
};

interface RecapPodiumProps<T> {
  title: string;
  players: T[];
  renderValue: (player: T) => React.ReactNode;
}

const RecapPodium = <T extends { rank: number; pseudo: string }>({ title, players, renderValue }: RecapPodiumProps<T>) => players.length > 0 && (
  <Box>
    <Text fontWeight="semibold">{title}</Text>
    {players.map((player) => (
      <Text key={`${player.rank}-${player.pseudo}`}>{MEDALS[player.rank] ?? "•"} <b>{player.pseudo}</b> — {renderValue(player)}</Text>
    ))}
  </Box>
);

// Text preview of the recap, showing the same sections as the embed sent by the bot (format_cycle_recap).
const RecapPreview = ({ recap }: { recap: ICycleRecap }) => {
  const evolution = recap.guild_average != null && recap.previous_guild_average
    ? ((recap.guild_average - recap.previous_guild_average) / recap.previous_guild_average) * 100
    : null;
  const hiddenRecords = recap.records_count - recap.records.length;
  const achievedGoals = recap.goals.filter((goal) => goal.achieved).length;

  return (
    <VStack align="stretch" spacing={2} fontSize="sm">
      <Text fontWeight="bold">📊 Fin du {recap.cycle_name} {recap.cycle_year} · {recap.participants} joueur(s)</Text>
      {recap.top3.length === 0 && (
        <Text color="gray.500">Aucun score enregistré pour cette guilde sur ce cycle.</Text>
      )}
      <RecapPodium title="Podium (moyenne)" players={recap.top3} renderValue={(player) => formatNumber(player.average)} />
      <RecapPodium title="Podium (max)" players={recap.top3_max} renderValue={(player) => formatNumber(player.total)} />
      <RecapPodium
        title="🚀 Podium (progression)"
        players={recap.top3_progression}
        renderValue={(player) => (
          <>{formatNumber(player.previous_average)} → <b>{formatNumber(player.average)}</b> <i>({formatPercent(player.percent)})</i></>
        )}
      />
      {recap.guild_average != null && (
        <Box>
          <Text fontWeight="semibold">Moyenne de la guilde</Text>
          <Text>
            <b>{formatNumber(recap.guild_average)}</b>
            {evolution != null && recap.previous_guild_average != null
              && ` ${evolution > 0 ? "📈" : evolution < 0 ? "📉" : "➖"} ${formatPercent(evolution)} vs ${recap.previous_cycle_name ?? "cycle précédent"} (${formatNumber(recap.previous_guild_average)})`}
          </Text>
        </Box>
      )}
      {recap.records_count > 0 && (
        <Box>
          <Text fontWeight="semibold">🏅 Records personnels battus ({recap.records_count})</Text>
          {recap.records.map((record) => (
            <Text key={`${record.pseudo}-${record.killer}-${record.attack}`}>
              <b>{record.pseudo}</b> — {record.killer} {ATTACK_EMOJIS[record.attack]} : {formatNumber(record.previous_score)} → <b>{formatNumber(record.new_score)}</b>
            </Text>
          ))}
          {hiddenRecords > 0 && <Text as="i">… et {hiddenRecords} autre{hiddenRecords > 1 ? "s" : ""}</Text>}
        </Box>
      )}
      {recap.goals.length > 0 && (
        <Box>
          <Text fontWeight="semibold">🎯 Objectifs ({achievedGoals}/{recap.goals.length} atteints)</Text>
          {recap.goals.map((goal) => (
            <Text key={goal.type}>
              {goal.achieved ? "✅" : "❌"} <b>{GOAL_LABELS[goal.type] ?? goal.type}</b> : {formatGoalValue(goal.value, goal.unit)} / {formatGoalValue(goal.target, goal.unit)}
            </Text>
          ))}
        </Box>
      )}
    </VStack>
  );
};

// Manually publishes a cycle's end recap in the general channel of one guild or all of them:
// final podium capture (same mechanism as the automatic rotation recap) and/or written summary.
export const PublishCycleRecapButton: React.FC<PublishCycleRecapButtonProps> = ({ cycle }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { guilds } = useGuilds(true);
  const { publishCycleRecap } = usePodiumMutations();
  const toast = useToast();

  const [guildName, setGuildName] = useState("");
  const [rankingType, setRankingType] = useState<PodiumRankingType>("average");
  const [includeSnapshot, setIncludeSnapshot] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const previewBg = "bg.subtle";

  const selectedGuildId = guilds.find((g) => g.name === guildName)?._id;
  const { recap, isLoading: isPreviewLoading } = useCycleRecapPreview(
    isOpen && includeSummary ? cycle._id : undefined,
    selectedGuildId
  );

  const guildOptions = [{ value: "", label: "Toutes les guildes actives" }, ...guilds.map((g) => ({ value: g.name, label: g.name }))];

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const data = await publishCycleRecap({
        cycleName: cycle.name,
        year: cycle.year,
        rankingType,
        guildName: guildName || undefined,
        includeSnapshot,
        includeSummary,
      });
      const requested = data.results.filter((r) => r.status === "requested").length;
      const skipped = data.results.filter((r) => r.status === "skipped");
      const failed = data.results.filter((r) => r.status === "error");
      const details = [
        skipped.length > 0 && `Ignoré (pas de salon configuré) : ${skipped.map((s) => s.guild).join(", ")}`,
        failed.length > 0 && `En erreur : ${failed.map((f) => f.guild).join(", ")}`,
      ].filter(Boolean).join(" · ");
      toast({
        title: `Récap demandé pour ${requested} guilde(s)`,
        description: details || undefined,
        status: skipped.length > 0 || failed.length > 0 ? "warning" : "success",
        duration: 5000,
      });
      onClose();
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Erreur lors de la publication", status: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <Tooltip label="Publier le récap de fin de cycle sur Discord" hasArrow>
        <IconButton
          size="xs"
          aria-label="Publier le récap Discord"
          icon={<Text fontSize="0.85rem">📣</Text>}
          variant="ghost"
          borderRadius="lg"
          color="gray.500"
          _hover={{ color: "purple.400", bg: "whiteAlpha.100" }}
          onClick={onOpen}
        />
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Publier le récap de {cycle.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm" color="gray.500">
                Envoie le récap du cycle dans le salon général de la/les guilde(s) choisie(s). Rien
                n'est appliqué ni modifié, juste une notification Discord.
              </Text>
              <HStack spacing={6}>
                <Checkbox isChecked={includeSnapshot} onChange={(e) => setIncludeSnapshot(e.target.checked)}>
                  Capture du podium
                </Checkbox>
                <Checkbox isChecked={includeSummary} onChange={(e) => setIncludeSummary(e.target.checked)}>
                  Bilan écrit
                </Checkbox>
              </HStack>
              <Box>
                <Text fontSize="sm" mb={1}>Guilde</Text>
                <CustomSelect
                  value={guildName}
                  onChange={setGuildName}
                  options={guildOptions}
                  allowDeselect={false}
                  size="md"
                />
              </Box>
              {includeSnapshot && (
                <Box>
                  <Text fontSize="sm" mb={1}>Classement de la capture</Text>
                  <ButtonGroup size="sm" isAttached variant="outline" w="100%">
                    {RANKING_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        flex={1}
                        colorScheme={rankingType === option.value ? "blue" : undefined}
                        variant={rankingType === option.value ? "solid" : "outline"}
                        onClick={() => setRankingType(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Box>
              )}
              {includeSummary && (
                <Box bg={previewBg} borderRadius="md" p={3}>
                  <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" color="gray.500" mb={2}>
                    Aperçu du bilan
                  </Text>
                  {!selectedGuildId ? (
                    <Text fontSize="sm" color="gray.500">Choisis une guilde pour voir l'aperçu de son bilan.</Text>
                  ) : isPreviewLoading ? (
                    <Skeleton h="80px" borderRadius="md" />
                  ) : recap ? (
                    <RecapPreview recap={recap} />
                  ) : (
                    <Text fontSize="sm" color="gray.500">Aperçu indisponible.</Text>
                  )}
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Annuler</Button>
            <Button colorScheme="purple" onClick={handlePublish} isLoading={isPublishing} isDisabled={!includeSnapshot && !includeSummary}>
              Publier
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
