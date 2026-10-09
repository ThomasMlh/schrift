import { Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";

interface SectionCardProps {
  title: string;
  icon?: IconType;
  children: ReactNode;
}

// Bloc de la fiche personnage : titre avec icône, contenu dans une carte
export const SectionCard = ({ title, icon, children }: SectionCardProps) => (
  <Box bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle" p={5}>
    <HStack spacing={2} mb={4}>
      {icon && <Icon as={icon} color="accent" boxSize={4} aria-hidden />}
      <Text fontWeight="bold" color="text.strong">{title}</Text>
    </HStack>
    {children}
  </Box>
);

// Ligne « libellé : pastilles » du profil de combat
export const TraitRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box>
    <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={2}>
      {label}
    </Text>
    <Flex wrap="wrap" gap={2}>{children}</Flex>
  </Box>
);

// Pastille d'une caractéristique (killer, catégorie, trait…)
export const Pill = ({ icon, children }: { icon?: ReactNode; children: ReactNode }) => (
  <HStack spacing={1.5} px={3} py={1} borderRadius="full" bg="bg.subtle" borderWidth="1px" borderColor="border.subtle">
    {icon}
    <Text fontSize="sm" color="text.body">{children}</Text>
  </HStack>
);
