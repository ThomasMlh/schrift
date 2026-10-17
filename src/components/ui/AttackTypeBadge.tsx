import { Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

interface AttackTypeBadgeProps {
  attackType: string;
  size?: string;
}

export const AttackTypeBadge = ({ attackType, size = "16px" }: AttackTypeBadgeProps) => {
  const { t } = useTranslation();
  const type = attackType?.toUpperCase();
  
  if (type === 'R') {
    return (
      <Box
        width={size}
        height={size}
        borderRadius="50%"
        backgroundColor="red.500"
        title={t("attackTypes.R")}
      />
    );
  }
  
  if (type === 'B') {
    return (
      <Box
        width={size}
        height={size}
        borderRadius="50%"
        backgroundColor="blue.500"
        title={t("attackTypes.B")}
      />
    );
  }
  
  // Both colors (red and blue)
  return (
    <Box
      width={size}
      height={size}
      borderRadius="50%"
      background="linear-gradient(90deg, red.500 50%, blue.500 50%)"
      bgGradient="linear(to-r, red.500 50%, blue.500 50%)"
      title={`${t("attackTypes.R")} / ${t("attackTypes.B")}`}
    />
  );
};