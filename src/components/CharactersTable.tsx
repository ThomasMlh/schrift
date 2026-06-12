import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Button, HStack, VStack,
  Text, Input, InputGroup, InputLeftElement,
  useColorMode, Badge, Flex, Avatar, Tooltip, SimpleGrid
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNextSearchParams } from "@/hooks/useNextSearchParams";
import { SearchIcon } from "@chakra-ui/icons";
import { useCharacters } from "@/hooks/useAPI";
import { AffinityIcon } from "./ui/AffinityIcon";
import { KillerIcon } from "./ui/KillerIcon";
import { CategoryIcon } from "./ui/CategoryIcon";
import { AttackTypeBadge } from "./ui/AttackTypeBadge";
import { AffinityFilter } from "./ui/AffinityFilter";
import { CategoryFilter } from "./ui/CategoryFilter";
import { KillerFilter } from "./ui/KillerFilter";
import { AttackTypeFilter } from "./ui/AttackTypeFilter";
import { Pagination as PaginationComponent } from "./ui/Pagination";
import CustomLink from "./ui/CustomLink";
import { CharactersKillers, CharactersCategories, CharactersAffinities } from "../utils/chractersData";
import { CustomSelect } from "./ui/CustomSelect";
import { useTranslation } from "react-i18next";
import { PageLoader } from "./ui/PageLoader";

