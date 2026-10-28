import { useState } from "react";
import { VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { IFilterGroups } from "@/interfaces";
import { AffinityIcon } from "@/components/ui/AffinityIcon";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { KillerIcon } from "@/components/ui/KillerIcon";
import { ChoiceRow, FilterSection, GroupRow, MultiChoiceRow } from "./FilterParts";
import { GroupPickerModal, type PickerCategory } from "./GroupPickerModal";
import type { FilterGroupKey, FilterGroupSelection } from "./filterGroups";

// Same order as the in-game filter
const AFFINITIES = ["Technique", "Instinct", "Force", "Vitesse", "Connaissance"];
const FACTIONS = ["Shinigami", "Capitaine", "Division 0", "Hollow", "Arrancar", "Espada", "Humain", "Quincy", "Stern Ritter", "Aucun"];


export interface CharacterFilterValues {
  affinities: string[];
  killers: string[];
  attackType: string;
  categories: string[];
  groups: FilterGroupSelection;
  // Groups matched on one of their entries ("partial") instead of all of them ("perfect")
  partialGroups: FilterGroupKey[];
}

// The game's character filter: choice sections, then groups of abilities picked in a dialog
export const CharacterFiltersPanel = ({ values, onChange, filterGroups }: {
  values: CharacterFilterValues;
  onChange: (values: Partial<CharacterFilterValues>) => void;
  filterGroups: IFilterGroups | null;
}) => {
  const { t } = useTranslation();
  const [openGroup, setOpenGroup] = useState<FilterGroupKey | null>(null);

  // Special effects and elimination bonuses are flat lists: one unnamed category
  const flat = (entries: IFilterGroups["special"] = []): PickerCategory[] => (entries.length ? [{ id: "all", label: null, types: entries }] : []);
  const groups: { key: FilterGroupKey; title: string; categories: PickerCategory[] }[] = [
    { key: "soul_traits", title: t("components.characterFilters.soulTrait"), categories: filterGroups?.link ?? [] },
    { key: "ex_skills", title: t("components.characterFilters.exSkills"), categories: filterGroups?.ex ?? [] },
    { key: "skills", title: t("components.characterFilters.skills"), categories: filterGroups?.skill ?? [] },
    { key: "special", title: t("components.characterFilters.special"), categories: flat(filterGroups?.special) },
    { key: "destruction", title: t("components.characterFilters.destruction"), categories: flat(filterGroups?.destruction) },
  ];
  const opened = groups.find((group) => group.key === openGroup);

  return (
    <VStack align="stretch" spacing={3}>
      <FilterSection title={t("components.characterFilters.affinity")}>
        <MultiChoiceRow
          values={values.affinities}
          onChange={(affinities) => onChange({ affinities })}
          options={AFFINITIES.map((affinity) => ({
            value: affinity,
            label: t(`affinities.${affinity}`, affinity),
            icon: <AffinityIcon affinity={affinity} size="22px" />,
          }))}
        />
      </FilterSection>

      <FilterSection title={t("components.characterFilters.killer")}>
        <MultiChoiceRow
          values={values.killers}
          onChange={(killers) => onChange({ killers })}
          options={FACTIONS.map((faction) => ({
            value: faction,
            label: t("components.characterFilters.killerOf", { faction: t(`factions.${faction}`, faction) }),
            icon: <KillerIcon killer={faction} size="20px" />,
          }))}
        />
      </FilterSection>

      <FilterSection title={t("components.characterFilters.attackColor")}>
        <ChoiceRow
          value={values.attackType}
          onChange={(attackType) => onChange({ attackType })}
          options={[
            { value: "R", label: t("components.characterFilters.redAttacks"), icon: <AttackTypeBadge attackType="R" size="12px" /> },
            { value: "B", label: t("components.characterFilters.blueAttacks"), icon: <AttackTypeBadge attackType="B" size="12px" /> },
          ]}
        />
      </FilterSection>

      <FilterSection title={t("components.characterFilters.category")}>
        <MultiChoiceRow
          values={values.categories}
          onChange={(categories) => onChange({ categories })}
          options={FACTIONS.map((faction) => ({
            value: faction,
            label: t(`factions.${faction}`, faction),
            icon: <CategoryIcon category={faction} size="20px" />,
          }))}
        />
      </FilterSection>

      <VStack align="stretch" spacing={2} pt={1}>
        {groups.map((group) => (
          <GroupRow
            key={group.key}
            title={group.title}
            count={values.groups[group.key].length}
            onOpen={() => setOpenGroup(group.key)}
            isDisabled={group.categories.length === 0}
          />
        ))}
      </VStack>

      {opened && (
        <GroupPickerModal
          isOpen
          title={opened.title}
          categories={opened.categories}
          selected={values.groups[opened.key]}
          isPartial={values.partialGroups.includes(opened.key)}
          onClose={() => setOpenGroup(null)}
          onChange={(types) => onChange({ groups: { ...values.groups, [opened.key]: types } })}
          onPartialChange={(partial) => onChange({
            partialGroups: partial ? [...values.partialGroups, opened.key] : values.partialGroups.filter((key) => key !== opened.key),
          })}
        />
      )}
    </VStack>
  );
};
