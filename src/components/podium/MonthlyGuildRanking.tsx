import { Box, HStack, SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGuildRankings } from "@/hooks/useAPI";
import { MedalBadge } from "@/components/ui/MedalBadge";
import { formatWithCommas } from "@/utils/format";

// Guilds ranked by their average over the month (only guilds with scores that month)
export const MonthlyGuildRanking = ({ month }: { month: string }) => {
  const { t } = useTranslation();
  const { rankings, isLoading } = useGuildRankings(undefined, month);
  const ranked = rankings.filter((g) => g.totalScores > 0);

  if (isLoading) return <Skeleton h="72px" borderRadius="lg" />;
  if (ranked.length === 0) return null;

  return (
    <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
      <Text fontSize="sm" fontWeight="semibold" color="text.strong" mb={3}>
        {t("components.monthlyGuildRanking.title")}
      </Text>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: Math.min(ranked.length, 4) }} gap={3}>
        {ranked.map((guild, index) => (
          <HStack
            key={guild._id}
            as={Link}
            to={`/guildes?guild_name=${encodeURIComponent(guild.name)}`}
            spacing={3}
            p={3}
            borderRadius="lg"
            bg="bg.subtle"
            borderWidth="1px"
            borderColor={index === 0 ? "yellow.400" : "transparent"}
            _hover={{ bg: "bg.hover" }}
          >
            {index < 3 ? (
              <MedalBadge rank={(index + 1) as 1 | 2 | 3} />
            ) : (
              <Text w="28px" textAlign="center" fontWeight="bold" color="text.muted">#{index + 1}</Text>
            )}
            <Box minW={0}>
              <Text fontWeight="bold" color="text.strong" noOfLines={1}>{guild.name}</Text>
              <Text fontSize="xs" color="text.muted">
                ø {formatWithCommas(guild.averageScore)} · {t("components.monthlyGuildRanking.scores", { count: guild.totalScores })}
              </Text>
            </Box>
          </HStack>
        ))}
      </SimpleGrid>
    </Box>
  );
};
