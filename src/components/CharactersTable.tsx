import {
  Box, Button, VStack, Text, Input, InputGroup, InputLeftElement, Flex, SimpleGrid, Skeleton,
  Icon, Tag, TagLabel, TagCloseButton, Wrap, WrapItem,
} from "@chakra-ui/react";
import { FiCrosshair, FiFilter, FiSearch } from "react-icons/fi";
import { CharacterCard } from "./character/CharacterCard";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCharacterMeta, useCharacters, useCycles } from "@/hooks/useAPI";
import { AffinityIcon } from "./ui/AffinityIcon";
import { KillerIcon } from "./ui/KillerIcon";
import { CategoryIcon } from "./ui/CategoryIcon";
import { AttackTypeBadge } from "./ui/AttackTypeBadge";
import { CharacterFiltersPanel, type CharacterFilterValues } from "./characters/filters/CharacterFiltersPanel";
import { EMPTY_GROUPS, FILTER_GROUP_KEYS, listParam, type FilterGroupKey, type FilterGroupSelection } from "./characters/filters/filterGroups";
import { gameText } from "@/utils/gameText";
import { Pagination as PaginationComponent } from "./ui/Pagination";
import { CustomSelect } from "./ui/CustomSelect";
import { useTranslation } from "react-i18next";

