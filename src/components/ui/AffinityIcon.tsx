import { Image, Box, Text } from "@chakra-ui/react";
import { getAffinityIcon } from "../../utils/characterIcons";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const label = t(`affinities.${affinity}`, affinity);
  const imageUrl = getAffinityIcon(affinity);

  if (!imageUrl) {
    return showLabel ? (
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
    ) : null;
  }

  if (showLabel) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Image
          src={imageUrl}
          alt={label}
          width={size}
          height={size}
          objectFit="contain"
          fallback={<Text fontSize="sm">{label}</Text>}
        />
        <Text fontSize="sm">
          {label}
        </Text>
      </Box>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={label}
      width={size}
      height={size}
      objectFit="contain"
      fallback={<Text fontSize="sm">{label}</Text>}
    />
  );
};