import { Box, HStack, Image, Text, Tooltip, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ICharacter } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";
import { AffinityIcon } from "../ui/AffinityIcon";
import { AttackTypeBadge } from "../ui/AttackTypeBadge";
import { KillerIcon } from "../ui/KillerIcon";

const MAX_KILLERS = 3;

// Carte de la liste des personnages : grande vignette, nom, affinité et killers
export const CharacterCard = ({ character }: { character: ICharacter }) => {
  const { t } = useTranslation();
  const killers = character.killers ?? [];

  return (
    <Box
      as={Link}
      to={`/personnage/${character._id}`}
      display="block"
      bg="bg.card"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.subtle"
      overflow="hidden"
      role="group"
      transition="border-color 0.15s, transform 0.15s"
      _hover={{ borderColor: "purple.400", transform: "translateY(-2px)" }}
    >
      <Box position="relative" bg="bg.inset" aspectRatio={1}>
        <Image
          src={`${bucketUrl}/characters/thumb/${character._id}.png`}
          alt={character.name}
          w="100%"
          h="100%"
          objectFit="cover"
          loading="lazy"
          transition="transform 0.2s"
          _groupHover={{ transform: "scale(1.04)" }}
          fallback={<Box w="100%" h="100%" />}
        />
        {character.attack_type && (
          <Box position="absolute" top={2} right={2} p={1} borderRadius="full" bg="blackAlpha.600">
            <AttackTypeBadge attackType={character.attack_type} size="14px" />
          </Box>
        )}
      </Box>

      <VStack align="stretch" spacing={1.5} p={3}>
        <Text fontWeight="bold" fontSize="sm" color="text.strong" noOfLines={2} lineHeight="short" minH="2.5em">
          {character.name}
        </Text>
        <HStack spacing={2} justify="space-between">
          {character.affinity ? (
            <Tooltip label={character.affinity} hasArrow>
              <Box><AffinityIcon affinity={character.affinity} size="18px" showLabel={false} /></Box>
            </Tooltip>
          ) : <Box />}
          {killers.length > 0 && (
            <HStack spacing={1}>
              {killers.slice(0, MAX_KILLERS).map((killer) => (
                <Tooltip key={killer} label={t(`factions.${killer}`, killer)} hasArrow>
                  <Box><KillerIcon killer={killer} size="18px" showLabel={false} /></Box>
                </Tooltip>
              ))}
              {killers.length > MAX_KILLERS && (
                <Text fontSize="2xs" color="text.muted">+{killers.length - MAX_KILLERS}</Text>
              )}
            </HStack>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};
