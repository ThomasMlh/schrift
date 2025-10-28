import { Image, Box, Text } from "@chakra-ui/react";
import { getAffinityIcon } from "../../utils/characterIcons";

interface AffinityIconProps {
  affinity: string;
  size?: string;
  showLabel?: boolean;
}

export const AffinityIcon = ({ 
  affinity, 
  size = "24px", 
  showLabel = false 
}: AffinityIconProps) => {
  const imageUrl = getAffinityIcon(affinity);

  if (!imageUrl) {
    return showLabel ? (
      <Text fontSize="sm" color="gray.500">
        {affinity}
      </Text>
    ) : null;
  }

  if (showLabel) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Image
          src={imageUrl}
          alt={affinity}
          width={size}
          height={size}
          fallback={<Text fontSize="sm">{affinity}</Text>}
        />
        <Text fontSize="sm">
          {affinity}
        </Text>
      </Box>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={affinity}
      width={size}
      height={size}
      fallback={<Text fontSize="sm">{affinity}</Text>}
    />
  );
};