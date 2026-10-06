import { Box, Tooltip } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { ITopAchievement } from "@/interfaces";
import { AchievementBadge } from "./AchievementBadge";
import { ACHIEVEMENT_ICONS } from "./achievementCatalog";

interface TopAchievementBadgeProps {
  achievement?: ITopAchievement | null;
  size?: number;
}

// Petit badge du succès le plus rare d'un joueur, affiché à côté de son pseudo dans les classements
export const TopAchievementBadge = ({ achievement, size = 20 }: TopAchievementBadgeProps) => {
  const { t } = useTranslation();
  if (!achievement) return null;
  const label = `${t(`achievements.${achievement.code}.name`)} · ${t(`achievements.tiers.${achievement.tier}`)} · ${t("pages.user.achievementsRarity", { value: achievement.rarity.toLocaleString("fr-FR") })}`;

  return (
    <Tooltip label={label} hasArrow>
      <Box as="span" display="inline-flex" flexShrink={0} tabIndex={0} aria-label={label}>
        <AchievementBadge tier={achievement.tier} icon={ACHIEVEMENT_ICONS[achievement.code]} size={size} />
      </Box>
    </Tooltip>
  );
};
