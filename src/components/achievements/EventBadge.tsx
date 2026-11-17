import { Box, HStack, SimpleGrid, Text, Tooltip, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { IEventBadge } from "@/interfaces";

// Medal of a limited edition event badge: a cake on a ribboned medal, with the year
export const EventBadgeMedal = ({ year, size = 64, locked = false }: { year: number; size?: number; locked?: boolean }) => (
  <Box as="svg" viewBox="0 0 64 72" w={`${size}px`} h={`${(size * 72) / 64}px`} flexShrink={0} aria-hidden filter={locked ? "grayscale(1) opacity(0.45)" : undefined}>
    <defs>
      <linearGradient id={`event-medal-${year}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FCD34D" />
        <stop offset="0.55" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
    </defs>
    <path d="M18 44 10 68l9-4 5 8 8-22z" fill="#7C3AED" />
    <path d="M46 44l8 24-9-4-5 8-8-22z" fill="#4F46E5" />
    <circle cx="32" cy="30" r="26" fill={`url(#event-medal-${year})`} stroke="#FEF3C7" strokeWidth="2" />
    <circle cx="32" cy="30" r="20" fill="none" stroke="#FEF3C7" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="2 3" />
    <g fill="none" stroke="#4C1D95" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 39h22M22 39v-8h20v8M24 31v-5h16v5" />
      <path d="M28 26v-4M32 26v-4M36 26v-4" />
      <path d="M22 35c2.5 2 4.5 2 7 0s4.5-2 7 0 4.5 2 6 0" />
    </g>
    <circle cx="28" cy="20" r="1.4" fill="#DC2626" />
    <circle cx="32" cy="20" r="1.4" fill="#DC2626" />
    <circle cx="36" cy="20" r="1.4" fill="#DC2626" />
    <text x="32" y="51" textAnchor="middle" fontSize="8" fontWeight="800" fill="#4C1D95">{year}</text>
  </Box>
);

// "Events" block of the player page: the limited edition badges the account earned
export const EventBadges = ({ badges }: { badges: IEventBadge[] }) => {
  const { t, i18n } = useTranslation();
  if (badges.length === 0) return null;
  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";
  return (
    <Box>
      <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="text.muted" mb={2}>
        {t("achievements.categories.events")}
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={3}>
        {badges.map((badge) => (
          <Tooltip key={badge.event_id} label={t("achievements.eventBadge.tooltip", { event: badge.event_name })} hasArrow>
            <HStack bg="bg.card" borderWidth="1px" borderColor="orange.300" borderRadius="lg" p={3} spacing={3}>
              <EventBadgeMedal year={badge.year} size={52} />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">{badge.name}</Text>
                <Text fontSize="xs" color="orange.400" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">{t("achievements.eventBadge.limited")}</Text>
                <Text fontSize="xs" color="text.muted">
                  {t("achievements.eventBadge.earned", { date: new Date(badge.earned_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }) })}
                  {" · "}{t("achievements.eventBadge.holders", { count: badge.holders })}
                </Text>
              </VStack>
            </HStack>
          </Tooltip>
        ))}
      </SimpleGrid>
    </Box>
  );
};
