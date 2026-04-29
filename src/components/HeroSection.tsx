import { Box, Container, VStack, Heading, Text, Badge, useColorMode } from "@chakra-ui/react";

interface HeroSectionProps {
  title: string;
  description?: string;
  badge?: {
    text: string;
    icon?: string;
  };
  size?: "sm" | "md" | "lg";
}

export const HeroSection = ({ 
  title, 
  description, 
  badge,
  size = "md" 
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
      position="relative"
      overflow="hidden"
      bg={isDark
        ? 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(79,70,229,0.12) 100%)'
        : 'linear-gradient(135deg, rgba(124,58,237,0.07) 0%, rgba(79,70,229,0.04) 100%)'
      }
      borderBottom="1px solid"
      borderColor={isDark ? 'whiteAlpha.100' : 'gray.100'}
    >
      {/* Decorative blobs */}
      <Box
        position="absolute" top="-80px" right="-80px"
        w="320px" h="320px" borderRadius="full"
        bg={isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.06)'}
        sx={{ filter: 'blur(70px)' }}
        pointerEvents="none"
      />
      <Box
        position="absolute" bottom="-50px" left="-50px"
        w="240px" h="240px" borderRadius="full"
        bg={isDark ? 'rgba(79,70,229,0.10)' : 'rgba(79,70,229,0.04)'}
        sx={{ filter: 'blur(60px)' }}
        pointerEvents="none"
      />

      <Container maxW="container.xl" position="relative" zIndex={1}>
        <VStack spacing={4} textAlign="center">
          {badge && (
            <Badge
              px={4} py={1.5} borderRadius="full"
              bg="linear-gradient(135deg, #7C3AED, #4F46E5)"
              color="white" fontWeight="bold" fontSize="xs"
              textTransform="uppercase" letterSpacing="widest"
            >
              {badge.icon && `${badge.icon} `}{badge.text}
            </Badge>
          )}

          <Heading
            as="h1"
            size={{ base: "xl", md: "2xl" }}
            bgGradient={isDark ? "linear(to-r, #C4B5FD, #818CF8)" : "linear(to-r, #7C3AED, #4F46E5)"}
            bgClip="text"
            fontWeight="extrabold"
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
        </VStack>
      </Container>
    </Box>
  );
};
