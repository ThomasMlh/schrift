import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { SelectedCharacter } from "./MultiCharacterSelector";
import { ENTITY_COLORS } from "./useComparatorMetrics";
import { AffinityIcon } from "@/components/ui/AffinityIcon";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { KillerIcon } from "@/components/ui/KillerIcon";

interface CharacterAttributesTableProps {
  selectedCharacters: SelectedCharacter[];
}

const bgColor = "bg.card";
const borderColor = "border.subtle";
const mutedText = "text.muted";

// Qualitative attributes of the compared characters: affinity, attack type, killers, categories
export const CharacterAttributesTable = ({ selectedCharacters }: CharacterAttributesTableProps) => {
  const { t } = useTranslation();
  return (
    <Box bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={4}>
      <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color={mutedText} mb={4}>
        {t("components.comparatorCharts.charAttributesHeading")}
      </Text>
      <Box overflowX="auto">
        <Box display="grid" gridTemplateColumns={`140px repeat(${selectedCharacters.length}, 1fr)`} gap={2} minW="400px">
          <Box />
          {selectedCharacters.map((sc, i) => (
            <Box key={sc.id} textAlign="center">
              <Box w={2} h={2} borderRadius="full" bg={ENTITY_COLORS[i % ENTITY_COLORS.length]} display="inline-block" mr={1} />
              <Text fontSize="xs" fontWeight="semibold" noOfLines={1}>{sc.character.name}</Text>
            </Box>
          ))}

          <Text fontSize="sm" color={mutedText} alignSelf="center">{t("components.comparatorCharts.metricAffinity")}</Text>
          {selectedCharacters.map((sc) => (
            <Flex key={sc.id} justify="center" align="center" gap={1}>
              {sc.character.affinity
                ? <AffinityIcon affinity={sc.character.affinity} size="18px" />
                : <Text fontSize="xs" color={mutedText}>—</Text>}
            </Flex>
          ))}

          <Text fontSize="sm" color={mutedText} alignSelf="center">{t("components.comparatorCharts.metricAttackType")}</Text>
          {selectedCharacters.map((sc) => (
            <Flex key={sc.id} justify="center" align="center">
              {sc.character.attack_type
                ? <AttackTypeBadge attackType={sc.character.attack_type} size="18px" />
                : <Text fontSize="xs" color={mutedText}>—</Text>}
            </Flex>
          ))}

          <Text fontSize="sm" color={mutedText} alignSelf="center">{t("components.comparatorCharts.metricKillers")}</Text>
          {selectedCharacters.map((sc) => (
            <Flex key={sc.id} justify="center" flexWrap="wrap" gap={1}>
              {sc.character.killers?.length
                ? sc.character.killers.map((k) => <KillerIcon key={k} killer={k} size="18px" />)
                : <Text fontSize="xs" color={mutedText}>—</Text>}
            </Flex>
          ))}

          <Text fontSize="sm" color={mutedText} alignSelf="center">{t("components.comparatorCharts.metricCategories")}</Text>
          {selectedCharacters.map((sc) => (
            <Flex key={sc.id} justify="center" flexWrap="wrap" gap={1}>
              {sc.character.categories?.length
                ? sc.character.categories.map((cat) => (
                    <Badge key={cat} fontSize="2xs" borderRadius="full" colorScheme="gray">{cat}</Badge>
                  ))
                : <Text fontSize="xs" color={mutedText}>—</Text>}
            </Flex>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
