import {
  Box, Button, VStack, Text, Input, InputGroup, InputLeftElement, Flex, SimpleGrid, Skeleton,
  Icon, Tag, TagLabel, TagCloseButton, Wrap, WrapItem,
} from "@chakra-ui/react";
import { FiCrosshair, FiSearch } from "react-icons/fi";
import { CharacterCard } from "./character/CharacterCard";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCharacters, useCycles } from "@/hooks/useAPI";
import { AffinityIcon } from "./ui/AffinityIcon";
import { KillerIcon } from "./ui/KillerIcon";
import { CategoryIcon } from "./ui/CategoryIcon";
import { AttackTypeBadge } from "./ui/AttackTypeBadge";
import { AffinityFilter } from "./ui/AffinityFilter";
import { CategoryFilter } from "./ui/CategoryFilter";
import { KillerFilter } from "./ui/KillerFilter";
import { AttackTypeFilter } from "./ui/AttackTypeFilter";
import { Pagination as PaginationComponent } from "./ui/Pagination";
import { CharactersKillers, CharactersCategories, CharactersAffinities } from "../utils/chractersData";
import { CustomSelect } from "./ui/CustomSelect";
import { useTranslation } from "react-i18next";

export const CharactersTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [selectedAffinity, setSelectedAffinity] = useState(searchParams.get('affinity') || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "");
  const [selectedKiller, setSelectedKiller] = useState(searchParams.get('killer') || "");
  const [selectedAttackType, setSelectedAttackType] = useState(searchParams.get('attack_type') || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit') || '24'));

  const affinities = CharactersAffinities;
  const categories = CharactersCategories;
  const killers = CharactersKillers;


  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, selectedAffinity, selectedCategory, selectedKiller, selectedAttackType, itemsPerPage]);

  const { cycles, isLoading: cyclesLoading } = useCycles({ limit: 5 });
  const { currentRotation } = useCurrentRotation(cycles, cyclesLoading);

  const { characters, pagination, isLoading } = useCharacters({
    page: currentPage,
    limit: itemsPerPage,
    searchQuery: debouncedSearch,
    affinity: selectedAffinity,
    category: selectedCategory,
    killer: selectedKiller,
    attackType: selectedAttackType,
  });

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (selectedAffinity) params.set('affinity', selectedAffinity);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedKiller) params.set('killer', selectedKiller);
    if (selectedAttackType) params.set('attack_type', selectedAttackType);
    if (itemsPerPage !== 24) params.set('limit', itemsPerPage.toString());
    if (currentPage !== 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedAffinity, selectedCategory, selectedKiller, selectedAttackType, itemsPerPage, currentPage, setSearchParams]);

  const handlePageChange = (page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages) setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedAffinity("");
    setSelectedCategory("");
    setSelectedKiller("");
    setSelectedAttackType("");
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasFilters = Boolean(searchTerm || selectedAffinity || selectedCategory || selectedKiller || selectedAttackType);
  const rotationAttack = currentRotation?.attack === "R" || currentRotation?.attack === "B" ? currentRotation.attack : "";
  const isRotationFilterActive = Boolean(currentRotation)
    && selectedKiller === currentRotation?.killer
    && selectedAttackType === rotationAttack;

  // Règle killer + attaque sur la rotation en cours (ou les retire si déjà appliqués)
  const applyRotationFilter = () => {
    if (!currentRotation) return;
    if (isRotationFilterActive) {
      setSelectedKiller("");
      setSelectedAttackType("");
    } else {
      setSelectedKiller(currentRotation.killer);
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
      {/* ── Filtres ── */}
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

        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={3} mt={3}>
          <AffinityFilter selectedAffinity={selectedAffinity} affinities={affinities} onAffinityChange={setSelectedAffinity} />
          <CategoryFilter selectedCategory={selectedCategory} categories={categories} onCategoryChange={setSelectedCategory} />
          <KillerFilter selectedKiller={selectedKiller} killers={killers} onKillerChange={setSelectedKiller} />
          <AttackTypeFilter selectedAttackType={selectedAttackType} onAttackTypeChange={setSelectedAttackType} />
          <CustomSelect
            value={String(itemsPerPage)}
            onChange={(val) => setItemsPerPage(Number(val))}
            options={[
              { value: "24", label: "24 / page" },
              { value: "48", label: "48 / page" },
              { value: "96", label: "96 / page" },
            ]}
            allowDeselect={false}
          />
        </SimpleGrid>

        {hasFilters && (
          <Flex mt={3} gap={2} align="center" wrap="wrap">
            <Wrap spacing={2} flex={1}>
              {searchTerm && filterTag("search", <Icon as={FiSearch} />, searchTerm, () => setSearchTerm(""))}
              {selectedAffinity && filterTag("affinity", <AffinityIcon affinity={selectedAffinity} size="14px" />, selectedAffinity, () => setSelectedAffinity(""))}
              {selectedCategory && filterTag("category", <CategoryIcon category={selectedCategory} size="14px" />, t(`factions.${selectedCategory}`, selectedCategory), () => setSelectedCategory(""))}
              {selectedKiller && filterTag("killer", <KillerIcon killer={selectedKiller} size="14px" />, `${t("components.charactersTable.filterKiller")} ${t(`factions.${selectedKiller}`, selectedKiller)}`, () => setSelectedKiller(""))}
              {selectedAttackType && filterTag("attack", <AttackTypeBadge attackType={selectedAttackType} size="10px" />, selectedAttackType === "R" ? t("components.charactersTable.attackRed") : t("components.charactersTable.attackBlue"), () => setSelectedAttackType(""))}
            </Wrap>
            <Button size="xs" variant="ghost" colorScheme="red" borderRadius="full" onClick={resetFilters}>
              {t("components.charactersTable.clearAll")}
            </Button>
          </Flex>
        )}
      </Box>

      {pagination && (
        <Text fontSize="sm" color="text.muted" px={1}>
          {t("components.charactersTable.resultsCount", { count: pagination.totalCount })}
        </Text>
      )}

      {/* ── Grille ── */}
      {isLoading ? (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={3}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Box key={i} borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor="border.subtle">
              <Skeleton aspectRatio={1} />
              <Box p={3}><Skeleton h="14px" w="80%" /><Skeleton h="14px" w="40%" mt={2} /></Box>
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
