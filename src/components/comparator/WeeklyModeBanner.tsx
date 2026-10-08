import { Box, HStack, Icon, Text } from "@chakra-ui/react";
import { FiCalendar } from "react-icons/fi";
import type { ICycle } from "@/interfaces";

interface WeeklyModeBannerProps {
  week: number;
  cycle?: ICycle;
}

// Rappel du mode hebdomadaire : semaine choisie et ses deux rotations
export const WeeklyModeBanner = ({ week, cycle }: WeeklyModeBannerProps) => (
    <Box
      bg="purple.50"
      _dark={{ bg: "rgba(159,122,234,0.08)" }}
      borderRadius="lg"
      px={4}
      py={2}
      borderLeft="3px solid"
      borderColor="purple.400"
    >
      <HStack spacing={2}>
        <Icon as={FiCalendar} color="purple.400" boxSize={4} />
        <Text fontSize="sm" fontWeight="semibold" color="purple.600" _dark={{ color: "purple.300" }}>
          Mode hebdomadaire — Semaine {week}
        </Text>
        {cycle && (() => {
          const r1 = cycle.rotations[(week - 1) * 2];
          const r2 = cycle.rotations[(week - 1) * 2 + 1];
          return r1 ? (
            <Text fontSize="xs" color="gray.500">
              R{r1.position} {r1.killer}{r2 ? ` + R${r2.position} ${r2.killer}` : ""}
            </Text>
          ) : null;
        })()}
      </HStack>
    </Box>
);
