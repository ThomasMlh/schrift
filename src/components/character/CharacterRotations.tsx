import { Badge, Box, Flex, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { ICharacter } from "@/interfaces";
import { useCycles } from "@/hooks/useAPI";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { cycleSlug, getRotationRealDates } from "@/utils/cycleHelpers";
import { AttackTypeBadge } from "../ui/AttackTypeBadge";

// "Quincy +" (stronger killer) serves on the "Quincy" rotations like "Quincy"
const baseKiller = (killer: string) => killer.replace(/\s*\+$/, "");

const formatDay = (date: Date) =>
  date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" });

// Remaining rotations of the current cycle whose killer is one of the character's killers
export const CharacterRotations = ({ character }: { character: ICharacter }) => {
  const { t } = useTranslation();
  const { cycles, isLoading } = useCycles({ limit: 5 });
  const { currentCycle, currentRotation } = useCurrentRotation(cycles, isLoading);
  const killers = character.killers ?? [];
  const baseKillers = new Set(killers.map(baseKiller));

  const rotations = currentCycle?.rotations ?? [];
  const startIndex = currentRotation ? rotations.indexOf(currentRotation) : rotations.length;
  const matching = rotations
    .slice(Math.max(0, startIndex))
    .filter((r) => baseKillers.has(baseKiller(r.killer)));

  if (!currentCycle || killers.length === 0) return null;

  return (
    <Box>
      {matching.length === 0 ? (
        <Text fontSize="sm" color="text.muted">{t("pages.characterDetail.rotationsNone")}</Text>
      ) : (
        <VStack align="stretch" spacing={1}>
          {matching.map((rotation, i) => {
            const position = rotation.position || rotations.indexOf(rotation) + 1;
            const sameColor = rotation.attack === character.attack_type;
            const isNow = i === 0 && rotation === currentRotation;
            const start = rotation.start_date && rotation.end_date
              ? getRotationRealDates(rotation.start_date, rotation.end_date).realStartDate
              : null;
            return (
              <Flex
                key={rotation.rotation_id ?? position}
                as={Link}
                to={`/cycle/${cycleSlug(currentCycle.name, currentCycle.year)}/rotation/${position}`}
                align="center"
                gap={3}
                px={3}
                py={2}
                mx={-3}
                borderRadius="lg"
                _hover={{ bg: "bg.hover" }}
              >
                <Text fontSize="sm" fontWeight="bold" color="text.muted" w="34px">R{position}</Text>
                <AttackTypeBadge attackType={rotation.attack} size="12px" />
                <Text fontSize="sm" fontWeight="semibold" color="text.strong" flex={1} noOfLines={1}>
                  {t(`factions.${rotation.killer}`, rotation.killer)}
                </Text>
                <HStack spacing={1.5} flexShrink={0}>
                  {isNow && <Badge colorScheme="green" variant="subtle" borderRadius="full">{t("pages.characterDetail.rotationNow")}</Badge>}
                  {sameColor && <Badge colorScheme="purple" variant="subtle" borderRadius="full">{t("pages.characterDetail.rotationSameColor")}</Badge>}
                  {start && <Text fontSize="xs" color="text.muted">{formatDay(start)}</Text>}
                </HStack>
                <Icon as={FiChevronRight} color="text.muted" />
              </Flex>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};
