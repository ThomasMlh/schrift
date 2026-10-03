import { Badge, Tooltip } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

interface ProgressionBadgeProps {
  percent: number;
  previousAverage?: number;
  average?: number;
  fontSize?: string | { base?: string; md?: string };
}

// Écart de moyenne avec le cycle précédent (classement "progression"). Le signe et la flèche
// portent le sens, pas seulement la couleur ; l'infobulle donne les deux moyennes.
export const ProgressionBadge = ({ percent, previousAverage, average, fontSize = { base: "xs", md: "sm" } }: ProgressionBadgeProps) => {
  const { t } = useTranslation();
  const arrow = percent > 0 ? "▲" : percent < 0 ? "▼" : "■";
  const label = `${arrow} ${percent > 0 ? "+" : ""}${percent.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
  const tooltip = previousAverage != null && average != null
    ? t("components.podiumResults.progressionTooltip", {
      previous: previousAverage.toLocaleString("fr-FR"),
      current: average.toLocaleString("fr-FR"),
    })
    : undefined;

  return (
    <Tooltip label={tooltip} hasArrow isDisabled={!tooltip}>
      <Badge
        colorScheme={percent > 0 ? "green" : percent < 0 ? "red" : "gray"}
        variant="solid"
        fontWeight="bold"
        fontSize={fontSize}
        whiteSpace="nowrap"
      >
        {label}
      </Badge>
    </Tooltip>
  );
};
