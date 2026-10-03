import { Box, HStack, Text, useColorModeValue } from "@chakra-ui/react";
import type {
  IPodiumResponse,
  IPodiumWeeklyResponse,
  IPodiumMissesResponse,
  ICycle,
} from "@/interfaces";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import CustomLink from "@/components/ui/CustomLink";
import { useTranslation } from "react-i18next";

type DisplayMode = "cycle" | "rotation" | "weekly" | "misses";

interface PodiumInfoProps {
  displayMode: DisplayMode;
  podiumData: IPodiumResponse | IPodiumWeeklyResponse | IPodiumMissesResponse;
  selectedCycle?: ICycle;
  filterBg: string;
}

const isWeeklyResponse = (
  data: IPodiumResponse | IPodiumWeeklyResponse | IPodiumMissesResponse
): data is IPodiumWeeklyResponse => "rotationsInfo" in data.meta;

const isMissesResponse = (
  data: IPodiumResponse | IPodiumWeeklyResponse | IPodiumMissesResponse
): data is IPodiumMissesResponse => "totalMissesInCycle" in data.meta;

const isPodiumResponse = (
  data: IPodiumResponse | IPodiumWeeklyResponse | IPodiumMissesResponse
): data is IPodiumResponse => !isWeeklyResponse(data) && !isMissesResponse(data);

export const PodiumInfo = ({
  displayMode,
  podiumData,
  selectedCycle,
  filterBg,
}: PodiumInfoProps) => {
  const { t } = useTranslation();
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const accentColor = useColorModeValue("blue.600", "blue.300");
  const redAccent = useColorModeValue("red.600", "red.400");

  /* ─── Rotation mode ─── */
  if (
    displayMode === "rotation" &&
    isPodiumResponse(podiumData) &&
    podiumData.meta?.rotationInfo
  ) {
    const info = podiumData.meta.rotationInfo;
    return (
      <Box px={4} py={3} bg={filterBg} borderRadius="lg">
        <HStack spacing={4} flexWrap="wrap" justify="center">
          <CustomLink
            to={`/cycle/${selectedCycle?._id}/rotation/${info.position}`}
            text={t(`factions.${info.killer}`, info.killer)}
            textSize="sm"
            sx={{ fontWeight: "semibold" }}
          />
          <AttackTypeBadge attackType={info.attack} />
          <Text fontSize="sm" color={mutedText}>
            {info.start_date} → {info.end_date}
          </Text>
          {podiumData.meta.averageScore != null && (
            <Text fontSize="sm" fontWeight="semibold" color={accentColor}>
              ø {podiumData.meta.averageScore.toLocaleString("fr-FR")}
            </Text>
          )}
          <Text fontSize="xs" color={mutedText}>
            {t("components.podiumInfo.totalPlayers", { count: podiumData.meta.totalPlayers })}
          </Text>
        </HStack>
      </Box>
    );
  }

  /* ─── Cycle mode, classement progression ─── */
  if (displayMode === "cycle" && isPodiumResponse(podiumData) && podiumData.meta.podiumType === "progression") {
    const previous = podiumData.meta.previousCycle;
    return (
      <Box px={4} py={3} bg={filterBg} borderRadius="lg">
        <Text fontSize="sm" textAlign="center" color={mutedText}>
          {previous
            ? t("components.podiumInfo.progressionComparedTo", {
              previous: `${previous.name} ${previous.year}`,
              current: [selectedCycle?.name, selectedCycle?.year].filter(Boolean).join(" ") || podiumData.meta.cycleName,
            })
            : t("components.podiumInfo.progressionNoPreviousCycle")}
        </Text>
      </Box>
    );
  }

  /* ─── Weekly mode ─── */
  if (displayMode === "weekly" && isWeeklyResponse(podiumData)) {
    return (
      <Box px={4} py={3} bg={filterBg} borderRadius="lg">
        <HStack spacing={5} flexWrap="wrap" justify="center" align="center">
          <Text fontSize="sm" fontWeight="bold">
            {t("components.podiumInfo.weekLabel")} {podiumData.meta.weekNumber}
          </Text>
          {podiumData.meta.rotationsInfo.map((rotation, idx) => (
            <HStack key={idx} spacing={2}>
              <CustomLink
                to={`/cycle/${selectedCycle?._id}/rotation/${rotation.position}`}
                text={`R${rotation.position}`}
                textSize="xs"
              />
              <Text fontSize="xs" color={mutedText}>
                {t(`factions.${rotation.killer}`, rotation.killer)}
              </Text>
              <AttackTypeBadge attackType={rotation.attack} />
            </HStack>
          ))}
          <Text fontSize="sm" fontWeight="semibold" color={accentColor}>
            ø {podiumData.meta.averageWeekScore?.toLocaleString("fr-FR")}
          </Text>
          <Text fontSize="xs" color={mutedText}>
            {t("components.podiumInfo.totalPlayers", { count: podiumData.meta.totalPlayers })}
          </Text>
        </HStack>
      </Box>
    );
  }

  /* ─── Misses mode ─── */
  if (displayMode === "misses" && isMissesResponse(podiumData)) {
    return (
      <Box px={4} py={3} bg={filterBg} borderRadius="lg">
        <HStack spacing={5} flexWrap="wrap" justify="center" align="center">
          <Text fontSize="sm" fontWeight="bold" color={redAccent}>
            📉 {t("components.podiumInfo.missTitle")}
          </Text>
          <Text fontSize="sm" color={mutedText}>
            {t("components.podiumInfo.missPlayers", {
              count: podiumData.meta.totalPlayersWithMisses,
            })}
          </Text>
          <Text fontSize="sm" color={redAccent} fontWeight="semibold">
            {podiumData.meta.totalMissesInCycle}{" "}
            {t("components.podiumInfo.missTotal", {
              count: podiumData.meta.totalMissesInCycle,
            })}
          </Text>
          <Text fontSize="xs" color={mutedText}>
            ø {podiumData.meta.averageMissesPerPlayer}{" "}
            {t("components.podiumInfo.missAverage", {
              avg: podiumData.meta.averageMissesPerPlayer,
            })}
          </Text>
        </HStack>
      </Box>
    );
  }

  return null;
};
