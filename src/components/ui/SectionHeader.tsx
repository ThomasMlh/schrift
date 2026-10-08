import { Flex, HStack, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  // Emoji ou petit pictogramme affiché avant le titre (hors dégradé)
  icon?: string;
  description?: ReactNode;
  // Boutons d'action alignés à droite (sous le titre sur mobile)
  actions?: ReactNode;
}

// En-tête commun des sections de l'administration : titre en dégradé de la marque, description
// et actions, pour que toutes les sections aient le même rendu.
export const SectionHeader = ({ title, icon, description, actions }: SectionHeaderProps) => (
  <Flex
    justify="space-between"
    align={{ base: "stretch", md: "center" }}
    direction={{ base: "column", md: "row" }}
    gap={4}
  >
    <VStack align="start" spacing={1} minW={0}>
      <HStack spacing={2}>
        {icon && <Text as="span" fontSize="2xl" lineHeight={1}>{icon}</Text>}
        <Text
          as="h2"
          fontSize="2xl"
          fontWeight="extrabold"
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
          letterSpacing="tight"
        >
          {title}
        </Text>
      </HStack>
      {description && (
        <Text fontSize="sm" color="text.muted" maxW="2xl">
          {description}
        </Text>
      )}
    </VStack>
    {actions && <HStack spacing={3} flexWrap="wrap" flexShrink={0}>{actions}</HStack>}
  </Flex>
);