export const CharactersTable = () => {
  const [searchParams, setSearchParams] = useNextSearchParams();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [selectedAffinity, setSelectedAffinity] = useState(searchParams.get('affinity') || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "");
  const [selectedKiller, setSelectedKiller] = useState(searchParams.get('killer') || "");
  const [selectedAttackType, setSelectedAttackType] = useState(searchParams.get('attack_type') || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit') || '20'));

  const affinities = CharactersAffinities;
  const categories = CharactersCategories;
  const killers = CharactersKillers;

  const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL;
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const borderColor = isDark ? 'whiteAlpha.100' : 'gray.200';

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, selectedAffinity, selectedCategory, selectedKiller, selectedAttackType, itemsPerPage]);

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
    if (itemsPerPage !== 20) params.set('limit', itemsPerPage.toString());
    if (currentPage !== 1) params.set('page', currentPage.toString());
    setSearchParams(params);
  }, [debouncedSearch, selectedAffinity, selectedCategory, selectedKiller, selectedAttackType, itemsPerPage, currentPage]);

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

  return (
    <VStack spacing={5} align="stretch" w="100%">

      {/* ── Filtres ── */}
      <Box
        bg={isDark ? 'rgba(255,255,255,0.03)' : 'white'}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        p={5}
      >
        <VStack spacing={4} align="stretch">
          {/* Recherche */}
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color={isDark ? 'gray.500' : 'gray.400'} />
            </InputLeftElement>
            <Input
              placeholder={t("components.charactersTable.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={isDark ? 'rgba(255,255,255,0.04)' : 'gray.50'}
              borderColor={borderColor}
              _hover={{ borderColor: isDark ? 'whiteAlpha.300' : 'gray.300' }}
              _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
              borderRadius="lg"
            />
          </InputGroup>

          {/* Filtres avancés */}
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={3}>
            <Box>
              <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color={isDark ? 'gray.500' : 'gray.400'} mb={1.5}>
                {t("components.charactersTable.filterAffinity")}
              </Text>
              <AffinityFilter
                selectedAffinity={selectedAffinity}
                affinities={affinities}
                onAffinityChange={setSelectedAffinity}
                variant="ghost"
              />
            </Box>
            <Box>
              <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color={isDark ? 'gray.500' : 'gray.400'} mb={1.5}>
                {t("components.charactersTable.filterCategory")}
              </Text>
              <CategoryFilter
                selectedCategory={selectedCategory}
                categories={categories}
                onCategoryChange={setSelectedCategory}
                variant="ghost"
              />
            </Box>
            <Box>
              <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color={isDark ? 'gray.500' : 'gray.400'} mb={1.5}>
                {t("components.charactersTable.filterKiller")}
              </Text>
              <KillerFilter
                selectedKiller={selectedKiller}
                killers={killers}
                onKillerChange={setSelectedKiller}
                variant="ghost"
              />
            </Box>
            <Box>
              <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color={isDark ? 'gray.500' : 'gray.400'} mb={1.5}>
                {t("components.charactersTable.filterType")}
              </Text>
              <AttackTypeFilter
                selectedAttackType={selectedAttackType}
                onAttackTypeChange={setSelectedAttackType}
                variant="ghost"
              />
            </Box>
            <Box>
              <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color={isDark ? 'gray.500' : 'gray.400'} mb={1.5}>
                {t("components.charactersTable.perPage")}
              </Text>
              <CustomSelect
                value={String(itemsPerPage)}
                onChange={(val) => setItemsPerPage(Number(val))}
                options={[
                  { value: "10", label: "10 / page" },
                  { value: "20", label: "20 / page" },
                  { value: "50", label: "50 / page" },
                  { value: "100", label: "100 / page" },
                ]}
                allowDeselect={false}
                variant="ghost"
              />
            </Box>
          </SimpleGrid>

          {/* Barre d'actions + filtres actifs */}
          {(searchTerm || selectedAffinity || selectedCategory || selectedKiller || selectedAttackType) && (
            <Flex align="center" justify="space-between" flexWrap="wrap" gap={3}
              pt={3} borderTopWidth="1px" borderTopColor={borderColor}
            >
              <HStack spacing={2} flexWrap="wrap">
                <Text fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest"
                  color={isDark ? 'purple.400' : 'purple.600'}>
                  {t("components.charactersTable.activeFilters")}
                </Text>
                {searchTerm && (
                  <Badge colorScheme="blue" variant={isDark ? 'solid' : 'subtle'} borderRadius="md">
                    {t("components.charactersTable.filterSearch")}: {searchTerm}
                  </Badge>
                )}
                {selectedAffinity && (
                  <HStack spacing={1}>
                    <AffinityIcon affinity={selectedAffinity} size="16px" />
                    <Badge colorScheme="green" variant={isDark ? 'solid' : 'subtle'} borderRadius="md">
                      {selectedAffinity}
                    </Badge>
                  </HStack>
                )}
                {selectedCategory && (
                  <HStack spacing={1}>
                    <CategoryIcon category={selectedCategory} size="16px" />
                    <Badge colorScheme="purple" variant={isDark ? 'solid' : 'subtle'} borderRadius="md">
                      {selectedCategory}
                    </Badge>
                  </HStack>
                )}
                {selectedKiller && (
                  <HStack spacing={1}>
                    <KillerIcon killer={selectedKiller} size="16px" />
                    <Badge colorScheme="orange" variant={isDark ? 'solid' : 'subtle'} borderRadius="md">
                      {selectedKiller}
                    </Badge>
                  </HStack>
                )}
                {selectedAttackType && (
                  <HStack spacing={1}>
                    <AttackTypeBadge attackType={selectedAttackType} size="14px" />
                    <Badge colorScheme="cyan" variant={isDark ? 'solid' : 'subtle'} borderRadius="md">
                      {selectedAttackType === 'R'
                        ? t("components.charactersTable.attackRed")
                        : t("components.charactersTable.attackBlue")}
                    </Badge>
                  </HStack>
                )}
              </HStack>
              <Button size="sm" colorScheme="red" variant="ghost" onClick={resetFilters} borderRadius="lg">
                Reset
              </Button>
            </Flex>
          )}
        </VStack>
      </Box>

      {/* ── Infos résultats ── */}
      {pagination && (
        <Flex justify="space-between" align="center" px={1}>
          <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
            <Text as="span" fontWeight="semibold" color={isDark ? 'purple.300' : 'purple.600'}>
              {pagination.totalCount}
            </Text>{' '}
            {t("components.charactersTable.paginationCharacters")}
          </Text>
          <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'}>
            {t("components.charactersTable.paginationPage")} {pagination.currentPage} {t("components.charactersTable.paginationOf")} {pagination.totalPages}
          </Text>
        </Flex>
      )}

      {/* ── Tableau ── */}
      <Box
        bg={isDark ? 'gray.800' : 'white'}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        {isLoading ? (
          <PageLoader label={t("components.charactersTable.loading")} color="purple.500" height="250px" />
        ) : characters.length === 0 ? (
          <Flex justify="center" align="center" py={16} direction="column" gap={3}>
            <Text fontSize="3xl">⚔️</Text>
            <Text fontWeight="semibold" color={isDark ? 'gray.300' : 'gray.600'}>
              {t("components.charactersTable.noResults")}
            </Text>
            <Text fontSize="sm" color={isDark ? 'gray.500' : 'gray.400'}>
              {t("components.charactersTable.noResultsHint")}
            </Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg={isDark ? 'rgba(255,255,255,0.04)' : 'gray.50'}>
                  <Th fontSize="2xs" letterSpacing="widest" color={isDark ? 'gray.400' : 'gray.500'} py={3}>
                    {t("components.charactersTable.colCharacter")}
                  </Th>
                  <Th fontSize="2xs" letterSpacing="widest" color={isDark ? 'gray.400' : 'gray.500'} py={3}>
                    {t("components.charactersTable.colAffinity")}
                  </Th>
                  <Th fontSize="2xs" letterSpacing="widest" color={isDark ? 'gray.400' : 'gray.500'} py={3}>
                    {t("components.charactersTable.colCategories")}
                  </Th>
                  <Th fontSize="2xs" letterSpacing="widest" color={isDark ? 'gray.400' : 'gray.500'} py={3}>
                    {t("components.charactersTable.colKillers")}
                  </Th>
                  <Th fontSize="2xs" letterSpacing="widest" color={isDark ? 'gray.400' : 'gray.500'} py={3}>
                    {t("components.charactersTable.colAttackType")}
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {characters.map((character) => (
                  <Tr
                    key={character._id}
                    borderLeftWidth="2px"
                    borderLeftColor="transparent"
                    transition="all 0.15s ease"
                    _hover={{
                      bg: isDark ? 'rgba(124,58,237,0.07)' : 'purple.50',
                      borderLeftColor: 'purple.400',
                    }}
                  >
                    {/* Personnage */}
                    <Td py={3} minW="200px">
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          src={character._id ? `${bucketUrl}/characters/thumb/${character._id}.png` : undefined}
                          name={character.name}
                          borderRadius="md"
                          bg={isDark ? 'gray.700' : 'gray.200'}
                        />
                        <CustomLink to={`/personnage/${character._id}`} text={character.name} />
                      </HStack>
                    </Td>

                    {/* Affinité */}
                    <Td py={3}>
                      {character.affinity && (
                        <Tooltip label={character.affinity} hasArrow placement="top">
                          <Box display="inline-block">
                            <AffinityIcon affinity={character.affinity} size="22px" showLabel={false} />
                          </Box>
                        </Tooltip>
                      )}
                    </Td>

                    {/* Catégories */}
                    <Td py={3} minW="120px">
                      {character.categories && character.categories.length > 0 && (
                        <Flex gap={1.5} flexWrap="wrap" maxW="160px">
                          {character.categories.slice(0, 4).map((category, index) => (
                            <Tooltip key={index} label={category} hasArrow placement="top">
                              <Box>
                                <CategoryIcon category={category} size="20px" showLabel={false} />
                              </Box>
                            </Tooltip>
                          ))}
                          {character.categories.length > 4 && (
                            <Text fontSize="2xs" color={isDark ? 'gray.400' : 'gray.500'} alignSelf="center">
                              +{character.categories.length - 4}
                            </Text>
                          )}
                        </Flex>
                      )}
                    </Td>

                    {/* Killers */}
                    <Td py={3} minW="120px">
                      {character.killers && character.killers.length > 0 && (
                        <Flex gap={1.5} flexWrap="wrap" maxW="160px">
                          {character.killers.slice(0, 4).map((killer, index) => (
                            <Tooltip key={index} label={killer} hasArrow placement="top">
                              <Box>
                                <KillerIcon killer={killer} size="20px" showLabel={false} />
                              </Box>
                            </Tooltip>
                          ))}
                          {character.killers.length > 4 && (
                            <Text fontSize="2xs" color={isDark ? 'gray.400' : 'gray.500'} alignSelf="center">
                              +{character.killers.length - 4}
                            </Text>
                          )}
                        </Flex>
                      )}
                    </Td>

                    {/* Type d'attaque */}
                    <Td py={3}>
                      <AttackTypeBadge attackType={character.attack_type} size="18px" />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* Pagination */}
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
}