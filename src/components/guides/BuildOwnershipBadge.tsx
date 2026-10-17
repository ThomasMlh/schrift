import { Badge, Box, Text, Tooltip } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { BuildOwnership } from "@/utils/buildOwnership";

export const BuildOwnershipBadge = ({ ownership }: { ownership: BuildOwnership }) => {
  const { t } = useTranslation();
  const { missingTeam, missingLinks } = ownership;

  const [colorScheme, label] = missingTeam.length > 0
    ? ["red", t("components.buildOwnership.missingTeam", { count: missingTeam.length })]
    : missingLinks.length > 0
      ? ["orange", t("components.buildOwnership.missingLinks", { count: missingLinks.length })]
      : ["green", t("components.buildOwnership.playable")];

  const details = (
    <Box>
      {missingTeam.length > 0 && <Text>{t("components.buildOwnership.teamLabel")} {missingTeam.join(", ")}</Text>}
      {missingLinks.length > 0 && <Text>{t("components.buildOwnership.linksLabel")} {missingLinks.join(", ")}</Text>}
    </Box>
  );

  return (
    <Tooltip label={details} hasArrow isDisabled={missingTeam.length + missingLinks.length === 0}>
      <Badge colorScheme={colorScheme} variant="subtle" borderRadius="full" px={2} textTransform="none">
        {label}
      </Badge>
    </Tooltip>
  );
};
