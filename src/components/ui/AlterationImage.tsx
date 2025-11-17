import { Image, Box, Text } from "@chakra-ui/react";
import { getAlterationImage } from "../../utils/alterations";

interface AlterationImageProps {
  alteration: string;
  size?: string;
  showLabel?: boolean;
  fontWeight?: string;
}

export const AlterationImage = ({ 
  alteration, 
  size = "24px", 
  showLabel = false,
  fontWeight = "normal"
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
          fallback={<Text fontSize="sm" fontWeight={fontWeight}>{alteration}</Text>}
        />
        <Text fontSize="sm" fontWeight={fontWeight}>
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
      fallback={<Text fontSize="sm" fontWeight={fontWeight}>{alteration}</Text>}
    />
  );
};