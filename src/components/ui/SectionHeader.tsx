import { Flex, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";

interface SectionHeaderProps {
  title: string;
  // Pictogramme affiché avant le titre
  icon?: IconType;
  description?: ReactNode;
  // Boutons d'action alignés à droite (sous le titre sur mobile)
  actions?: ReactNode;
}

// En-tête commun des sections de l'administration : titre, description
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
        {icon && <Icon as={icon} boxSize={5} color="accent" aria-hidden />}
        <Text
          as="h2"
          fontSize="2xl"
          fontWeight="extrabold"
          color="text.strong"
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
