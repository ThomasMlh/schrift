import { Box, VStack, HStack, Text, Flex, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import type {
  IPodiumResponse,
  IPodiumWeeklyResponse,
  IPodiumMissesResponse,
} from "@/interfaces";
import PlayerCard from "@/components/ui/PlayerCard";
import PlayerCardWeekly from "@/components/ui/PlayerCardWeekly";
import PlayerCardMiss from "@/components/ui/PlayerCardMiss";
import { Pagination as PaginationComponent } from "@/components/ui/Pagination";
import { useTranslation } from "react-i18next";

type DisplayMode = "cycle" | "rotation" | "weekly" | "misses";

interface PodiumResultsProps {
  displayMode: DisplayMode;
  isLoading: boolean;
  podiumData: IPodiumResponse | IPodiumWeeklyResponse | IPodiumMissesResponse | null;
  selectedCycleId: string;
  selectedWeekNumber: string;
  onPageChange: (page: number) => void;
  selectedGuildName?: string; // Ajouter pour savoir si une guilde est filtrée
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

export const PodiumResults = ({
  displayMode,
  isLoading,
  podiumData,
  selectedCycleId,
  selectedWeekNumber,
  onPageChange,
  selectedGuildName = "",
}: PodiumResultsProps) => {
  const { t } = useTranslation();
  const showGuildName = !selectedGuildName; // Afficher la guilde si aucune n'est filtrée
  if (isLoading) {
    return (
      <Flex justify="center" align="center" py={8}>
        <VStack spacing={3}>
          <Spinner size="lg" />
          <Text>{t("components.podiumResults.loading")}</Text>
        </VStack>
      </Flex>
    );
  }

  if (!podiumData?.data || podiumData.data.length === 0) {
    return (
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <Text>
          {selectedCycleId
            ? displayMode === "weekly" && !selectedWeekNumber
              ? t("components.podiumResults.selectWeekFirst")
              : t("components.podiumResults.noScoreFound")
            : t("components.podiumResults.selectCycleFirst")}
        </Text>
      </Alert>
    );
  }

  return (
    <>
      {/* Informations sur les résultats */}
      {podiumData.pagination && (
        <Text fontSize="sm" color="gray.600">
          {t("components.podiumResults.paginationInfo", {
            current: podiumData.pagination.currentPage,
            total: podiumData.pagination.totalPages,
            count: podiumData.pagination.itemsOnPage,
          })}
        </Text>
      )}

      {/* Affichage mobile : toujours en colonne unique */}
      <Box display={{ base: "block", lg: "none" }}>
        <VStack spacing={3} align="stretch">
          {displayMode === "weekly" && isWeeklyResponse(podiumData)
            ? podiumData.data.map((player) =>
                PlayerCardWeekly(player, showGuildName)
              )
            : displayMode === "misses" && isMissesResponse(podiumData)
            ? podiumData.data.map((player) => PlayerCardMiss(player, showGuildName))
            : isPodiumResponse(podiumData)
            ? podiumData.data.map((player) =>
                PlayerCard(player, showGuildName, podiumData.meta.podiumType)
              )
            : null}
        </VStack>
      </Box>

      {/* Affichage desktop */}
      <Box display={{ base: "none", lg: "block" }}>
        {podiumData.data.length >= 10 ? (
          // 2 colonnes pour 10+ joueurs
          <HStack spacing={4} align="start">
            <VStack spacing={3} align="stretch" flex={1}>
              {displayMode === "weekly" && isWeeklyResponse(podiumData)
                ? podiumData.data
                    .slice(0, Math.ceil(podiumData.data.length / 2))
                    .map((player) => PlayerCardWeekly(player, showGuildName))
                : displayMode === "misses" && isMissesResponse(podiumData)
                ? podiumData.data
                    .slice(0, Math.ceil(podiumData.data.length / 2))
                    .map((player) => PlayerCardMiss(player, showGuildName))
                : isPodiumResponse(podiumData)
                ? podiumData.data
                    .slice(0, Math.ceil(podiumData.data.length / 2))
                  .map((player) =>
                    PlayerCard(player, showGuildName, podiumData.meta.podiumType)
                  )
                : null}
            </VStack>
            <VStack spacing={3} align="stretch" flex={1}>
              {displayMode === "weekly" && isWeeklyResponse(podiumData)
                ? podiumData.data
                    .slice(Math.ceil(podiumData.data.length / 2))
                    .map((player) => PlayerCardWeekly(player, showGuildName))
                : displayMode === "misses" && isMissesResponse(podiumData)
                ? podiumData.data
                    .slice(Math.ceil(podiumData.data.length / 2))
                    .map((player) => PlayerCardMiss(player, showGuildName))
                : isPodiumResponse(podiumData)
                ? podiumData.data
                    .slice(Math.ceil(podiumData.data.length / 2))
                    .map((player) =>
                      PlayerCard(player, showGuildName, podiumData.meta.podiumType)
                    )
                : null}
            </VStack>
          </HStack>
        ) : (
          // Colonne unique pour moins de 10 joueurs
          <VStack spacing={3} align="stretch">
            {displayMode === "weekly" && isWeeklyResponse(podiumData)
              ? podiumData.data.map((player) =>
                  PlayerCardWeekly(player, showGuildName)
                )
              : displayMode === "misses" && isMissesResponse(podiumData)
              ? podiumData.data.map((player) =>
                  PlayerCardMiss(player, showGuildName)
                )
              : isPodiumResponse(podiumData)
              ? podiumData.data.map((player) =>
                  PlayerCard(player, showGuildName, podiumData.meta.podiumType)
                )
              : null}
          </VStack>
        )}
      </Box>

      {/* Stats supplémentaires */}
      {podiumData && (
        <Text fontSize="xs" color="gray.500" textAlign="center">
          {isMissesResponse(podiumData)
            ? t("components.podiumResults.playersWithMiss", { count: podiumData.meta.totalPlayersWithMisses })
            : isPodiumResponse(podiumData) || isWeeklyResponse(podiumData)
            ? t("components.podiumResults.playersTotal", { count: podiumData.meta.totalPlayers })
            : ""}
        </Text>
      )}

      {/* Pagination */}
      {podiumData.pagination && (
        <PaginationComponent
          currentPage={podiumData.pagination.currentPage}
          totalPages={podiumData.pagination.totalPages}
          hasPrevPage={podiumData.pagination.hasPrevPage}
          hasNextPage={podiumData.pagination.hasNextPage}
          onPageChange={onPageChange}
          totalCount={podiumData.pagination.totalCount}
          itemsOnPage={podiumData.pagination.itemsOnPage}
        />
      )}
    </>
  );
};
