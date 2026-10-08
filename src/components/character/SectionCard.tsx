import { Box, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

// Bloc de la fiche personnage : titre coloré et liseré gauche de la couleur d'accent
interface SectionCardProps {
  label: string;
  accentColor: string;
  isDark: boolean;
  children: ReactNode;
}

export const SectionCard = ({ label, accentColor, isDark, children }: SectionCardProps) => (
  <Box
    p={4}
    borderRadius="xl"
    bg={isDark ? 'rgba(255,255,255,0.03)' : 'gray.50'}
    border="1px solid"
    borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
    borderLeftWidth="3px"
    borderLeftColor={accentColor}
  >
    <Text
      fontSize="2xs"
      fontWeight="semibold"
      letterSpacing="widest"
      textTransform="uppercase"
      color={accentColor}
      mb={3}
    >
      {label}
    </Text>
    {children}
  </Box>
);
