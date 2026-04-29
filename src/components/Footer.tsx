import { Box, Flex, Text, useColorMode } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box
      as="footer"
      w="100%"
      py={5}
      px={6}
      bg={isDark ? 'gray.900' : 'white'}
      borderTop="1px solid"
      borderColor={isDark ? 'whiteAlpha.100' : 'gray.100'}
      mt="auto"
    >
      <Flex
        maxW="container.xl"
        mx="auto"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
        gap={3}
      >
        <Text
          fontWeight="extrabold"
          fontSize="lg"
          letterSpacing="tight"
          bgGradient={isDark ? "linear(to-r, #C4B5FD, #818CF8)" : "linear(to-r, #7C3AED, #4F46E5)"}
          bgClip="text"
          flexShrink={0}
        >
          Schrift BBS
        </Text>
        <Text fontSize="xs" textAlign="center" color={isDark ? 'gray.500' : 'gray.400'} maxW="md">
          {t("footer.disclaimer")}
        </Text>
        <Text fontSize="xs" color={isDark ? 'gray.600' : 'gray.400'} flexShrink={0}>
          {t("footer.copyrights")}
        </Text>
      </Flex>
    </Box>
  );
};
