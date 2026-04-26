import { Box, VStack, Text, HStack } from "@chakra-ui/react";
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

// Type guards
const isWeeklyResponse = (
  data: IPodiumResponse | IPodiumWeeklyResponse | IPodiumMissesResponse
): data is IPodiumWeeklyResponse => {
  return "rotationsInfo" in data.meta;
};

const isMissesResponse = (
  data: IPodiumResponse | IPodiumWeeklyResponse | IPodiumMissesResponse
): data is IPodiumMissesResponse => {
  return "totalMissesInCycle" in data.meta;
};

const isPodiumResponse = (
  data: IPodiumResponse | IPodiumWeeklyResponse | IPodiumMissesResponse
): data is IPodiumResponse => {
  return !isWeeklyResponse(data) && !isMissesResponse(data);
};

export const PodiumInfo = ({
  displayMode,
  podiumData,
  selectedCycle,
  filterBg,
}: PodiumInfoProps) => {
  const { t } = useTranslation();
  return (
    <>
      {/* Informations sur la rotation (mode rotation) */}
      {displayMode === "rotation" &&
        isPodiumResponse(podiumData) &&
        podiumData.meta?.rotationInfo && (
          <Box p={4} bg={filterBg} borderRadius="md">
            <VStack spacing={2}>
              <Box
                fontSize="lg"
                fontWeight="bold"
                flexWrap="wrap"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <CustomLink
                  to={`/cycle/${selectedCycle?._id}/rotation/${podiumData.meta.rotationInfo.position}`}
                  text={t(`factions.${podiumData.meta.rotationInfo.killer}`, podiumData.meta.rotationInfo.killer)}
                  textSize="md"
                />
                <AttackTypeBadge
                  attackType={podiumData.meta.rotationInfo.attack}
                />
              </Box>
              <Text fontSize="sm">
                {podiumData.meta.rotationInfo.start_date} →{" "}
                {podiumData.meta.rotationInfo.end_date}
              </Text>
              <Text fontSize="md" fontWeight="bold">
                {t("components.podiumInfo.rotationScore")}:{" "}
                {podiumData.meta.averageScore?.toLocaleString("fr-FR")}
              </Text>
              <Text fontSize="sm">
                {t("components.podiumInfo.totalPlayers", { count: podiumData.meta.totalPlayers })}
              </Text>
            </VStack>
          </Box>
        )}

      {/* Informations sur la semaine (mode weekly) */}
      {displayMode === "weekly" && isWeeklyResponse(podiumData) && (
        <Box p={4} bg={filterBg} borderRadius="md">
          <VStack spacing={3} align="center">
            <Text fontSize="lg" fontWeight="bold">
              {t("components.podiumInfo.weekLabel")} {podiumData.meta.weekNumber}
            </Text>
            <HStack spacing={6} wrap="wrap" justify="center">
              {podiumData.meta.rotationsInfo.map((rotation, idx) => (
                <VStack key={idx} spacing={1}>
                  <CustomLink
                    to={`/cycle/${selectedCycle?._id}/rotation/${rotation.position}`}
                    text={`${t("components.podiumInfo.rotationLabel")} ${rotation.position}`}
                    textSize="sm"
                  />
                  <Text fontSize="xs">
                    {t(`factions.${rotation.killer}`, rotation.killer)}
                  </Text>
                  <AttackTypeBadge attackType={rotation.attack} />
                </VStack>
              ))}
            </HStack>
            <Text fontSize="md" fontWeight="bold">
              {t("components.podiumInfo.weeklyScore")}:{" "}
              {podiumData.meta.averageWeekScore?.toLocaleString("fr-FR")}
            </Text>
            <Text fontSize="sm">
              {t("components.podiumInfo.totalPlayers", { count: podiumData.meta.totalPlayers })}
            </Text>
          </VStack>
        </Box>
      )}

      {/* Informations sur les miss (mode misses) */}
      {displayMode === "misses" && isMissesResponse(podiumData) && (
        <Box p={4} bg={filterBg} borderRadius="md">
          <VStack spacing={2}>
            <Text fontSize="lg" fontWeight="bold" color="red.500">
              📉 {t("components.podiumInfo.missTitle")}
            </Text>
            <Text fontSize="md">
              {t("components.podiumInfo.missPlayers", { count: podiumData.meta.totalPlayersWithMisses })}
            </Text>
            <Text fontSize="sm">
              {t("components.podiumInfo.missTotal", { count: podiumData.meta.totalMissesInCycle })}
            </Text>
            <Text fontSize="sm">
              {t("components.podiumInfo.missAverage", { avg: podiumData.meta.averageMissesPerPlayer })}
            </Text>
          </VStack>
        </Box>
      )}
    </>
  );
};
