import { Box, Container, VStack, Heading, Text, Badge, useColorModeValue } from "@chakra-ui/react";

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
  const gradientBg = useColorModeValue(
    'linear(135deg, #667eea 0%, #764ba2 100%)',
    'linear(135deg, #4a5568 0%, #2d3748 100%)'
  );

  const paddingY = {
    sm: { base: 8, md: 12 },
    md: { base: 12, md: 16 },
    lg: { base: 16, md: 20 }
  };

  return (
    <Box
      w="100%"
      bgGradient={gradientBg}
      py={paddingY[size]}
      px={4}
      position="relative"
      overflow="hidden"
    >
      {/* Pattern overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity="0.1"
        bgImage="radial-gradient(circle, white 1px, transparent 1px)"
        bgSize="40px 40px"
      />
      
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <VStack spacing={4} textAlign="center">
          {badge && (
            <Badge 
              colorScheme="purple" 
              variant="solid" 
              fontSize="sm" 
              px={4} 
              py={2} 
              borderRadius="full"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {badge.icon && `${badge.icon} `}{badge.text}
            </Badge>
          )}
          
          <Heading
            as="h1"
            size={{ base: "xl", md: "2xl" }}
            color="white"
            fontWeight="bold"
            textShadow="0 2px 10px rgba(0,0,0,0.2)"
          >
            {title}
          </Heading>
          
          {description && (
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="whiteAlpha.900"
              maxW="2xl"
              textShadow="0 1px 3px rgba(0,0,0,0.3)"
            >
              {description}
            </Text>
          )}
        </VStack>
      </Container>
    </Box>
  );
};
