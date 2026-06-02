import { Box, VStack, HStack, Text, Flex, Alert, AlertIcon, Divider } from "@chakra-ui/react";
import { PageLoader } from "@/components/ui/PageLoader";
import type {
  IPodiumResponse,
  IPodiumWeeklyResponse,
  IPodiumMissesResponse,
  IPodiumPlayer,
} from "@/interfaces";
import PlayerCard from "@/components/ui/PlayerCard";
import PlayerCardWeekly from "@/components/ui/PlayerCardWeekly";
import PlayerCardMiss from "@/components/ui/PlayerCardMiss";
import { PodiumPedestal } from "./PodiumPedestal";
import type { PodiumPedestalPlayer } from "./PodiumPedestal";
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
  selectedGuildName?: string;
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

// Extrait les joueurs top 3 normalisés pour le PodiumPedestal
const extractTop3ForPedestal = (
  data: IPodiumResponse | IPodiumWeeklyResponse,
  podiumType?: "individual_scores" | "average_scores" | "max_scores",
  isFirstPage = true
): PodiumPedestalPlayer[] => {
  if (!isFirstPage) return [];

  const top3 = data.data
    ? (data.data as (typeof data.data[number])[]).filter((p) => p.rank <= 3)
    : [];

  if (isWeeklyResponse(data)) {
    return top3.map((p) => {
      const wp = p as IPodiumWeeklyResponse["data"][number];
      return {
        rank: wp.rank,
        user_id: wp.user_id,
        bbs_name: wp.bbs_name,
        global_name: wp.global_name,
        discord_id: wp.discord_id,
        avatar: wp.avatar,
        guild_name: wp.guild_name,
        displayScore: wp.week_total_score,
        forceBlueScore: true,
      };
    });
  }

  if (isPodiumResponse(data)) {
    return top3.map((p) => {
      const pp = p as IPodiumPlayer;
      if (!pp) return null;
      const isRotation = pp.score !== undefined;
      const score =
        podiumType === "max_scores"
          ? pp.totalScore ?? pp.averageScore ?? 0
          : isRotation
          ? pp.score ?? 0
          : pp.averageScore ?? pp.totalScore ?? 0;
      return {
        rank: pp.rank,
        user_id: pp.user_id,
        bbs_name: pp.bbs_name,
        global_name: pp.global_name,
        discord_id: pp.discord_id,
        avatar: pp.avatar,
        guild_name: pp.guild_name,
        displayScore: score,
        forceBlueScore: !isRotation,
      };
    }).filter(Boolean) as PodiumPedestalPlayer[];
  }

  return [];
};

