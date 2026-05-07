import { useState, useMemo } from "react";
import {
  Box,
  Text,
  HStack,
  Flex,
  IconButton,
  Button,
  Tooltip,
  Spinner,
  Center,
  useColorMode,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { AttackTypeBadge } from "../ui/AttackTypeBadge";
import { AlterationImage } from "../ui/AlterationImage";
import { useCycles } from "@/hooks/useAPI";
import { getRotationRealDates, isCycleActive } from "@/utils/cycleHelpers";
import type { ICycle, ICycleRotation } from "@/interfaces";
import { useTranslation } from "react-i18next";

function toUTCKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function toLocalKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Bar color driven by attack type
function getAttackColor(attack: string): { solid: string; bg: string } {
  const a = attack?.toUpperCase();
  if (a === "R") return { solid: "#E53E3E", bg: "rgba(229,62,62,0.12)" };   // red
  if (a === "B") return { solid: "#3182CE", bg: "rgba(49,130,206,0.12)" };  // blue
  return { solid: "#DD6B20", bg: "rgba(221,107,32,0.12)" };                 // melee / orange
}

// Used for past-cycle bars and legend swatches
const LEGEND_PALETTE = [
  { solid: "#3182CE", bg: "rgba(49,130,206,0.15)" },
  { solid: "#9F7AEA", bg: "rgba(159,122,234,0.15)" },
  { solid: "#38A169", bg: "rgba(56,161,105,0.15)" },
  { solid: "#DD6B20", bg: "rgba(221,107,32,0.15)" },
  { solid: "#D53F8C", bg: "rgba(213,63,140,0.15)" },
  { solid: "#319795", bg: "rgba(49,151,149,0.15)" },
];

interface RotationEntry {
  cycle: ICycle;
  rotation: ICycleRotation;
  colorIdx: number;
  isCurrentCycle: boolean;
  isStart: boolean;
  isEnd: boolean;
}

// Two tracks per day: track 0 = "Mardi-Jeudi", track 1 = "Vendredi-Dimanche"
type DayTracks = [RotationEntry | null, RotationEntry | null];

const BAR_H = "22px";

const RotationCalendar = () => {
  const { i18n, t } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const { cycles = [], isLoading } = useCycles({ limit: 1000 });

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        month: "long",
        year: "numeric",
      }).format(viewDate),
    [viewDate, i18n.language]
  );

  const dayNames = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Intl.DateTimeFormat(i18n.language, { weekday: "short" }).format(
          new Date(2024, 0, 1 + i)
        )
      ),
    [i18n.language]
  );

  const cellBg = isDark ? "#1a1b2e" : "white";
  const cellBorder = isDark ? "rgba(255,255,255,0.07)" : "#E2E8F0";
  const outsideBg = isDark ? "rgba(255,255,255,0.01)" : "#F7FAFC";
  const dayHeaderColor = isDark ? "#718096" : "#A0AEC0";
  const textColor = isDark ? "rgba(255,255,255,0.9)" : "#2D3748";
  const subColor = isDark ? "rgba(255,255,255,0.4)" : "#A0AEC0";

  // Two tracks: index 0 = Mardi-Jeudi, index 1 = Vendredi-Dimanche
  const dayIndex = useMemo(() => {
    const index = new Map<string, DayTracks>();

    cycles.forEach((cycle, i) => {
      const isCurrentCycle = isCycleActive(cycle);

      cycle.rotations.forEach((rotation) => {
        if (!rotation.start_date || !rotation.end_date) return;

        const { realStartDate, realEndDate } = getRotationRealDates(
          rotation.start_date,
          rotation.end_date
        );

        const startKey = toUTCKey(realStartDate);
        const endKey = toUTCKey(realEndDate);
        const track: 0 | 1 = rotation.period === "Mardi-Jeudi" ? 0 : 1;

        const cur = new Date(
          Date.UTC(
            realStartDate.getUTCFullYear(),
            realStartDate.getUTCMonth(),
            realStartDate.getUTCDate()
          )
        );
        const endDay = new Date(
          Date.UTC(
            realEndDate.getUTCFullYear(),
            realEndDate.getUTCMonth(),
            realEndDate.getUTCDate()
          )
        );

        while (cur <= endDay) {
          const key = toUTCKey(cur);
          const existing: DayTracks = index.get(key) ?? [null, null];
          existing[track] = {
            cycle,
            rotation,
            colorIdx: i % LEGEND_PALETTE.length,
            isCurrentCycle,
            isStart: key === startKey,
            isEnd: key === endKey,
          };
          index.set(key, [...existing] as DayTracks);
          cur.setUTCDate(cur.getUTCDate() + 1);
        }
      });
    });

    return index;
  }, [cycles]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const offset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [viewDate]);

  const visibleCycles = useMemo(() => {
    const seen = new Set<string>();
    const result: { cycle: ICycle; colorIdx: number }[] = [];
    for (const date of calendarDays) {
      if (!date) continue;
      const tracks = dayIndex.get(toLocalKey(date));
      if (!tracks) continue;
      for (const entry of tracks) {
        if (entry?.cycle._id && !seen.has(entry.cycle._id)) {
          seen.add(entry.cycle._id);
          result.push({ cycle: entry.cycle, colorIdx: entry.colorIdx });
        }
      }
    }
    return result;
  }, [calendarDays, dayIndex]);

  const todayKey = toLocalKey(today);
  const prevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  if (isLoading) {
    return (
      <Center p={12}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box>
      {/* Month navigation */}
      <Flex justify="space-between" align="center" mb={4}>
        <IconButton
          aria-label={t("pages.cycles.calendarPrevMonth")}
          icon={<FiChevronLeft />}
          onClick={prevMonth}
          variant="ghost"
          size="sm"
          borderRadius="lg"
        />
        <HStack spacing={3} align="center">
          <Text fontWeight="bold" fontSize="lg" textTransform="capitalize">
            {monthLabel}
          </Text>
          <Button
            size="xs"
            variant="ghost"
            colorScheme="blue"
            borderRadius="full"
            px={3}
            onClick={() =>
              setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
            }
          >
            {t("pages.cycles.calendarToday")}
          </Button>
        </HStack>
        <IconButton
          aria-label={t("pages.cycles.calendarNextMonth")}
          icon={<FiChevronRight />}
          onClick={nextMonth}
          variant="ghost"
          size="sm"
          borderRadius="lg"
        />
      </Flex>

      {/* Day headers */}
      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" mb={1}>
        {dayNames.map((name) => (
          <Box key={name} textAlign="center" py={2}>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color={dayHeaderColor}
              textTransform="uppercase"
              letterSpacing="wider"
            >
              {name}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(7, 1fr)"
        borderTop="1px solid"
        borderLeft="1px solid"
        borderColor={cellBorder}
        borderRadius="xl"
        overflow="hidden"
      >
        {calendarDays.map((date, idx) => {
          const localKey = date ? toLocalKey(date) : null;
          const tracks: DayTracks = (localKey ? dayIndex.get(localKey) : null) ?? [null, null];
          const isToday = !!localKey && localKey === todayKey;

          const isMonday = date ? (date.getDay() + 6) % 7 === 0 : false;
          const isSunday = date ? (date.getDay() + 6) % 7 === 6 : false;
          const lastDayOfMonth = date
            ? new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
            : 0;
          const isLastDay = date ? date.getDate() === lastDayOfMonth : false;

          return (
            <Box
              key={localKey ?? `e-${idx}`}
              minH={{ base: "90px", md: "110px" }}
              bg={date ? cellBg : outsideBg}
              borderRight="1px solid"
              borderBottom="1px solid"
              borderColor={cellBorder}
              display="flex"
              flexDirection="column"
            >
              {date && (
                <>
                  {/* Date number */}
                  <Box px={2} pt={1.5} pb={1}>
                    <Box
                      w={6}
                      h={6}
                      borderRadius="full"
                      bg={isToday ? "blue.500" : "transparent"}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text
                        fontSize="sm"
                        fontWeight={isToday ? "bold" : "medium"}
                        color={isToday ? "white" : textColor}
                        lineHeight={1}
                      >
                        {date.getDate()}
                      </Text>
                    </Box>
                  </Box>

                  {/* Two track bars pushed to bottom */}
                  <Box mt="auto" pb={1.5}>
                    {tracks.map((entry, trackIdx) => {
                      // Empty track slot — keeps vertical alignment intact
                      if (!entry) {
                        return (
                          <Box
                            key={trackIdx}
                            h={BAR_H}
                            mt={trackIdx === 1 ? "2px" : 0}
                          />
                        );
                      }

                      const pal = entry.isCurrentCycle
                        ? getAttackColor(entry.rotation.attack)
                        : LEGEND_PALETTE[entry.colorIdx];
                      const barLeftRounded =
                        entry.isStart || isMonday || date.getDate() === 1;
                      const barRightRounded =
                        entry.isEnd || isSunday || isLastDay;
                      const isFirstVisible =
                        entry.isStart || date.getDate() === 1;

                      const sharedStyle = {
                        h: BAR_H,
                        mt: trackIdx === 1 ? "2px" : 0,
                        bg: pal.bg,
                        borderTop: `1.5px solid ${pal.solid}`,
                        borderBottom: `1.5px solid ${pal.solid}`,
                        borderLeft: barLeftRounded
                          ? `3px solid ${pal.solid}`
                          : "none",
                        borderRight: barRightRounded
                          ? `3px solid ${pal.solid}`
                          : "none",
                        borderTopLeftRadius: barLeftRounded ? "md" : 0,
                        borderBottomLeftRadius: barLeftRounded ? "md" : 0,
                        borderTopRightRadius: barRightRounded ? "md" : 0,
                        borderBottomRightRadius: barRightRounded ? "md" : 0,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        px: 1.5,
                        textDecoration: "none",
                      };

                      if (isFirstVisible) {
                        return (
                          <Box
                            key={trackIdx}
                            as={Link}
                            to={`/cycle/${entry.cycle._id}`}
                            _hover={{ opacity: 0.75 }}
                            transition="opacity 0.15s"
                            {...sharedStyle}
                          >
                            <HStack
                              spacing={1}
                              overflow="hidden"
                              w="100%"
                              flexWrap="nowrap"
                            >
                              <Box flexShrink={0}>
                                <AttackTypeBadge
                                  attackType={entry.rotation.attack}
                                  size="12px"
                                />
                              </Box>
                              {entry.rotation.alteration && (
                                <Box flexShrink={0}>
                                  <AlterationImage
                                    alteration={entry.rotation.alteration}
                                    size="12px"
                                  />
                                </Box>
                              )}
                              <Text
                                fontSize="xs"
                                fontWeight="bold"
                                noOfLines={1}
                                color={textColor}
                                flex={1}
                                minW={0}
                              >
                                {t(
                                  `factions.${entry.rotation.killer}`,
                                  entry.rotation.killer
                                )}
                              </Text>
                              <Text
                                fontSize="xs"
                                color={subColor}
                                flexShrink={0}
                              >
                                #{entry.rotation.position}
                              </Text>
                            </HStack>
                          </Box>
                        );
                      }

                      return (
                        <Tooltip
                          key={trackIdx}
                          label={`${entry.cycle.name} — ${entry.cycle.year} — Rot. #${entry.rotation.position} — ${t(`factions.${entry.rotation.killer}`, entry.rotation.killer)}`}
                          placement="top"
                          hasArrow
                          openDelay={400}
                        >
                          <Box
                            as={Link}
                            to={`/cycle/${entry.cycle._id}`}
                            {...sharedStyle}
                          />
                        </Tooltip>
                      );
                    })}
                  </Box>
                </>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Legend */}
      {visibleCycles.length > 0 && (
        <Flex
          gap={3}
          flexWrap="wrap"
          mt={4}
          pt={3}
          borderTop="1px solid"
          borderColor={cellBorder}
        >
          {visibleCycles.map(({ cycle, colorIdx }) => (
            <HStack
              key={cycle._id}
              spacing={1.5}
              as={Link}
              to={`/cycle/${cycle._id}`}
              _hover={{ opacity: 0.7 }}
              transition="opacity 0.15s"
              textDecoration="none"
            >
              <Box
                w={3}
                h={3}
                borderRadius="sm"
                bg={LEGEND_PALETTE[colorIdx % LEGEND_PALETTE.length].solid}
                flexShrink={0}
              />
              <Text fontSize="xs" color={dayHeaderColor}>
                {cycle.name}
              </Text>
            </HStack>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default RotationCalendar;
