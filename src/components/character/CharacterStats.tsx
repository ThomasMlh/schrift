import { Box, HStack, Image, SimpleGrid, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { ICharacterStats } from "@/interfaces";
import { getStatIcon } from "@/utils/characterIcons";

const STAT_KEYS = ["end", "atk", "def", "cct", "pre"] as const;

// Stats du personnage en tuiles : icône, nom et valeur
export const CharacterStats = ({ stats }: { stats: ICharacterStats }) => {
  const { t } = useTranslation();

  return (
    <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={2}>
      {STAT_KEYS.filter((key) => stats[key]).map((key) => (
        <Box key={key} bg="bg.subtle" borderRadius="lg" borderWidth="1px" borderColor="border.subtle" px={3} py={2.5}>
          <HStack spacing={2} mb={1}>
            <Image src={getStatIcon(key) ?? undefined} alt="" boxSize="18px" />
            <Text fontSize="xs" color="text.muted" noOfLines={1}>{t(`stats.${key}`)}</Text>
          </HStack>
          <Text fontSize="xl" fontWeight="extrabold" color="text.strong" lineHeight={1.1}>
            {stats[key]}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  );
};