export const CharactersTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [selectedAffinities, setSelectedAffinities] = useState(() => listParam(searchParams.get('affinity')));
  const [selectedCategories, setSelectedCategories] = useState(() => listParam(searchParams.get('category')));
  const [selectedKillers, setSelectedKillers] = useState(() => listParam(searchParams.get('killer')));
  const [selectedAttackType, setSelectedAttackType] = useState(searchParams.get('attack_type') || "");
  const [groups, setGroups] = useState<FilterGroupSelection>(() => Object.fromEntries(
    FILTER_GROUP_KEYS.map((key) => [key, (searchParams.get(key) || "").split(',').filter(Boolean)])
  ) as FilterGroupSelection);
  const [partialGroups, setPartialGroups] = useState<FilterGroupKey[]>(
    () => FILTER_GROUP_KEYS.filter((key) => searchParams.get(`${key}_match`) === "any")
  );
  const [showFilters, setShowFilters] = useState(false);
  const { filterGroups } = useCharacterMeta();
  // Names of the game abilities, effects and bonuses, for the active filter tags
  const groupLabels = new Map([
    ...[...(filterGroups?.link ?? []), ...(filterGroups?.ex ?? []), ...(filterGroups?.skill ?? [])].flatMap((c) => c.types),
    ...(filterGroups?.special ?? []),
    ...(filterGroups?.destruction ?? []),
  ].map((entry) => [entry.type, gameText(entry.label, i18n.language)]));
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit') || '24'));


  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const groupsKey = `${FILTER_GROUP_KEYS.map((key) => groups[key].join(',')).join('|')}/${partialGroups.join(',')}`;
  const affinityKey = selectedAffinities.join(',');
  const categoryKey = selectedCategories.join(',');
  const killerKey = selectedKillers.join(',');
  const activeGroupCount = FILTER_GROUP_KEYS.reduce((sum, key) => sum + groups[key].length, 0);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, affinityKey, categoryKey, killerKey, selectedAttackType, groupsKey, itemsPerPage]);

  const { cycles, isLoading: cyclesLoading } = useCycles({ limit: 5 });
  const { currentRotation } = useCurrentRotation(cycles, cyclesLoading);

  const { characters, pagination, isLoading } = useCharacters({
    page: currentPage,
    limit: itemsPerPage,
    searchQuery: debouncedSearch,
    affinity: affinityKey,
    category: categoryKey,
    killer: killerKey,
    attackType: selectedAttackType,
    groups,
    partialGroups,
  });

  // Keep the URL in sync with the filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (affinityKey) params.set('affinity', affinityKey);
    if (categoryKey) params.set('category', categoryKey);
    if (killerKey) params.set('killer', killerKey);
    if (selectedAttackType) params.set('attack_type', selectedAttackType);
    for (const key of FILTER_GROUP_KEYS) {
      if (groups[key].length === 0) continue;
      params.set(key, groups[key].join(','));
      if (partialGroups.includes(key)) params.set(`${key}_match`, 'any');
    }
    if (itemsPerPage !== 24) params.set('limit', itemsPerPage.toString());
    if (currentPage !== 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, affinityKey, categoryKey, killerKey, selectedAttackType, groupsKey, itemsPerPage, currentPage, setSearchParams]);

  const handlePageChange = (page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages) setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedAffinities([]);
    setSelectedCategories([]);
    setSelectedKillers([]);
    setPartialGroups([]);
    setSelectedAttackType("");
    setGroups(EMPTY_GROUPS);
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasFilters = Boolean(searchTerm || affinityKey || categoryKey || killerKey || selectedAttackType || activeGroupCount);
  const panelFilterCount = selectedAffinities.length + selectedCategories.length + selectedKillers.length
    + (selectedAttackType ? 1 : 0) + activeGroupCount;

  const filterValues: CharacterFilterValues = {
    affinities: selectedAffinities,
    killers: selectedKillers,
    attackType: selectedAttackType,
    categories: selectedCategories,
    groups,
    partialGroups,
  };
  const changeFilters = (next: Partial<CharacterFilterValues>) => {
    if (next.affinities) setSelectedAffinities(next.affinities);
    if (next.killers) setSelectedKillers(next.killers);
    if (next.attackType !== undefined) setSelectedAttackType(next.attackType);
    if (next.categories) setSelectedCategories(next.categories);
    if (next.partialGroups) setPartialGroups(next.partialGroups);
    if (next.groups) setGroups(next.groups);
  };
  const rotationAttack = currentRotation?.attack === "R" || currentRotation?.attack === "B" ? currentRotation.attack : "";
  const isRotationFilterActive = Boolean(currentRotation)
    && killerKey === currentRotation?.killer
    && selectedAttackType === rotationAttack;

  // Toggles the killer and attack filters of the current rotation
  const applyRotationFilter = () => {
    if (!currentRotation) return;
    if (isRotationFilterActive) {
      setSelectedKillers([]);
      setSelectedAttackType("");
    } else {
      setSelectedKillers([currentRotation.killer]);
      setSelectedAttackType(rotationAttack);
    }
  };

  const filterTag = (key: string, icon: React.ReactNode, label: string, onClear: () => void) => (
    <WrapItem key={key}>
      <Tag size="sm" borderRadius="full" colorScheme="purple" variant="subtle">
        {icon && <Box mr={1.5} display="inline-flex">{icon}</Box>}
        <TagLabel>{label}</TagLabel>
        <TagCloseButton onClick={onClear} />
      </Tag>
    </WrapItem>
  );

  return (
    <VStack spacing={5} align="stretch" w="100%">
      <Box bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle" p={{ base: 3, md: 4 }}>
        <Flex gap={3} direction={{ base: "column", md: "row" }} align={{ base: "stretch", md: "center" }}>
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="text.muted" />
            </InputLeftElement>
            <Input
              placeholder={t("components.charactersTable.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="lg"
            />
          </InputGroup>
          <Button
            onClick={() => setShowFilters((open) => !open)}
            variant={showFilters ? "solid" : "outline"}
            colorScheme="orange"
            borderRadius="lg"
            flexShrink={0}
            leftIcon={<Icon as={FiFilter} />}
            aria-expanded={showFilters}
          >
            {showFilters ? t("components.characterFilters.hide") : t("components.characterFilters.toggle")}
            {panelFilterCount > 0 && ` (${panelFilterCount})`}
          </Button>
          {currentRotation && (
            <Button
              onClick={applyRotationFilter}
              variant={isRotationFilterActive ? "solid" : "outline"}
              colorScheme="purple"
              borderRadius="lg"
              flexShrink={0}
              leftIcon={rotationAttack ? <AttackTypeBadge attackType={rotationAttack} size="12px" /> : <Icon as={FiCrosshair} />}
              aria-pressed={isRotationFilterActive}
            >
              {t("components.charactersTable.rotationShortcut", { killer: t(`factions.${currentRotation.killer}`, currentRotation.killer) })}
            </Button>
          )}
        </Flex>

        {showFilters && (
          <Box mt={4}>
            <CharacterFiltersPanel values={filterValues} onChange={changeFilters} filterGroups={filterGroups} />
          </Box>
        )}

        {hasFilters && (
          <Flex mt={3} gap={2} align="center" wrap="wrap">
            <Wrap spacing={2} flex={1}>
              {searchTerm && filterTag("search", <Icon as={FiSearch} />, searchTerm, () => setSearchTerm(""))}
              {selectedAffinities.map((affinity) => filterTag(`affinity-${affinity}`, <AffinityIcon affinity={affinity} size="14px" />, t(`affinities.${affinity}`, affinity), () => setSelectedAffinities(selectedAffinities.filter((a) => a !== affinity))))}
              {selectedCategories.map((category) => filterTag(`category-${category}`, <CategoryIcon category={category} size="14px" />, t(`factions.${category}`, category), () => setSelectedCategories(selectedCategories.filter((c) => c !== category))))}
              {selectedKillers.map((killer) => filterTag(`killer-${killer}`, <KillerIcon killer={killer} size="14px" />, `${t("components.charactersTable.filterKiller")} ${t(`factions.${killer}`, killer)}`, () => setSelectedKillers(selectedKillers.filter((k) => k !== killer))))}
              {FILTER_GROUP_KEYS.flatMap((key) => groups[key].map((type) => filterTag(
                `${key}-${type}`,
                null,
                groupLabels.get(type) ?? type,
                () => setGroups({ ...groups, [key]: groups[key].filter((s) => s !== type) }),
              )))}
              {selectedAttackType && filterTag("attack", <AttackTypeBadge attackType={selectedAttackType} size="10px" />, selectedAttackType === "R" ? t("components.charactersTable.attackRed") : t("components.charactersTable.attackBlue"), () => setSelectedAttackType(""))}
            </Wrap>
            <Button size="xs" variant="ghost" colorScheme="red" borderRadius="full" onClick={resetFilters}>
              {t("components.charactersTable.clearAll")}
            </Button>
          </Flex>
        )}
      </Box>

      <Flex justify="space-between" align="center" gap={3} px={1}>
        <Text fontSize="sm" color="text.muted">
          {pagination ? t("components.charactersTable.resultsCount", { count: pagination.totalCount }) : ""}
        </Text>
        <CustomSelect
          value={String(itemsPerPage)}
          onChange={(val) => setItemsPerPage(Number(val))}
          options={[
            { value: "24", label: "24 / page" },
            { value: "48", label: "48 / page" },
            { value: "96", label: "96 / page" },
          ]}
          allowDeselect={false}
          size="sm"
          w="120px"
        />
      </Flex>

      {isLoading ? (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={3}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Box key={i} borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor="border.subtle">
              <Skeleton aspectRatio={4 / 3} />
              <Box px={2} py={2.5}><Skeleton h="14px" w="70%" mx="auto" /><Skeleton h="12px" w="50%" mt={2} mx="auto" /></Box>
            </Box>
          ))}
        </SimpleGrid>
      ) : characters.length === 0 ? (
        <Flex direction="column" align="center" gap={2} py={16} bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
          <Icon as={FiSearch} boxSize={8} color="text.muted" />
          <Text fontWeight="semibold" color="text.secondary">{t("components.charactersTable.noResults")}</Text>
          <Text fontSize="sm" color="text.muted">{t("components.charactersTable.noResultsHint")}</Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={3}>
          {characters.map((character) => (
            <CharacterCard key={character._id} character={character} />
          ))}
        </SimpleGrid>
      )}

      {pagination && (
        <PaginationComponent
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          hasPrevPage={pagination.hasPrevPage}
          hasNextPage={pagination.hasNextPage}
          onPageChange={handlePageChange}
          totalCount={pagination.totalCount}
          itemsOnPage={pagination.itemsOnPage}
        />
      )}
    </VStack>
  );
};
