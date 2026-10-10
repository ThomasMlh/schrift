import { Box, HStack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { BRAND_GRADIENT } from "./navConfig";

interface BrandLogoProps {
  label?: string;
  linked?: boolean;
  onClick?: () => void;
}

// Pastille dégradée « S » suivie du nom du site
export const BrandLogo = ({ label = "Schrift", linked = true, onClick }: BrandLogoProps) => (
  <HStack
    as={linked ? Link : "div"}
    {...(linked ? { to: "/" } : {})}
    onClick={onClick}
    spacing={2}
    flexShrink={0}
    _hover={{ textDecoration: "none" }}
  >
    <Box
      w={8}
      h={8}
      borderRadius="lg"
      bgGradient={BRAND_GRADIENT}
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontWeight="black"
      fontSize="md"
      boxShadow="0 2px 10px rgba(124,58,237,0.35)"
      aria-hidden
    >
      S
    </Box>
    <Text fontWeight="extrabold" fontSize="lg" letterSpacing="tight" color="text.strong">
      {label}
    </Text>
  </HStack>
);
