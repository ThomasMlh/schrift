import { Box, VStack, Text, HStack } from "@chakra-ui/react";
import type {
  IPodiumResponse,
  IPodiumWeeklyResponse,
  IPodiumMissesResponse,
  ICycle,
} from "@/interfaces";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import CustomLink from "@/components/ui/CustomLink";

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
                  text={podiumData.meta.rotationInfo.killer}
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
                Score moyen:{" "}
                {podiumData.meta.averageScore?.toLocaleString("fr-FR")}
              </Text>
              <Text fontSize="sm">
                {podiumData.meta.totalPlayers} joueur(s) au total
              </Text>
            </VStack>
          </Box>
        )}

      {/* Informations sur la semaine (mode weekly) */}
      {displayMode === "weekly" && isWeeklyResponse(podiumData) && (
        <Box p={4} bg={filterBg} borderRadius="md">
          <VStack spacing={3} align="center">
            <Text fontSize="lg" fontWeight="bold">
              Semaine {podiumData.meta.weekNumber}
            </Text>
            <HStack spacing={6} wrap="wrap" justify="center">
              {podiumData.meta.rotationsInfo.map((rotation, idx) => (
                <VStack key={idx} spacing={1}>
                  <CustomLink
                    to={`/cycle/${selectedCycle?._id}/rotation/${rotation.position}`}
                    text={`Rotation ${rotation.position}`}
                    textSize="sm"
                  />
                  <Text fontSize="xs">
                    {rotation.killer}
                  </Text>
                  <AttackTypeBadge attackType={rotation.attack} />
                </VStack>
              ))}
            </HStack>
            <Text fontSize="md" fontWeight="bold">
              Score moyen de la semaine:{" "}
              {podiumData.meta.averageWeekScore?.toLocaleString("fr-FR")}
            </Text>
            <Text fontSize="sm">
              {podiumData.meta.totalPlayers} joueur(s) au total
            </Text>
          </VStack>
        </Box>
      )}

      {/* Informations sur les miss (mode misses) */}
      {displayMode === "misses" && isMissesResponse(podiumData) && (
        <Box p={4} bg={filterBg} borderRadius="md">
          <VStack spacing={2}>
            <Text fontSize="lg" fontWeight="bold" color="red.500">
              📉 Classement des Miss
            </Text>
            <Text fontSize="md">
              {podiumData.meta.totalPlayersWithMisses} joueur{podiumData.meta.totalPlayersWithMisses > 1 ? "s" : ""} avec au moins
              1 miss
            </Text>
            <Text fontSize="sm">
              Total: {podiumData.meta.totalMissesInCycle} miss dans le cycle
            </Text>
            <Text fontSize="sm">
              Moyenne: {podiumData.meta.averageMissesPerPlayer}{" "}
              miss/joueur
            </Text>
          </VStack>
        </Box>
      )}
    </>
  );
};
