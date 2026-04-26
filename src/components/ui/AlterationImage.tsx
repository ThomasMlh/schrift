import { Image, Box, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const label = t(`alterations.${alteration}`, alteration);
  const imageUrl = getAlterationImage(alteration);

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
          fallback={<Text fontSize="sm" fontWeight={fontWeight}>{label}</Text>}
        />
        <Text fontSize="sm" fontWeight={fontWeight}>
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
      fallback={<Text fontSize="sm" fontWeight={fontWeight}>{label}</Text>}
    />
  );
};