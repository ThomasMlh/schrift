import { Image, Box, Text } from "@chakra-ui/react";
import { getAlterationImage } from "../../utils/alterations";

interface AlterationImageProps {
  alteration: string;
  size?: string;
  showLabel?: boolean;
}

export const AlterationImage = ({ 
  alteration, 
  size = "24px", 
  showLabel = false 
}: AlterationImageProps) => {
  const imageUrl = getAlterationImage(alteration);

  if (!imageUrl) {
    return showLabel ? (
      <Text fontSize="sm" color="gray.500">
        {alteration}
      </Text>
    ) : null;
  }

  if (showLabel) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Image
          src={imageUrl}
          alt={alteration}
          width={size}
          height={size}
          fallback={<Text fontSize="sm">{alteration}</Text>}
        />
        <Text fontSize="sm">
          {alteration}
        </Text>
      </Box>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alteration}
      width={size}
      height={size}
      fallback={<Text fontSize="sm">{alteration}</Text>}
    />
  );
};