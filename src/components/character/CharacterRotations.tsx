import { useEffect, useState } from "react";
import { Box, Button, Flex, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { ICharacter, ICycleRotation } from "@/interfaces";
import { useCycles } from "@/hooks/useAPI";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { getRotationRealDates } from "@/utils/cycleHelpers";
import { AttackTypeBadge } from "../ui/AttackTypeBadge";
import { rotationUrl } from "@/utils/rotationPassages";

// "Quincy +" (stronger killer) serves on the "Quincy" rotations like "Quincy"
const baseKiller = (killer: string) => killer.replace(/\s*\+$/, "");

const MINUTE = 60_000;

// Days, hours and minutes left until a date
const countdown = (target: Date, now: number) => {
  const minutes = Math.max(0, Math.floor((target.getTime() - now) / MINUTE));
  return { days: Math.floor(minutes / 1440), hours: Math.floor((minutes % 1440) / 60), minutes: minutes % 60 };
};

const realDates = (rotation: ICycleRotation) => (rotation.start_date && rotation.end_date
  ? getRotationRealDates(rotation.start_date, rotation.end_date)
  : null);

// Remaining rotations of the current cycle whose killer is one of the character's killers, in its color
// (a red character does not play in a blue rotation): the next one stands out with a countdown
export const CharacterRotations = ({ character }: { character: ICharacter }) => {
  const { t, i18n } = useTranslation();
  const { cycles, isLoading } = useCycles({ limit: 5 });
  const { currentCycle, currentRotation } = useCurrentRotation(cycles, isLoading);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), MINUTE);
    return () => window.clearInterval(timer);
  }, []);

  const killers = character.killers ?? [];
  if (!currentCycle || killers.length === 0) return null;

  const baseKillers = new Set(killers.map(baseKiller));
  const rotations = currentCycle.rotations ?? [];
  const startIndex = currentRotation ? rotations.indexOf(currentRotation) : rotations.length;
  const matching = rotations
    .slice(Math.max(0, startIndex))
    .filter((r) => baseKillers.has(baseKiller(r.killer)))
    .filter((r) => !character.attack_type || !r.attack || r.attack === character.attack_type);

  if (matching.length === 0) {
    return <Text fontSize="sm" color="text.muted">{t("pages.characterDetail.rotationsNone")}</Text>;
  }

  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";
  const formatDay = (date: Date, long = false) =>
    date.toLocaleDateString(locale, { weekday: long ? "long" : "short", day: "2-digit", month: "2-digit" });
  const positionOf = (rotation: ICycleRotation) => rotation.position || rotations.indexOf(rotation) + 1;
  const killerLabel = (rotation: ICycleRotation) => t(`factions.${rotation.killer}`, rotation.killer);

  const [next, ...later] = matching;
  const nextDates = realDates(next);
  const isNow = Boolean(nextDates && now >= nextDates.realStartDate.getTime() && now <= nextDates.realEndDate.getTime());
  const target = nextDates ? (isNow ? nextDates.realEndDate : nextDates.realStartDate) : null;
  const left = target ? countdown(target, now) : null;

  return (
    <VStack align="stretch" spacing={4}>
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        gap={4}
        p={{ base: 4, md: 5 }}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={isNow ? "green.400" : "blue.400"}
        bgGradient={isNow
          ? "linear(135deg, rgba(72, 187, 120, 0.16), rgba(183, 148, 244, 0.08))"
          : "linear(135deg, rgba(66, 153, 225, 0.16), rgba(183, 148, 244, 0.08))"}
      >
        <Box flex={1} minW={0}>
          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color={isNow ? "green.300" : "blue.300"} _light={{ color: isNow ? "green.600" : "blue.600" }}>
            {t(isNow ? "pages.characterDetail.rotationUsefulNow" : "pages.characterDetail.rotationUsefulNext")}
          </Text>
          <HStack spacing={2.5} mt={1}>
            <AttackTypeBadge attackType={next.attack} size="14px" />
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="extrabold" color="text.strong" noOfLines={1}>
              R{positionOf(next)} · {killerLabel(next)}
            </Text>
          </HStack>
          {nextDates && (
            <Text fontSize="sm" color="text.secondary" mt={0.5} textTransform="capitalize">
              {formatDay(isNow ? nextDates.realEndDate : nextDates.realStartDate, true)}
            </Text>
          )}
        </Box>

        {left && (
          <Box>
            <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={1}>
              {t(isNow ? "pages.characterDetail.rotationEndsIn" : "pages.characterDetail.rotationStartsIn")}
            </Text>
            <HStack spacing={2}>
              {([["days", left.days], ["hours", left.hours], ["minutes", left.minutes]] as const).map(([unit, value]) => (
                <Box key={unit} bg="blackAlpha.300" _light={{ bg: "whiteAlpha.700" }} borderRadius="lg" px={3} py={1.5} minW="56px" textAlign="center">
                  <Text fontSize="xl" fontWeight="extrabold" color="text.strong" lineHeight={1.2} sx={{ fontVariantNumeric: "tabular-nums" }}>{value}</Text>
                  <Text fontSize="2xs" color="text.muted">{t(`pages.characterDetail.countdown.${unit}`, { count: value })}</Text>
                </Box>
              ))}
            </HStack>
          </Box>
        )}

        <Button as={Link} to={rotationUrl(next, currentCycle)} colorScheme={isNow ? "green" : "blue"} rightIcon={<Icon as={FiChevronRight} />} flexShrink={0}>
          {t("pages.characterDetail.rotationOpen")}
        </Button>
      </Flex>

      {later.length > 0 && (
        <Box>
          <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={2}>
            {t("pages.characterDetail.rotationsLater")}
          </Text>
          <VStack align="stretch" spacing={1.5}>
            {later.map((rotation) => {
              const dates = realDates(rotation);
              return (
                <Flex
                  key={rotation.rotation_id ?? positionOf(rotation)}
                  as={Link}
                  to={rotationUrl(rotation, currentCycle)}
                  align="center"
                  gap={3}
                  px={3}
                  py={2.5}
                  borderRadius="lg"
                  bg="bg.subtle"
                  _hover={{ bg: "bg.hover" }}
                >
                  <Text fontSize="sm" fontWeight="bold" color="text.muted" w="34px">R{positionOf(rotation)}</Text>
                  <AttackTypeBadge attackType={rotation.attack} size="12px" />
                  <Text fontSize="sm" fontWeight="semibold" color="text.strong" flex={1} noOfLines={1}>{killerLabel(rotation)}</Text>
                  {dates && <Text fontSize="xs" color="text.muted">{formatDay(dates.realStartDate)}</Text>}
                  <Icon as={FiChevronRight} color="text.muted" />
                </Flex>
              );
            })}
          </VStack>
        </Box>
      )}
    </VStack>
  );
};
