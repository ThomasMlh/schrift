import { useState } from "react";
import { Box, Button, ButtonGroup, Flex, Icon, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { FiFilter, FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useCharacterMeta } from "@/hooks/useAPI";
import { CharacterFiltersPanel } from "@/components/characters/filters/CharacterFiltersPanel";
import { countPanelFilters, EMPTY_ALBUM_FILTERS, hasAlbumFilters, type AlbumFilterValues, type OwnershipFilter } from "@/utils/albumFilters";

interface AlbumFiltersProps {
  value: AlbumFilterValues;
  onChange: (value: AlbumFilterValues) => void;
  ownershipLabels: Record<OwnershipFilter, string>;
}

// Search and ownership, then the same filter panel as the Characters page
export const AlbumFilters = ({ value, onChange, ownershipLabels }: AlbumFiltersProps) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const { filterGroups } = useCharacterMeta();
  const panelCount = countPanelFilters(value);

  return (
    <Box>
      <Flex gap={3} wrap="wrap">
        <InputGroup flex="1 1 220px">
          <InputLeftElement pointerEvents="none"><FiSearch /></InputLeftElement>
          <Input
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            placeholder={t("pages.user.albumSearchPlaceholder")}
          />
        </InputGroup>
        <ButtonGroup size="md" isAttached variant="outline">
          {(["all", "owned", "missing"] as const).map((key) => (
            <Button
              key={key}
              colorScheme={value.ownership === key ? "purple" : "gray"}
              variant={value.ownership === key ? "solid" : "outline"}
              onClick={() => onChange({ ...value, ownership: key })}
            >
              {ownershipLabels[key]}
            </Button>
          ))}
        </ButtonGroup>
        <Button
          onClick={() => setShowFilters((open) => !open)}
          variant={showFilters ? "solid" : "outline"}
          colorScheme="orange"
          flexShrink={0}
          leftIcon={<Icon as={FiFilter} />}
          aria-expanded={showFilters}
        >
          {showFilters ? t("components.characterFilters.hide") : t("components.characterFilters.toggle")}
          {panelCount > 0 && ` (${panelCount})`}
        </Button>
        {hasAlbumFilters(value) && (
          <Button variant="ghost" onClick={() => onChange(EMPTY_ALBUM_FILTERS)}>{t("common.reset")}</Button>
        )}
      </Flex>
      {showFilters && (
        <Box mt={4}>
          <CharacterFiltersPanel
            values={value}
            onChange={(next) => onChange({ ...value, ...next })}
            filterGroups={filterGroups}
          />
        </Box>
      )}
    </Box>
  );
};
