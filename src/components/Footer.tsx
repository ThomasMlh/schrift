import { Box, Text, VStack, useColorModeValue } from "@chakra-ui/react";

export const Footer = () => {
  const bgColor = useColorModeValue("gray.100", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Box
      as="footer"
      w="100%"
      py={6}
      px={4}
      bg={bgColor}
      borderTop="1px solid"
      borderColor={borderColor}
      mt="auto"
    >
      <VStack spacing={3} maxW="container.xl" mx="auto">
        <Text fontSize="sm" fontWeight="semibold">
          Copyrights
        </Text>
        <Text fontSize="xs" textAlign="center" lineHeight="tall" color={textColor}>
          BLEACH © Tite Kubo/Shueisha, TV TOKYO, dentsu, Pierrot BLEACH Brave
          Souls © KLabGames Neither BBS-Schrift, nor its creator, are
          affiliated with any of the aforementioned parties.
        </Text>
      </VStack>
    </Box>
  );
};
