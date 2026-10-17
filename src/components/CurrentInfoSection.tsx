import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Alert,
  AlertIcon,
  Flex,
  Progress,
  Link,
  SimpleGrid,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageLoader } from "./ui/PageLoader";
import { HomeSectionHeader } from "./ui/HomeSectionHeader";
import { FaClock, FaCalendarAlt } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { AttackTypeBadge } from "./ui/AttackTypeBadge";
import { AlterationImage } from "./ui/AlterationImage";
import { useCycles } from "@/hooks/useAPI";
import { getRotationRealDates } from "@/utils/cycleHelpers";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import type { ICycleRotation } from "@/interfaces";

const UPCOMING_COUNT = 3;

const formatDateTime = (date: Date) =>
  date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) +
  " · " +
  date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const formatShortDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" });

/** "2 j 04 h 12 min" (or "04 h 12 min" under 24 h) */
const formatCountdown = (ms: number) => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return days > 0
    ? `${days} j ${pad(hours)} h ${pad(minutes)} min`
    : `${pad(hours)} h ${pad(minutes)} min`;
};

/** Current time, refreshed every minute for the countdown */
const useNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
};

const rotationDates = (rotation: ICycleRotation) =>
  getRotationRealDates(rotation.start_date, rotation.end_date);

