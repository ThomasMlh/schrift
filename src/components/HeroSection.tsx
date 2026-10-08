import type { ReactNode } from "react";
import { Box, Container, VStack, Heading, Text, Badge, HStack, Icon, useColorMode } from "@chakra-ui/react";
import type { IconType } from "react-icons";

interface HeroSectionProps {
  title: string;
  description?: string;
  badge?: {
    text: string;
    icon?: IconType;
  };
  size?: "sm" | "md" | "lg";
  /** Contenu optionnel sous la description (boutons, infos) */
  children?: ReactNode;
}

export const HeroSection = ({
  title,
  description,
  badge,
  size = "md",
  children,
}: HeroSectionProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const paddingY = {
    sm: { base: 8, md: 12 },
    md: { base: 12, md: 16 },
    lg: { base: 16, md: 20 }
  };

  return (
    <Box
      w="100%"
      py={paddingY[size]}
      px={4}
      borderBottom="1px solid"
      borderColor={isDark ? 'whiteAlpha.100' : 'gray.100'}
    >
      <Container maxW="container.xl">
        <VStack spacing={4} textAlign="center" align="center">
          {badge && (
            <Badge
              px={4} py={1.5} borderRadius="full"
              bg="linear-gradient(135deg, #7C3AED, #4F46E5)"
              color="white" fontWeight="bold" fontSize="xs"
              textTransform="uppercase" letterSpacing="widest"
            >
              <HStack spacing={1.5}>
                {badge.icon && <Icon as={badge.icon} boxSize={3.5} aria-hidden />}
                <span>{badge.text}</span>
              </HStack>
            </Badge>
          )}

          <Heading
            as="h1"
            size={{ base: "xl", md: "2xl" }}
            fontWeight="extrabold"
            pb={2}
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
              fontSize={{ base: "md", md: "lg" }}
              color={isDark ? 'gray.300' : 'gray.600'}
              maxW="2xl"
            >
              {description}
            </Text>
          )}

          {children}
        </VStack>
      </Container>
    </Box>
  );
};
