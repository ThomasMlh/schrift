import { Box, HStack, Image, Progress, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { ICharacterStats } from "@/interfaces";
import { getStatIcon } from "@/utils/characterIcons";

const STAT_KEYS = ["end", "atk", "def", "cct", "pre"] as const;
type StatKey = (typeof STAT_KEYS)[number];

const STAT_COLORS: Record<StatKey, string> = {
  end: "green",
  atk: "red",
  def: "blue",
  cct: "yellow",
  pre: "purple",
};

const parseStat = (value?: string) => parseInt(String(value ?? "").replace(/[^\d]/g, ""), 10) || 0;

interface CharacterStatBarsProps {
  stats: ICharacterStats;
  // Valeur maximale de chaque stat parmi tous les personnages (échelle des barres)
  statMax: Partial<Record<StatKey, number>>;
}

// Stats du personnage en barres, chacune rapportée au meilleur personnage de la base
export const CharacterStatBars = ({ stats, statMax }: CharacterStatBarsProps) => {
  const { t } = useTranslation();

  return (
    <VStack align="stretch" spacing={3}>
      {STAT_KEYS.filter((key) => stats[key]).map((key) => {
        const value = parseStat(stats[key]);
        const max = statMax[key] || value || 1;
        const percent = Math.min(100, Math.round((value / max) * 100));
        return (
          <Box key={key}>
            <HStack justify="space-between" mb={1}>
              <HStack spacing={2}>
                <Image src={getStatIcon(key) ?? undefined} alt="" boxSize="18px" />
                <Text fontSize="sm" fontWeight="medium" color="text.body">{t(`stats.${key}`)}</Text>
              </HStack>
              <HStack spacing={2}>
                <Text fontSize="sm" fontWeight="bold" color="text.strong">{stats[key]}</Text>
                {statMax[key] ? (
                  <Text fontSize="xs" color="text.muted" w="36px" textAlign="right">{percent} %</Text>
                ) : null}
              </HStack>
            </HStack>
            <Progress
              value={percent}
              size="sm"
              borderRadius="full"
              colorScheme={STAT_COLORS[key]}
              bg="bg.inset"
              aria-label={t(`stats.${key}`)}
            />
          </Box>
        );
      })}
      {Object.keys(statMax).length > 0 && (
        <Text fontSize="xs" color="text.muted">{t("pages.characterDetail.statScaleHint")}</Text>
      )}
    </VStack>
  );
};
