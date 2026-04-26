import { Image, Box, Text } from "@chakra-ui/react";
import { getCategoryIcon } from "../../utils/characterIcons";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const label = t(`factions.${category}`, category);
  const imageUrl = getCategoryIcon(category);

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
      fallback={<Text fontSize="sm">{label}</Text>}
    />
  );
};