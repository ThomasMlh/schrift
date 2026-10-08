import { Box, HStack, Icon, Skeleton, Text, Tooltip } from "@chakra-ui/react";
import type { IconType } from "react-icons";

interface StatCardProps {
  label: string;
  value: string | null;
  icon?: IconType;
  isLoading?: boolean;
  /** Explication affichée au survol */
  tooltip?: string;
}

/** Carte de chiffre clé : libellé + icône en haut, valeur en grand. */
export const StatCard = ({ label, value, icon, isLoading = false, tooltip }: StatCardProps) => (
  <Tooltip label={tooltip} isDisabled={!tooltip} hasArrow placement="top">
    <Box
      bg="bg.card"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.subtle"
      p={4}
      minW={0}
      transition="border-color 0.15s"
      _hover={{ borderColor: "border.strong" }}
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
        {icon && <Icon as={icon} boxSize={4} color="accent" flexShrink={0} aria-hidden />}
      </HStack>
      <Skeleton isLoaded={!isLoading} fadeDuration={0.4}>
        <Text fontSize="2xl" fontWeight="extrabold" lineHeight={1.1} letterSpacing="tight" color="text.strong">
          {value ?? "—"}
        </Text>
      </Skeleton>
    </Box>
  </Tooltip>
);
