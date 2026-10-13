import { HStack, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

interface BrandLogoProps {
  label?: string;
  linked?: boolean;
  onClick?: () => void;
}

// Site icon followed by the name in a purple gradient
export const BrandLogo = ({ label = "Schrift", linked = true, onClick }: BrandLogoProps) => (
  <HStack
    as={linked ? Link : "div"}
    {...(linked ? { to: "/" } : {})}
    onClick={onClick}
    spacing={2}
    flexShrink={0}
    _hover={{ textDecoration: "none" }}
  >
    <Image src="/android-chrome-192x192.png" alt="" boxSize={8} borderRadius="full" aria-hidden />
    <Text
      fontWeight="extrabold"
      fontSize="lg"
      letterSpacing="tight"
      bgGradient="linear(to-r, #7C3AED, #4F46E5)"
      _dark={{ bgGradient: "linear(to-r, #C4B5FD, #818CF8)" }}
      bgClip="text"
    >
      {label}
    </Text>
  </HStack>
);