const PlayerList = ({
  displayMode,
  podiumData,
  showGuildName,
}: {
  displayMode: DisplayMode;
  podiumData: IPodiumResponse | IPodiumWeeklyResponse | IPodiumMissesResponse;
  showGuildName: boolean;
}) => {
  // Exclure le top 3 de la liste si on est en mode avec podium visuel (page 1)
  const isFirstPage = !podiumData.pagination || podiumData.pagination.currentPage === 1;
  const showPedestal =
    (displayMode === "cycle" || displayMode === "rotation" || displayMode === "weekly") &&
    isFirstPage;
  const listData = showPedestal
    ? (podiumData.data ?? []).filter((p) => p.rank > 3)
    : (podiumData.data ?? []);

  if (listData.length === 0) return null;

  return (
    <VStack spacing={2} align="stretch">
      {displayMode === "weekly" && isWeeklyResponse(podiumData)
        ? listData.map((player) => (
            <PlayerCardWeekly
              key={player.user_id}
              player={player as IPodiumWeeklyResponse["data"][number]}
              showGuildName={showGuildName}
            />
          ))
        : displayMode === "misses" && isMissesResponse(podiumData)
        ? listData.map((player) => (
            <PlayerCardMiss
              key={player.user_id}
              player={player as IPodiumMissesResponse["data"][number]}
              showGuildName={showGuildName}
            />
          ))
        : isPodiumResponse(podiumData)
        ? listData.map((player) => (
            <PlayerCard
              key={player.user_id}
              player={player as IPodiumPlayer}
              showGuildName={showGuildName}
              podiumType={podiumData.meta.podiumType}
            />
          ))
        : null}
    </VStack>
  );
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
  const showGuildName = !selectedGuildName;

  if (isLoading) {
    return (
      <PageLoader label={t("components.podiumResults.loading")} color="blue.400" height="300px" />
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

  const isFirstPage = !podiumData.pagination || podiumData.pagination.currentPage === 1;
  const showPedestal =
    (displayMode === "cycle" || displayMode === "rotation" || displayMode === "weekly") &&
    isFirstPage &&
    podiumData.data.some((p) => p.rank === 1);

  const pedestalPlayers =
    showPedestal && !isMissesResponse(podiumData)
      ? extractTop3ForPedestal(
          podiumData,
          isPodiumResponse(podiumData) ? podiumData.meta.podiumType : undefined,
          isFirstPage
        )
      : [];

  const hasListPlayers = showPedestal
    ? podiumData.data.some((p) => p.rank > 3)
    : true;

  return (
    <VStack spacing={4} align="stretch">
      {/* Podium visuel Top 3 */}
      {showPedestal && pedestalPlayers.length > 0 && (
        <PodiumPedestal players={pedestalPlayers} showGuildName={showGuildName} />
      )}

      {/* Info pagination */}
      {podiumData.pagination && (
        <Flex justify="space-between" align="center" px={1}>
          <Text fontSize="sm" color="gray.500">
            {t("components.podiumResults.paginationInfo", {
              current: podiumData.pagination.currentPage,
              total: podiumData.pagination.totalPages,
              count: podiumData.pagination.itemsOnPage,
            })}
          </Text>
          <Text fontSize="xs" color="gray.400">
            {isMissesResponse(podiumData)
              ? t("components.podiumResults.playersWithMiss", { count: podiumData.meta.totalPlayersWithMisses })
              : t("components.podiumResults.playersTotal", { count: podiumData.meta.totalPlayers })}
          </Text>
        </Flex>
      )}

      {/* Séparateur si on a le podium ET la liste */}
      {showPedestal && hasListPlayers && pedestalPlayers.length > 0 && (
        <HStack spacing={3} align="center">
          <Divider />
          <Text fontSize="xs" color="gray.500" whiteSpace="nowrap" flexShrink={0}>
            {t("components.podiumResults.restOfRanking", "Classement complet")}
          </Text>
          <Divider />
        </HStack>
      )}

      {/* Liste des joueurs (desktop 2 colonnes, mobile 1) */}
      {hasListPlayers && (
        <>
          {/* Mobile */}
          <Box display={{ base: "block", lg: "none" }}>
            <PlayerList
              displayMode={displayMode}
              podiumData={podiumData}
              showGuildName={showGuildName}
            />
          </Box>

          {/* Desktop */}
          <Box display={{ base: "none", lg: "block" }}>
            {(() => {
              const allData = showPedestal
                ? podiumData.data.filter((p) => p.rank > 3)
                : podiumData.data;

              if (allData.length === 0) return null;

              const renderList = (items: typeof allData) => {
                if (displayMode === "weekly" && isWeeklyResponse(podiumData)) {
                  return items.map((p) => (
                    <PlayerCardWeekly
                      key={p.user_id}
                      player={p as IPodiumWeeklyResponse["data"][number]}
                      showGuildName={showGuildName}
                    />
                  ));
                }
                if (displayMode === "misses" && isMissesResponse(podiumData)) {
                  return items.map((p) => (
                    <PlayerCardMiss
                      key={p.user_id}
                      player={p as IPodiumMissesResponse["data"][number]}
                      showGuildName={showGuildName}
                    />
                  ));
                }
                if (isPodiumResponse(podiumData)) {
                  return items.map((p) => (
                    <PlayerCard
                      key={p.user_id}
                      player={p as IPodiumPlayer}
                      showGuildName={showGuildName}
                      podiumType={podiumData.meta.podiumType}
                    />
                  ));
                }
                return null;
              };

              // #4 pleine largeur quand le podium visuel est affiché, puis colonnes équilibrées
              const showFeaturedFourth = showPedestal && allData[0]?.rank === 4;
              const columnsData = showFeaturedFourth ? allData.slice(1) : allData;
              const useColumns = columnsData.length >= 10;

              if (!showFeaturedFourth && !useColumns) {
                return (
                  <PlayerList
                    displayMode={displayMode}
                    podiumData={podiumData}
                    showGuildName={showGuildName}
                  />
                );
              }

              if (!useColumns) {
                return (
                  <VStack spacing={2} align="stretch">
                    {showFeaturedFourth && renderList([allData[0]])}
                    {renderList(columnsData)}
                  </VStack>
                );
              }

              const mid = Math.ceil(columnsData.length / 2);
              const leftData = columnsData.slice(0, mid);
              const rightData = columnsData.slice(mid);

              return (
                <VStack spacing={2} align="stretch">
                  {showFeaturedFourth && renderList([allData[0]])}
                  <HStack spacing={4} align="start">
                    <VStack spacing={2} align="stretch" flex={1}>
                      {renderList(leftData)}
                    </VStack>
                    <VStack spacing={2} align="stretch" flex={1}>
                      {renderList(rightData)}
                    </VStack>
                  </HStack>
                </VStack>
              );
            })()}
          </Box>
        </>
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
    </VStack>
  );
};
