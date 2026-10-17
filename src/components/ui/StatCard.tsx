import { Box, HStack, Icon, Skeleton, Text, Tooltip } from "@chakra-ui/react";
import type { IconType } from "react-icons";

interface StatCardProps {
  label: string;
  value: string | null;
  icon?: IconType;
  isLoading?: boolean;
  /** Explanation shown on hover */
  tooltip?: string;
  /** Chakra gradient of the icon chip, e.g. "linear(to-br, purple.500, pink.400)" */
  gradient?: string;
}

/** Key figure card: label and gradient icon chip on top, large value. */
export const StatCard = ({ label, value, icon, isLoading = false, tooltip, gradient = "linear(to-br, purple.500, blue.500)" }: StatCardProps) => (
  <Tooltip label={tooltip} isDisabled={!tooltip} hasArrow placement="top">
    <Box
      bg="bg.card"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.subtle"
      p={4}
      minW={0}
      boxShadow="md"
      transition="transform 0.15s, border-color 0.15s"
      _hover={{ borderColor: "border.strong", transform: "translateY(-2px)" }}
    >
      <HStack justify="space-between" spacing={2} mb={2}>
        <Text
          fontSize="xs"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="wide"
          fontWeight="semibold"
          noOfLines={1}
        >
          {label}
        </Text>
        {icon && (
          <Box p={2} borderRadius="lg" bgGradient={gradient} display="flex" flexShrink={0}>
            <Icon as={icon} boxSize={3.5} color="white" aria-hidden />
          </Box>
        )}
      </HStack>
      <Skeleton isLoaded={!isLoading} fadeDuration={0.4}>
        <Text fontSize="2xl" fontWeight="extrabold" lineHeight={1.1} letterSpacing="tight" color="text.strong">
          {value ?? "—"}
        </Text>
      </Skeleton>
    </Box>
  </Tooltip>
);
