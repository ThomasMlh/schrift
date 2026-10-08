import {
  Box, Button, Checkbox, Flex, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
  ModalOverlay, NumberInput, NumberInputField, Progress, SimpleGrid, Skeleton, Text, VStack, useDisclosure, useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGuildGoals } from "@/hooks/useAPI";
import { useGuildMutations } from "@/hooks/useAPIMutations";
import { useAuth } from "@/providers/AuthProvider";
import type { GuildGoalType, IGuildGoal } from "@/interfaces";

interface GuildGoalsProps {
  guildId: string;
  cycleId?: string;
}

const GOAL_TYPES: GuildGoalType[] = ["average", "clear_rate", "records", "participation"];
const UNITS: Record<GuildGoalType, IGuildGoal["unit"]> = { average: "score", clear_rate: "percent", records: "count", participation: "percent" };

const formatValue = (value: number | null, unit: IGuildGoal["unit"]) => {
  if (value === null) return "—";
  if (unit === "percent") return `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
  return value.toLocaleString("fr-FR");
};

// Objectifs de la guilde sur le cycle affiché : une barre de progression par objectif. Les admins
// et les chefs/sous-chefs de la guilde peuvent les modifier.
export const GuildGoals = ({ guildId, cycleId }: GuildGoalsProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { isAdmin, managedGuildIds } = useAuth();
  const { setGuildGoals } = useGuildMutations();
  const { data, isLoading } = useGuildGoals(guildId, cycleId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [draft, setDraft] = useState<Record<GuildGoalType, { enabled: boolean; target: string }>>(
    () => Object.fromEntries(GOAL_TYPES.map((type) => [type, { enabled: false, target: "" }])) as Record<GuildGoalType, { enabled: boolean; target: string }>
  );
  const [isSaving, setIsSaving] = useState(false);

  const cardBg = "bg.card";
  const border = "border.faint";
  const mutedText = "text.muted";

  const canEdit = isAdmin || managedGuildIds.includes(guildId);
  const goals = data?.goals ?? [];

  if (isLoading) return <Skeleton h="90px" borderRadius="xl" />;
  if (!data?.cycle || (goals.length === 0 && !canEdit)) return null;

  const openEditor = () => {
    setDraft(Object.fromEntries(GOAL_TYPES.map((type) => {
      const goal = goals.find((g) => g.type === type);
      return [type, { enabled: !!goal, target: goal ? String(goal.target) : "" }];
    })) as Record<GuildGoalType, { enabled: boolean; target: string }>);
    onOpen();
  };

  const save = async () => {
    if (!data.cycle) return;
    const payload = GOAL_TYPES
      .filter((type) => draft[type].enabled)
      .map((type) => ({ type, target: Number(draft[type].target.replace(/\s/g, "").replace(",", ".")) }));
    if (payload.some((g) => !Number.isFinite(g.target) || g.target <= 0)) {
      toast({ title: t("pages.guilds.goalsInvalidTarget"), status: "error" });
      return;
    }
    setIsSaving(true);
    try {
      await setGuildGoals(guildId, data.cycle._id, payload);
      toast({ title: t("pages.guilds.goalsSaved"), status: "success", duration: 2500 });
      onClose();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : t("pages.guilds.goalsSaveError"), status: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="xl" p={4}>
      <Flex justify="space-between" align="center" mb={goals.length ? 3 : 0} gap={3} wrap="wrap">
        <Box>
          <Text fontWeight="bold">🎯 {t("pages.guilds.goalsTitle", { cycle: `${data.cycle.name} ${data.cycle.year}` })}</Text>
          {goals.length > 0 && (
            <Text fontSize="xs" color={mutedText}>
              {t("pages.guilds.goalsAchieved", { achieved: goals.filter((g) => g.achieved).length, total: goals.length })}
            </Text>
          )}
        </Box>
        {canEdit && (
          <Button size="sm" variant="outline" colorScheme="purple" onClick={openEditor}>
            {goals.length ? t("pages.guilds.goalsEdit") : t("pages.guilds.goalsAdd")}
          </Button>
        )}
      </Flex>

      {goals.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
          {goals.map((goal) => (
            <Box key={goal.type}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" fontWeight="medium">{goal.achieved ? "✅ " : ""}{t(`pages.guilds.goalType_${goal.type}`)}</Text>
                <Text fontSize="sm" color={mutedText} sx={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatValue(goal.value, goal.unit)} / {formatValue(goal.target, goal.unit)}
                </Text>
              </HStack>
              <Progress
                value={goal.progress}
                size="sm"
                borderRadius="full"
                colorScheme={goal.achieved ? "green" : "purple"}
                aria-label={t(`pages.guilds.goalType_${goal.type}`)}
              />
            </Box>
          ))}
        </SimpleGrid>
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("pages.guilds.goalsModalTitle", { cycle: `${data.cycle.name} ${data.cycle.year}` })}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              {GOAL_TYPES.map((type) => (
                <Box key={type}>
                  <Checkbox
                    isChecked={draft[type].enabled}
                    onChange={(e) => setDraft((prev) => ({ ...prev, [type]: { ...prev[type], enabled: e.target.checked } }))}
                  >
                    {t(`pages.guilds.goalType_${type}`)}
                  </Checkbox>
                  <Text fontSize="xs" color={mutedText} ml={6}>{t(`pages.guilds.goalHelp_${type}`)}</Text>
                  {draft[type].enabled && (
                    <HStack ml={6} mt={2}>
                      <NumberInput
                        size="sm"
                        maxW="220px"
                        min={0}
                        max={UNITS[type] === "percent" ? 100 : undefined}
                        value={draft[type].target}
                        onChange={(v) => setDraft((prev) => ({ ...prev, [type]: { ...prev[type], target: v } }))}
                      >
                        <NumberInputField id={`goal-${type}`} placeholder={t("pages.guilds.goalsTarget")} />
                      </NumberInput>
                      {UNITS[type] === "percent" && <Text fontSize="sm">%</Text>}
                    </HStack>
                  )}
                </Box>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>{t("common.cancel")}</Button>
            <Button colorScheme="purple" onClick={save} isLoading={isSaving}>{t("common.save")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
