import type { ReactNode } from "react";
import { Box, Container, Heading, Text, HStack, Icon } from "@chakra-ui/react";
import type { IconType } from "react-icons";

interface HeroSectionProps {
  title: string;
  description?: string;
  /** Petite ligne au-dessus du titre (rubrique, contexte, position…) */
  badge?: {
    text: string;
    icon?: IconType;
  };
  size?: "sm" | "md" | "lg";
  /** Contenu optionnel sous la description (boutons, infos) */
  children?: ReactNode;
}

const paddingY = {
  sm: { base: 6, md: 8 },
  md: { base: 8, md: 12 },
  lg: { base: 10, md: 14 },
};

const titleSize = {
  sm: { base: "lg", md: "xl" },
  md: { base: "xl", md: "2xl" },
  lg: { base: "xl", md: "3xl" },
};

export const HeroSection = ({
  title,
  description,
  badge,
  size = "md",
  children,
}: HeroSectionProps) => (
  <Box
    as="section"
    w="100%"
    py={paddingY[size]}
    borderBottomWidth="1px"
    borderColor="border.faint"
  >
    <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
      {badge && (
        <HStack spacing={2} mb={3} color="accent">
          {badge.icon && <Icon as={badge.icon} boxSize={4} aria-hidden />}
          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
            {badge.text}
          </Text>
        </HStack>
      )}

      <Heading
        as="h1"
        size={titleSize[size]}
        fontWeight="extrabold"
        letterSpacing="tight"
        lineHeight="shorter"
        color="text.strong"
      >
        {title}
      </Heading>

      {description && (
        <Text mt={3} fontSize={{ base: "md", md: "lg" }} color="text.secondary" maxW="2xl">
          {description}
        </Text>
      )}

      {children && <Box mt={6}>{children}</Box>}
    </Container>
  </Box>
);
