import { Box, Button, ButtonGroup, Flex, Input, InputGroup, InputLeftElement, SimpleGrid } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { AffinityFilter } from "@/components/ui/AffinityFilter";
import { CategoryFilter } from "@/components/ui/CategoryFilter";
import { KillerFilter } from "@/components/ui/KillerFilter";
import { AttackTypeFilter } from "@/components/ui/AttackTypeFilter";
import { CharactersAffinities, CharactersCategories, CharactersKillers } from "@/utils/chractersData";
import { EMPTY_ALBUM_FILTERS, hasAlbumFilters, type AlbumFilterValues, type OwnershipFilter } from "@/utils/albumFilters";

interface AlbumFiltersProps {
  value: AlbumFilterValues;
  onChange: (value: AlbumFilterValues) => void;
  ownershipLabels: Record<OwnershipFilter, string>;
}

export const AlbumFilters = ({ value, onChange, ownershipLabels }: AlbumFiltersProps) => {
  const { t } = useTranslation();
  const set = <K extends keyof AlbumFilterValues>(key: K) => (next: AlbumFilterValues[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <Box>
      <Flex gap={3} wrap="wrap">
        <InputGroup flex="1 1 220px">
          <InputLeftElement pointerEvents="none"><FiSearch /></InputLeftElement>
          <Input
            value={value.search}
            onChange={(e) => set("search")(e.target.value)}
            placeholder={t("pages.user.albumSearchPlaceholder")}
          />
        </InputGroup>
        <ButtonGroup size="md" isAttached variant="outline">
          {(["all", "owned", "missing"] as const).map((key) => (
            <Button
              key={key}
              colorScheme={value.ownership === key ? "purple" : "gray"}
              variant={value.ownership === key ? "solid" : "outline"}
              onClick={() => set("ownership")(key)}
            >
              {ownershipLabels[key]}
            </Button>
          ))}
        </ButtonGroup>
        {hasAlbumFilters(value) && (
          <Button variant="ghost" onClick={() => onChange(EMPTY_ALBUM_FILTERS)}>{t("common.reset")}</Button>
        )}
      </Flex>
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mt={3}>
        <AffinityFilter selectedAffinity={value.affinity} affinities={CharactersAffinities} onAffinityChange={set("affinity")} />
        <CategoryFilter selectedCategory={value.category} categories={CharactersCategories} onCategoryChange={set("category")} />
        <KillerFilter selectedKiller={value.killer} killers={CharactersKillers} onKillerChange={set("killer")} />
        <AttackTypeFilter selectedAttackType={value.attackType} onAttackTypeChange={set("attackType")} />
      </SimpleGrid>
    </Box>
  );
};
