import { Image, Box, Text } from "@chakra-ui/react";
import { getKillerIcon } from "../../utils/characterIcons";

interface KillerIconProps {
  killer: string;
  size?: string;
  showLabel?: boolean;
}

export const KillerIcon = ({ 
  killer, 
  size = "24px", 
  showLabel = false 
}: KillerIconProps) => {
  const imageUrl = getKillerIcon(killer);

  if (!imageUrl) {
    return showLabel ? (
      <Text fontSize="sm" color="gray.500">
        {killer}
      </Text>
    ) : null;
  }

  if (showLabel) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Image
          src={imageUrl}
          alt={killer}
          width={size}
          height={size}
          fallback={<Text fontSize="sm">{killer}</Text>}
        />
        <Text fontSize="sm">
          {killer}
        </Text>
      </Box>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={killer}
      width={size}
      height={size}
      fallback={<Text fontSize="sm">{killer}</Text>}
    />
  );
};