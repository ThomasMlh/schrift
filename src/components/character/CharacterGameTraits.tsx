import { Box, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { GameText, IGameTrait, IGameTraits } from "@/interfaces";
import { gameText } from "@/utils/gameText";
import { Pill, TraitRow } from "./SectionCard";

// Same sections and order as the in-game character sheet
const SECTIONS: { key: keyof IGameTraits; label: string }[] = [
  { key: "ex", label: "pages.characterDetail.traitsEx" },
  { key: "link", label: "pages.characterDetail.traitsLink" },
  { key: "passive", label: "pages.characterDetail.traitsPassive" },
  { key: "tree", label: "pages.characterDetail.traitsTree" },
];

// Abilities read from the game tables, for the base or the resurrected form
export const CharacterGameTraits = ({ traits, special, profile }: {
  traits: IGameTraits;
  special?: GameText | null;
  profile?: GameText | null;
}) => {
  const { t, i18n } = useTranslation();
  const label = (trait: IGameTrait) => gameText(trait.text, i18n.language) || trait.type;

  return (
    <VStack align="stretch" spacing={4}>
      {SECTIONS.filter(({ key }) => traits[key]?.length > 0).map(({ key, label: title }) => (
        <TraitRow key={key} label={t(title)}>
          {traits[key].map((trait, index) => <Pill key={`${trait.type}-${index}`}>{label(trait)}</Pill>)}
        </TraitRow>
      ))}
      {special && (
        <Box>
          <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={1}>
            {t("pages.characterDetail.traitsSpecial")}
          </Text>
          <Text fontSize="sm" color="text.body">{gameText(special, i18n.language)}</Text>
        </Box>
      )}
      {profile && (
        <Text fontSize="sm" color="text.muted" fontStyle="italic">{gameText(profile, i18n.language)}</Text>
      )}
    </VStack>
  );
};
