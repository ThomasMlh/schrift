import { useState } from "react";
import { Avatar, Box, Button, Flex, HStack, Icon, Skeleton, Stack, Text } from "@chakra-ui/react";
import { FiShield } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useMonthlyWinners } from "@/hooks/useAPI";
import { MedalBadge } from "@/components/ui/MedalBadge";
import CustomLink from "@/components/ui/CustomLink";
import { getUserAvatarUrl } from "@/utils/discord";
import { buildPlayerUrl } from "@/utils/playerUrl";
import { formatMonthKey, formatScore } from "@/utils/format";

const INITIAL_MONTHS = 6;

// Winners of every finished month (top 3 and guild of the month), most recent first
export const MonthlyHallOfFame = ({ onSelectMonth }: { onSelectMonth: (month: string) => void }) => {
  const { t, i18n } = useTranslation();
  const { months, isLoading } = useMonthlyWinners();
  const [expanded, setExpanded] = useState(false);

  if (isLoading) return <Skeleton h="200px" borderRadius="xl" />;
  if (months.length === 0) return null;

  const visible = expanded ? months : months.slice(0, INITIAL_MONTHS);

  return (
    <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
      <Text fontSize="sm" fontWeight="semibold" color="text.strong">{t("components.monthlyHallOfFame.title")}</Text>
      <Text fontSize="xs" color="text.muted" mb={3}>{t("components.monthlyHallOfFame.subtitle")}</Text>

      <Stack spacing={2}>
        {visible.map((month) => (
          <Flex
            key={month.key}
            direction={{ base: "column", lg: "row" }}
            align={{ base: "stretch", lg: "center" }}
            gap={3}
            p={3}
            borderRadius="lg"
            bg="bg.subtle"
          >
            <Box w={{ lg: "150px" }} flexShrink={0}>
              <Button
                variant="link"
                size="sm"
                colorScheme="purple"
                textTransform="capitalize"
                onClick={() => onSelectMonth(month.key)}
                title={t("components.monthlyHallOfFame.view")}
              >
                {formatMonthKey(month.key, i18n.language)}
              </Button>
              <Text fontSize="2xs" color="text.muted">{month.start_date} → {month.end_date}</Text>
            </Box>

            <Flex flex={1} gap={3} wrap="wrap" minW={0}>
              {month.players.length === 0 && (
                <Text fontSize="xs" color="text.muted">{t("components.monthlyHallOfFame.noPlayer")}</Text>
              )}
              {month.players.map((player) => {
                const name = player.bbs_name || player.global_name || t("components.monthlyHallOfFame.player");
                const avatarUrl = player.avatar && player.discord_id
                  ? getUserAvatarUrl({ discord_id: player.discord_id, avatar: player.avatar }) || undefined
                  : undefined;
                return (
                  <HStack key={player.bbs_id} spacing={2} minW={{ base: "100%", sm: "180px" }} flex={{ sm: 1 }}>
                    <MedalBadge rank={Math.min(player.rank, 3) as 1 | 2 | 3} size={20} />
                    <Avatar size="xs" src={avatarUrl} name={name} />
                    <Box minW={0}>
                      <CustomLink
                        to={buildPlayerUrl(player.bbs_name, player.bbs_id)}
                        text={name}
                        textSize="sm"
                        sx={{ fontWeight: player.rank === 1 ? "bold" : "medium", noOfLines: 1 }}
                      />
                      <Text fontSize="2xs" color="text.muted">
                        {formatScore(player.averageScore)}{player.guild_name ? ` · ${player.guild_name}` : ""}
                      </Text>
                    </Box>
                  </HStack>
                );
              })}
            </Flex>

            {month.guild?.name && (
              <HStack
                spacing={2}
                flexShrink={0}
                px={3}
                py={1.5}
                borderRadius="full"
                borderWidth="1px"
                borderColor="yellow.400"
                alignSelf={{ base: "flex-start", lg: "center" }}
                title={t("components.monthlyHallOfFame.guild")}
              >
                <Icon as={FiShield} color="yellow.400" />
                <Text fontSize="sm" fontWeight="bold" color="text.strong">{month.guild.name}</Text>
                <Text fontSize="xs" color="text.muted">{formatScore(month.guild.averageScore)}</Text>
              </HStack>
            )}
          </Flex>
        ))}
      </Stack>

      {months.length > INITIAL_MONTHS && (
        <Button size="sm" variant="ghost" mt={3} w="100%" onClick={() => setExpanded((v) => !v)}>
          {expanded ? t("components.monthlyHallOfFame.showLess") : t("components.monthlyHallOfFame.showAll", { count: months.length })}
        </Button>
      )}
    </Box>
  );
};
