import { Box, Flex, Grid, HStack, Icon, Text, Tooltip, VStack } from "@chakra-ui/react";
import { FiAward, FiCheck, FiGift, FiHelpCircle, FiLock, FiStar, FiTarget } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import type { GoalSource, IGoalProgress, TierReward } from "@/interfaces";

const SOURCES: { key: GoalSource; icon: IconType }[] = [
  { key: "score", icon: FiTarget },
  { key: "advent", icon: FiStar },
  { key: "quiz", icon: FiHelpCircle },
  { key: "gift", icon: FiGift },
];
const REWARD_ICONS: Record<TierReward, string> = { decor: "❄️", frame: "🖼️", custom: "🎁" };

// Shared gauge of the event: every contribution fills it, each tier unlocks a reward for everyone
export const CommunityGoal = ({ goal, year }: { goal: IGoalProgress; year: number }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";
  const format = (value: number) => value.toLocaleString(locale);
  const max = Math.max(goal.target ?? 0, goal.total, 1);
  const pct = Math.min(100, (goal.total / max) * 100);
  const next = goal.tiers.find((tier) => !tier.reached);
  const rewardLabel = (reward: TierReward, label: string) => (reward === "custom" ? label : t(`pages.goal.reward_${reward}`, { year }));

  return (
    <Box
      bgColor="bg.card"
      bgGradient="linear(to-br, rgba(49, 151, 149, 0.16), transparent 50%)"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="2xl"
      p={{ base: 4, md: 6 }}
    >
      <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={3} wrap="wrap" mb={5}>
        <HStack spacing={3}>
          <Box boxSize="40px" flexShrink={0} display="grid" placeItems="center" borderRadius="lg" bg="teal.900" color="teal.200" _light={{ bg: "teal.100", color: "teal.700" }}>
            <Icon as={FiAward} boxSize={5} aria-hidden />
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="text.muted">{t("pages.goal.eyebrow")}</Text>
            <Text fontSize="xl" fontWeight="extrabold">{t("pages.goal.title")}</Text>
          </Box>
        </HStack>
        <Box textAlign={{ base: "left", md: "right" }}>
          <Text fontSize="3xl" fontWeight="extrabold" lineHeight="1" color="teal.300" _light={{ color: "teal.600" }} sx={{ fontVariantNumeric: "tabular-nums" }}>
            {format(goal.total)}
            {goal.target ? <Text as="span" fontSize="md" color="text.muted" fontWeight="semibold"> / {format(goal.target)}</Text> : null}
          </Text>
          <Text fontSize="sm" color="text.muted">
            {next ? t("pages.goal.toNext", { count: next.threshold - goal.total, reward: rewardLabel(next.reward, next.label) }) : t("pages.goal.allReached")}
          </Text>
        </Box>
      </Flex>

      {/* Gauge with a flag at each tier */}
      <Box position="relative" h="18px" mx={2} mb={10} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={goal.total}>
        <Box position="absolute" inset={0} borderRadius="full" bg="bg.subtle" />
        <Box position="absolute" top={0} bottom={0} left={0} w={`${pct}%`} borderRadius="full" bgGradient="linear(to-r, teal.600, teal.300, green.200)" transition="width 0.6s ease" />
        {goal.tiers.map((tier) => {
          const left = Math.min(100, (tier.threshold / max) * 100);
          return (
            <Tooltip key={tier.threshold} label={`${format(tier.threshold)} · ${rewardLabel(tier.reward, tier.label)}`} hasArrow>
              <VStack position="absolute" top="-5px" left={`${left}%`} transform="translateX(-50%)" spacing={1}>
                <Box
                  boxSize="28px"
                  borderRadius="full"
                  display="grid"
                  placeItems="center"
                  fontSize="sm"
                  bg={tier.reached ? "teal.400" : "bg.card"}
                  borderWidth="2px"
                  borderColor={tier.reached ? "teal.200" : "border.subtle"}
                  boxShadow={tier.reached ? "0 0 12px rgba(79, 209, 197, 0.6)" : undefined}
                  filter={tier.reached ? undefined : "grayscale(0.8)"}
                >
                  {REWARD_ICONS[tier.reward]}
                </Box>
                <Text fontSize="2xs" fontWeight="bold" color={tier.reached ? "teal.300" : "text.muted"} sx={{ fontVariantNumeric: "tabular-nums" }} whiteSpace="nowrap">
                  {format(tier.threshold)}
                </Text>
              </VStack>
            </Tooltip>
          );
        })}
      </Box>

      <Grid templateColumns={{ base: "1fr", md: "1.2fr 1fr" }} gap={5}>
        <Box>
          <Text fontSize="sm" fontWeight="bold" mb={2}>{t("pages.goal.rewards")}</Text>
          <VStack align="stretch" spacing={2}>
            {goal.tiers.length === 0 && <Text fontSize="sm" color="text.muted">{t("pages.goal.noTier")}</Text>}
            {goal.tiers.map((tier) => (
              <HStack key={tier.threshold} spacing={3} bg="bg.subtle" borderRadius="lg" px={3} py={2} opacity={tier.reached ? 1 : 0.8}>
                <Text fontSize="lg" aria-hidden>{REWARD_ICONS[tier.reward]}</Text>
                <Box flex={1} minW={0}>
                  <Text fontSize="sm" fontWeight="semibold">{rewardLabel(tier.reward, tier.label)}</Text>
                  <Text fontSize="xs" color="text.muted">{t("pages.goal.at", { count: tier.threshold, value: format(tier.threshold) })}</Text>
                </Box>
                <Icon as={tier.reached ? FiCheck : FiLock} color={tier.reached ? "teal.300" : "text.muted"} aria-label={tier.reached ? t("pages.goal.unlocked") : t("pages.goal.locked")} />
              </HStack>
            ))}
          </VStack>
        </Box>
        <Box>
          <Text fontSize="sm" fontWeight="bold" mb={2}>{t("pages.goal.howTo")}</Text>
          <VStack align="stretch" spacing={2}>
            {SOURCES.filter((s) => goal.weights[s.key] > 0).map(({ key, icon }) => (
              <HStack key={key} spacing={3}>
                <Icon as={icon} color="teal.300" boxSize={4} aria-hidden />
                <Text fontSize="sm" flex={1}>{t(`pages.goal.source_${key}`)}</Text>
                <Text fontSize="sm" fontWeight="bold" color="teal.300" _light={{ color: "teal.600" }}>+{goal.weights[key]}</Text>
                <Text fontSize="xs" color="text.muted" minW="64px" textAlign="right" sx={{ fontVariantNumeric: "tabular-nums" }}>× {format(goal.counts[key])}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      </Grid>
    </Box>
  );
};
