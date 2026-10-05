import {
  Box, Flex, HStack, SimpleGrid, Skeleton, Text, Tooltip, VStack, useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useUserAchievements } from "@/hooks/useAPI";
import type { AchievementTier, IAchievement } from "@/interfaces";
import { AchievementBadge } from "./AchievementBadge";
import { ACHIEVEMENT_ICONS, CATEGORY_ORDER, TIER_ORDER, formatAchievementValue } from "./achievementCatalog";

interface UserAchievementsProps {
  userId?: string;
  // Compte bbs affiché sur la page (un alt si l'URL pointe vers lui) ; à défaut, le compte principal.
  bbsId?: string;
}

// Couleur du texte de chaque rareté, lisible sur fond clair et sombre
const TIER_TEXT: Record<AchievementTier, [string, string]> = {
  bronze: ["#A0602F", "#E0A06E"],
  silver: ["#6B7480", "#C3CBD6"],
  gold: ["#A87A00", "#F2C94C"],
  platinum: ["#6A5FCF", "#B8AEFF"],
};

const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

// Onglet « Succès » de la page joueur : un badge par succès, en couleur au palier atteint ou grisé
// avec la progression vers le palier suivant, groupés par catégorie.
export const UserAchievements = ({ userId, bbsId }: UserAchievementsProps) => {
  const { t } = useTranslation();
  const { accounts, isLoading } = useUserAchievements(userId);

  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const mutedText = useColorModeValue("gray.500", "whiteAlpha.600");
  const strongText = useColorModeValue("gray.800", "whiteAlpha.900");
  const barTrack = useColorModeValue("gray.100", "whiteAlpha.200");
  const tierTextIndex = useColorModeValue(0, 1);

  if (isLoading) return <Skeleton h="320px" borderRadius="lg" />;

  const account = accounts.find((a) => a.bbs_id === bbsId) ?? accounts.find((a) => a.is_primary) ?? accounts[0];
  const achievements = account?.achievements ?? [];
  if (achievements.length === 0) {
    return <Text fontSize="sm" color={mutedText} textAlign="center" py={8}>{t("pages.user.achievementsEmpty")}</Text>;
  }

  const allTiers = achievements.flatMap((a) => a.tiers);
  const unlockedTiers = allTiers.filter((tr) => tr.unlocked_at !== null);
  const tierName = (tier: AchievementTier) => t(`achievements.tiers.${tier}`);
  const tierColor = (tier: AchievementTier) => TIER_TEXT[tier][tierTextIndex];

  const renderCard = (a: IAchievement) => {
    const locked = a.current_tier === null;
    const shownTier = a.current_tier ?? a.tiers[0].tier;
    const current = a.tiers.find((tr) => tr.tier === a.current_tier);
    const next = a.next_tier;
    const nextRarity = next ? a.tiers.find((tr) => tr.tier === next.tier)?.rarity : undefined;
    const showProgress = next && a.unit !== "flag";
    const progress = next ? Math.min(100, Math.max(0, (a.value / next.threshold) * 100)) : 100;
    const name = t(`achievements.${a.code}.name`);

    return (
      <Box key={a.code} bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="xl" p={3.5}>
        <HStack align="center" spacing={3}>
          <AchievementBadge
            tier={shownTier}
            icon={ACHIEVEMENT_ICONS[a.code]}
            locked={locked}
            size={60}
            label={locked ? `${name} (${t("pages.user.achievementsLocked")})` : `${name} : ${tierName(shownTier)}`}
          />
          <Box minW={0} flex={1}>
            <Text fontWeight="semibold" fontSize="sm" color={locked ? mutedText : strongText} noOfLines={1}>{name}</Text>
            <Text fontSize="xs" color={mutedText}>{t(`achievements.${a.code}.description`)}</Text>

            <HStack spacing={1.5} mt={1.5} wrap="wrap">
              {a.tiers.map((tr) => (
                <Tooltip
                  key={tr.tier}
                  hasArrow
                  label={`${tierName(tr.tier)} · ${a.unit === "flag" ? t("pages.user.achievementsUnlockOnce") : formatAchievementValue(tr.threshold, a.unit)} · ${t("pages.user.achievementsRarity", { value: tr.rarity.toLocaleString("fr-FR") })}`}
                >
                  <Text
                    as="span"
                    fontSize="2xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    px={1.5}
                    borderRadius="full"
                    borderWidth="1px"
                    borderColor={tr.unlocked_at !== null ? tierColor(tr.tier) : border}
                    color={tr.unlocked_at !== null ? tierColor(tr.tier) : mutedText}
                    opacity={tr.unlocked_at !== null ? 1 : 0.8}
                  >
                    {tr.unlocked_at !== null ? "✓ " : ""}{tierName(tr.tier)}
                    {a.unit !== "flag" && ` ${formatAchievementValue(tr.threshold, a.unit)}`}
                  </Text>
                </Tooltip>
              ))}
            </HStack>

            {current?.unlocked_at && (
              <Text fontSize="xs" color={mutedText} mt={1}>
                {t("pages.user.achievementsUnlockedOn", { date: formatDate(current.unlocked_at) })} ·{" "}
                {t("pages.user.achievementsRarity", { value: current.rarity.toLocaleString("fr-FR") })}
              </Text>
            )}
            {locked && nextRarity !== undefined && (
              <Text fontSize="xs" color={mutedText} mt={1}>
                {t("pages.user.achievementsRarity", { value: nextRarity.toLocaleString("fr-FR") })}
              </Text>
            )}

            {showProgress && next && (
              <Box mt={1.5}>
                <Box h="5px" borderRadius="full" bg={barTrack} overflow="hidden" aria-hidden="true">
                  <Box h="100%" w={`${progress}%`} bg={tierColor(next.tier)} borderRadius="full" />
                </Box>
                <Text fontSize="2xs" color={mutedText} mt={0.5} sx={{ fontVariantNumeric: "tabular-nums" }}>
                  {t("pages.user.achievementsProgress", {
                    value: formatAchievementValue(a.value, a.unit),
                    threshold: formatAchievementValue(next.threshold, a.unit),
                    tier: tierName(next.tier),
                  })}
                </Text>
              </Box>
            )}
          </Box>
        </HStack>
      </Box>
    );
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={3}>
        <Box>
          <Text fontSize="md" fontWeight="bold" color={strongText}>{t("pages.user.achievementsTitle")}</Text>
          <Text fontSize="sm" color={mutedText}>{t("pages.user.achievementsSubtitle")}</Text>
        </Box>
        <HStack spacing={4} wrap="wrap">
          <Text fontSize="sm" fontWeight="semibold" color={strongText}>
            {t("pages.user.achievementsSummary", { unlocked: unlockedTiers.length, total: allTiers.length })}
          </Text>
          {TIER_ORDER.map((tier) => (
            <HStack key={tier} spacing={1}>
              <AchievementBadge tier={tier} icon="star" size={18} label={tierName(tier)} />
              <Text fontSize="sm" color={mutedText} sx={{ fontVariantNumeric: "tabular-nums" }}>
                {unlockedTiers.filter((tr) => tr.tier === tier).length}/{allTiers.filter((tr) => tr.tier === tier).length}
              </Text>
            </HStack>
          ))}
        </HStack>
      </Flex>

      {CATEGORY_ORDER.map((category) => {
        const items = achievements.filter((a) => a.category === category);
        if (items.length === 0) return null;
        return (
          <Box key={category}>
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color={mutedText} mb={2}>
              {t(`achievements.categories.${category}`)}
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={3}>
              {items.map(renderCard)}
            </SimpleGrid>
          </Box>
        );
      })}
    </VStack>
  );
};
