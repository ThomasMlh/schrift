import type { ReactNode } from "react";
import { Box, Container, Heading, Text, useColorMode } from "@chakra-ui/react";

interface HeroSectionProps {
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  /** Contenu optionnel sous la description (boutons, infos) */
  children?: ReactNode;
}

const paddingY = {
  sm: { base: 5, md: 6 },
  md: { base: 6, md: 8 },
  lg: { base: 6, md: 10 },
};

export const HeroSection = ({
  title,
  description,
  size = "md",
  children,
}: HeroSectionProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box
      w="100%"
      py={paddingY[size]}
      borderBottom="1px solid"
      borderColor={isDark ? 'whiteAlpha.100' : 'gray.100'}
    >
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        <Heading
          as="h1"
          size={{ base: "lg", md: "xl" }}
          fontWeight="extrabold"
          letterSpacing="tight"
          lineHeight="shorter"
          w="fit-content"
          bgGradient={isDark
            ? 'linear(to-r, #C4B5FD, #818CF8)'
            : 'linear(to-r, #7C3AED, #4F46E5)'
          }
          bgClip="text"
        >
          {title}
        </Heading>

        {description && (
          <Text
            mt={2}
            fontSize={{ base: "sm", md: "md" }}
            color={isDark ? 'gray.400' : 'gray.600'}
            maxW="3xl"
          >
            {description}
          </Text>
        )}

        {children && <Box mt={4}>{children}</Box>}
      </Container>
    </Box>
  );
};
