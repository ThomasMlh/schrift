import { Image, Box, Text } from "@chakra-ui/react";
import { getCategoryIcon } from "../../utils/characterIcons";

interface CategoryIconProps {
  category: string;
  size?: string;
  showLabel?: boolean;
}

export const CategoryIcon = ({ 
  category, 
  size = "24px", 
  showLabel = false 
}: CategoryIconProps) => {
  const imageUrl = getCategoryIcon(category);

  if (!imageUrl) {
    return showLabel ? (
      <Text fontSize="sm" color="gray.500">
        {category}
      </Text>
    ) : null;
  }

  if (showLabel) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Image
          src={imageUrl}
          alt={category}
          width={size}
          height={size}
          fallback={<Text fontSize="sm">{category}</Text>}
        />
        <Text fontSize="sm">
          {category}
        </Text>
      </Box>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={category}
      width={size}
      height={size}
      fallback={<Text fontSize="sm">{category}</Text>}
    />
  );
};