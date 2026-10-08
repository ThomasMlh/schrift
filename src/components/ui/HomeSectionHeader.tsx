import { Box, HStack, Icon, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";

interface HomeSectionHeaderProps {
  icon: IconType;
  title: string;
  subtitle?: string;
}

/** En-tête des blocs de la page d'accueil : pastille d'icône dégradée, titre et sous-titre. */
export const HomeSectionHeader = ({ icon, title, subtitle }: HomeSectionHeaderProps) => (
  <HStack spacing={3} mb={4} align="center">
    <Box
      p={2}
      borderRadius="lg"
      bgGradient="linear(to-br, #7C3AED, #4F46E5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      <Icon as={icon} boxSize={4} color="white" aria-hidden />
    </Box>
    <Box minW={0}>
      <Text as="h2" fontWeight="bold" fontSize="lg" color="text.strong">
        {title}
      </Text>
      {subtitle && (
        <Text fontSize="sm" color="text.muted">
          {subtitle}
        </Text>
      )}
    </Box>
  </HStack>
);
