import { Box, Flex, HStack, Progress, SimpleGrid, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { EventState, IHuntView } from "@/interfaces";
import { useAuth } from "@/providers/AuthProvider";
import { GiftBox } from "./GiftBox";

// Gift hunt on the event page: the hint of the day and the player's finds; the gift itself is on another page
export const GiftHuntCard = ({ hunt, state }: { hunt: IHuntView; state: EventState }) => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const hasBadge = Boolean(hunt.badge_name);
  return (
    <Box
      borderRadius="2xl"
      p={{ base: 4, md: 6 }}
      color="white"
      bgGradient="linear(150deg, #3b1546, #7a1f3d 55%, #a16207)"
      position="relative"
      overflow="hidden"
    >
      <Flex gap={4} align="flex-start" wrap="wrap">
        <GiftBox size={56} color="#1F5E3B" dimmed={hunt.found_today} />
        <Box flex={1} minW="220px">
          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="orange.100">{t("pages.hunt.eyebrow")}</Text>
          <Text fontSize="xl" fontWeight="extrabold">{t("pages.hunt.title")}</Text>
          <Text fontSize="sm" color="orange.50" mt={1}>
            {t("pages.hunt.intro", { points: hunt.points, count: hunt.tickets })}
          </Text>
        </Box>
      </Flex>

      <Box mt={5} bg="blackAlpha.400" borderRadius="xl" px={4} py={3} borderWidth="1px" borderColor="whiteAlpha.300">
        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" color="yellow.200">
          {hunt.today ? t("pages.hunt.hintOf", { day: hunt.today }) : t("pages.hunt.hint")}
        </Text>
        <Text fontSize="lg" fontWeight="bold" mt={1}>
          {state === "upcoming" ? t("pages.hunt.notStarted")
            : state === "over" ? t("pages.hunt.over")
              : hunt.found_today ? t("pages.hunt.foundToday")
                : hunt.hint ? `« ${hunt.hint} »` : t("pages.hunt.noGiftToday")}
        </Text>
        {state === "open" && !hunt.found_today && hunt.hint && (
          <Text fontSize="sm" color="orange.50" mt={1}>{isLoggedIn ? t("pages.hunt.howTo") : t("pages.hunt.loginFirst")}</Text>
        )}
      </Box>

      <SimpleGrid columns={hasBadge ? 2 : 1} spacing={3} mt={4}>
        <Box bg="whiteAlpha.200" borderRadius="lg" px={3} py={2}>
          <Text fontSize="2xl" fontWeight="extrabold" sx={{ fontVariantNumeric: "tabular-nums" }}>{hunt.found}</Text>
          <Text fontSize="xs" color="orange.50">{t("pages.hunt.found", { count: hunt.found })}</Text>
        </Box>
        {hasBadge && (
          <Box bg="whiteAlpha.200" borderRadius="lg" px={3} py={2}>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm" fontWeight="bold" noOfLines={1}>🏅 {hunt.badge_name}</Text>
              <Text fontSize="xs" sx={{ fontVariantNumeric: "tabular-nums" }}>{Math.min(hunt.found, hunt.badge_min)}/{hunt.badge_min}</Text>
            </HStack>
            <Progress value={(Math.min(hunt.found, hunt.badge_min) / hunt.badge_min) * 100} size="sm" colorScheme="yellow" borderRadius="full" bg="whiteAlpha.300" />
            <Text fontSize="xs" color="orange.50" mt={1}>
              {hunt.found >= hunt.badge_min ? t("pages.hunt.badgeDone") : t("pages.hunt.badgeHow", { count: hunt.badge_min })}
            </Text>
          </Box>
        )}
      </SimpleGrid>
    </Box>
  );
};