export const CurrentInfoSection = () => {
  const { t } = useTranslation();
  const now = useNow();
  const [error, setError] = useState<string | null>(null);

  const {
    cycles: allCycles,
    isLoading,
    error: cyclesError
  } = useCycles({ limit: 5, authenticated: true });

  const { currentCycle, nextCycle, currentRotation, isRotationActive } =
    useCurrentRotation(allCycles, isLoading);

  useEffect(() => {
    if (cyclesError) setError(t("components.currentInfoSection.errorLoading"));
  }, [cyclesError, t]);

  const cycle = currentCycle || nextCycle;
  const rotations = (cycle?.rotations ?? []).filter((r) => r.start_date && r.end_date);
  // For an upcoming cycle, the featured rotation is the first one
  const featured = currentRotation ?? (nextCycle ? rotations[0] ?? null : null);
  const featuredIndex = featured ? rotations.indexOf(featured) : -1;
  const featuredPosition = featured ? featured.position || featuredIndex + 1 : 0;
  const featuredActive = Boolean(currentRotation && isRotationActive);
  const upcoming = featuredIndex >= 0 ? rotations.slice(featuredIndex + 1, featuredIndex + 1 + UPCOMING_COUNT) : [];

  // Progress: finished rotations (plus the current one) out of the total
  const doneCount = featuredIndex >= 0 ? featuredIndex + (featuredActive ? 1 : 0) : 0;
  const progress = rotations.length ? (doneCount / rotations.length) * 100 : 0;

  const cycleBounds = rotations.length
    ? getRotationRealDates(rotations[0].start_date, rotations[rotations.length - 1].end_date)
    : null;

  const featuredDates = featured ? rotationDates(featured) : null;
  const countdownTarget = featuredDates ? (featuredActive ? featuredDates.realEndDate : featuredDates.realStartDate) : null;

  return (
    <Box w="100%">
      <HomeSectionHeader
        icon={FaClock}
        title={t("components.currentInfoSection.heading")}
        subtitle={t("components.currentInfoSection.subheading")}
      />

      <Box
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="border.subtle"
        bg="bg.card"
        boxShadow="md"
        overflow="hidden"
      >
        {error ? (
          <Box p={5}>
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Text>{error}</Text>
            </Alert>
          </Box>
        ) : isLoading ? (
          <PageLoader label={t("components.currentInfoSection.loading")} color="purple.400" height="200px" />
        ) : !cycle ? (
          <Flex justify="center" align="center" py={12}>
            <VStack spacing={3}>
              <Icon as={FaCalendarAlt} boxSize={10} color="text.muted" opacity={0.5} />
              <Text fontSize="md" fontWeight="semibold" color="text.muted">
                {t("components.currentInfoSection.noCycle")}
              </Text>
            </VStack>
          </Flex>
        ) : (
          <>
            <Flex
              px={{ base: 4, md: 6 }} py={5}
              gap={{ base: 4, md: 8 }}
              direction={{ base: "column", md: "row" }}
              align={{ base: "stretch", md: "center" }}
              justify="space-between"
              borderBottomWidth="1px"
              borderColor="border.subtle"
            >
              <Box minW={0}>
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="accent">
                  {currentCycle
                    ? t("components.currentInfoSection.cycleActive")
                    : t("components.currentInfoSection.cycleNext")}
                </Text>
                <Link
                  as={RouterLink}
                  to={`/cycle/${cycle._id}`}
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight="extrabold"
                  letterSpacing="tight"
                  color="text.strong"
                  _hover={{ color: "accent" }}
                >
                  {cycle.name} — {cycle.year}
                </Link>
                {cycleBounds && (
                  <Text fontSize="sm" color="text.muted">
                    {t("components.currentInfoSection.cycleRange", {
                      start: formatShortDate(cycleBounds.realStartDate),
                      end: formatShortDate(cycleBounds.realEndDate),
                    })}
                  </Text>
                )}
              </Box>

              {rotations.length > 0 && (
                <Box w={{ base: "100%", md: "280px" }} flexShrink={0}>
                  <HStack justify="space-between" mb={2} fontSize="sm">
                    <Text color="text.muted">{t("components.currentInfoSection.progressLabel")}</Text>
                    <Text fontWeight="bold" color="text.strong">
                      {doneCount} / {rotations.length}
                    </Text>
                  </HStack>
                  <Progress
                    value={progress}
                    size="sm"
                    borderRadius="full"
                    colorScheme="purple"
                    bg="bg.inset"
                    aria-label={t("components.currentInfoSection.progressLabel")}
                  />
                </Box>
              )}
            </Flex>

            <SimpleGrid columns={{ base: 1, lg: 5 }}>
              <Box gridColumn={{ lg: "span 3" }} px={{ base: 4, md: 6 }} py={5}>
                {featured && featuredDates ? (
                  <VStack align="stretch" spacing={4}>
                    <HStack spacing={2}>
                      {featuredActive && (
                        <Box
                          w="8px" h="8px" borderRadius="full" bg="green.400"
                          boxShadow="0 0 0 4px rgba(72,187,120,0.2)"
                        />
                      )}
                      <Text
                        fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest"
                        color={featuredActive ? "green.400" : "orange.400"}
                      >
                        {featuredActive
                          ? t("components.currentInfoSection.rotationActive")
                          : t("components.currentInfoSection.rotationNext")}
                      </Text>
                    </HStack>

                    <Flex gap={4} align="center" wrap="wrap">
                      <Link
                        as={RouterLink}
                        to={`/cycle/${cycle._id}/rotation/${featuredPosition}`}
                        fontSize={{ base: "3xl", md: "4xl" }}
                        fontWeight="extrabold"
                        lineHeight={1}
                        letterSpacing="tight"
                        bgGradient="linear(to-r, purple.300, blue.400)"
                        bgClip="text"
                        _hover={{ opacity: 0.8 }}
                      >
                        #{featuredPosition}
                      </Link>
                      <Box minW={0}>
                        <Text fontSize="xl" fontWeight="bold" color="text.strong" lineHeight="short">
                          {t(`factions.${featured.killer}`, featured.killer)}
                        </Text>
                        <HStack spacing={2} mt={1}>
                          <AttackTypeBadge attackType={featured.attack} size="20px" />
                          <AlterationImage alteration={featured.alteration} showLabel size="20px" />
                        </HStack>
                      </Box>
                    </Flex>

                    {countdownTarget && (
                      <Flex
                        borderRadius="xl"
                        bg="bg.subtle"
                        borderWidth="1px"
                        borderColor="border.subtle"
                        px={4} py={3}
                        gap={{ base: 2, sm: 6 }}
                        direction={{ base: "column", sm: "row" }}
                        justify="space-between"
                        align={{ base: "start", sm: "center" }}
                      >
                        <Box>
                          <Text fontSize="xs" color="text.muted">
                            {featuredActive
                              ? t("components.currentInfoSection.endsIn")
                              : t("components.currentInfoSection.startsIn")}
                          </Text>
                          <Text fontSize="xl" fontWeight="extrabold" color="text.strong" sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {formatCountdown(countdownTarget.getTime() - now.getTime())}
                          </Text>
                        </Box>
                        <VStack align={{ base: "start", sm: "end" }} spacing={0} fontSize="sm" color="text.muted">
                          <Text>{t("components.currentInfoSection.labelStart")} {formatDateTime(featuredDates.realStartDate)}</Text>
                          <Text>{t("components.currentInfoSection.labelEnd")} {formatDateTime(featuredDates.realEndDate)}</Text>
                        </VStack>
                      </Flex>
                    )}
                  </VStack>
                ) : (
                  <Text fontSize="sm" color="text.muted">
                    {t("components.currentInfoSection.noRotationDefined")}
                  </Text>
                )}
              </Box>

              <Box
                gridColumn={{ lg: "span 2" }}
                px={{ base: 4, md: 6 }} py={5}
                borderTopWidth={{ base: "1px", lg: 0 }}
                borderLeftWidth={{ base: 0, lg: "1px" }}
                borderColor="border.subtle"
              >
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="text.muted" mb={3}>
                  {t("components.currentInfoSection.upcoming")}
                </Text>
                {upcoming.length === 0 ? (
                  <Text fontSize="sm" color="text.muted">
                    {t("components.currentInfoSection.lastRotation")}
                  </Text>
                ) : (
                  <VStack align="stretch" spacing={1}>
                    {upcoming.map((rotation) => {
                      const position = rotation.position || rotations.indexOf(rotation) + 1;
                      return (
                        <Link
                          key={rotation._id ?? position}
                          as={RouterLink}
                          to={`/cycle/${cycle._id}/rotation/${position}`}
                          display="flex"
                          alignItems="center"
                          gap={3}
                          px={3} py={2}
                          mx={-3}
                          borderRadius="lg"
                          _hover={{ bg: "bg.hover", textDecoration: "none" }}
                        >
                          <Text fontSize="sm" fontWeight="bold" color="text.muted" w="32px" sx={{ fontVariantNumeric: "tabular-nums" }}>
                            #{position}
                          </Text>
                          <AttackTypeBadge attackType={rotation.attack} size="12px" />
                          <Text fontSize="sm" fontWeight="semibold" color="text.strong" flex={1} noOfLines={1}>
                            {t(`factions.${rotation.killer}`, rotation.killer)}
                          </Text>
                          <Text fontSize="xs" color="text.muted" flexShrink={0}>
                            {formatShortDate(rotationDates(rotation).realStartDate)}
                          </Text>
                          <Icon as={FiChevronRight} boxSize={4} color="text.muted" flexShrink={0} />
                        </Link>
                      );
                    })}
                  </VStack>
                )}
              </Box>
            </SimpleGrid>
          </>
        )}
      </Box>
    </Box>
  );
};
