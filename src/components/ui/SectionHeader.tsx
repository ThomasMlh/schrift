import { Flex, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";

interface SectionHeaderProps {
  title: string;
  // Icon shown before the title
  icon?: IconType;
  description?: ReactNode;
  // Right-aligned action buttons (below the title on mobile)
  actions?: ReactNode;
}

// Shared admin section header: title in the brand gradient, description and actions.
export const SectionHeader = ({ title, icon, description, actions }: SectionHeaderProps) => (
  <Flex
    justify="space-between"
    align={{ base: "stretch", md: "center" }}
    direction={{ base: "column", md: "row" }}
    gap={4}
  >
    <VStack align="start" spacing={1} minW={0}>
      <HStack spacing={2}>
        {icon && <Icon as={icon} boxSize={6} color="purple.400" aria-hidden />}
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
