import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Button, HStack, VStack,
  Text, Input, InputGroup, InputLeftElement, Select, Spinner,
  useColorModeValue, Badge, Flex, Avatar
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";
import type { ICharacter, IPagination as PaginationType, ICharactersResponse } from "../interfaces";
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

interface CharactersTableProps {
  apiUrl: string;
}

export function CharactersTable({ apiUrl }: CharactersTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // États - Initialiser avec les paramètres URL
  const [characters, setCharacters] = useState<ICharacter[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [selectedAffinity, setSelectedAffinity] = useState(searchParams.get('affinity') || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "");
  const [selectedKiller, setSelectedKiller] = useState(searchParams.get('killer') || "");
  const [selectedAttackType, setSelectedAttackType] = useState(searchParams.get('attack_type') || "");
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit') || '20'));
  const [isLoading, setIsLoading] = useState(false);
  const [affinities, setAffinities] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [killers, setKillers] = useState<string[]>([]);

  // Hooks UI
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const badgeVariant = useColorModeValue('subtle', 'solid');
  const filterBg = useColorModeValue('blue.50', 'blue.900');

  // Fonction pour mettre à jour l'URL avec les filtres actuels
  const updateURLParams = (search = "", affinity = "", category = "", killer = "", attackType = "", limit = itemsPerPage, page = 1) => {
    const params = new URLSearchParams();
    
    if (search.trim()) params.set('search', search.trim());
    if (affinity) params.set('affinity', affinity);
    if (category) params.set('category', category);
    if (killer) params.set('killer', killer);
    if (attackType) params.set('attack_type', attackType);
    if (limit !== 20) params.set('limit', limit.toString());
    if (page !== 1) params.set('page', page.toString());
    
    setSearchParams(params);
  };

  // Fonction principale pour charger les personnages
  const loadCharacters = async (page = 1, search = "", affinity = "", category = "", killer = "", attackType = "") => {
    setIsLoading(true);
    try {
      // Construction de l'URL avec tous les paramètres
      let url = `${apiUrl}/api/characters?page=${page}&limit=${itemsPerPage}`;
      
      // Ajout des paramètres de filtrage s'ils sont présents
      if (search && search.trim() !== "") {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      if (affinity && affinity.trim() !== "") {
        url += `&affinity=${encodeURIComponent(affinity.trim())}`;
      }
      if (category && category.trim() !== "") {
        url += `&category=${encodeURIComponent(category.trim())}`;
      }
      if (killer && killer.trim() !== "") {
        url += `&killer=${encodeURIComponent(killer.trim())}`;
      }
      if (attackType && attackType.trim() !== "") {
        url += `&attack_type=${encodeURIComponent(attackType.trim())}`;
      }

      const response = await fetch(url);

      
      if (response.ok) {
        const data: ICharactersResponse = await response.json();
        setCharacters(data.data);
        setPagination(data.pagination);
      } else {
        setCharacters([]);
        setPagination(null);
      }
    } catch (error) {
      setCharacters([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour charger les affinités disponibles
  const loadAffinities = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/characters`);
      if (response.ok) {
        const data = await response.json();
        // Extraire les affinités uniques depuis la première page - utiliser 'data' au lieu de 'characters'
        const uniqueAffinities = [...new Set(
          data.data?.map((char: ICharacter) => char.affinity)
            .filter((affinity: string) => affinity && affinity.trim()) || []
        )].sort() as string[];
        setAffinities(uniqueAffinities);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des affinités:', error);
    }
  };

  // Fonction pour charger les catégories disponibles - Charge TOUTES les pages
  const loadCategories = async () => {
    try {
      // Charger tous les personnages sans pagination pour avoir toutes les catégories
      const response = await fetch(`${apiUrl}/api/characters?limit=10000`);
      if (response.ok) {
        const data = await response.json();
        // Extraire toutes les catégories uniques
        const allCategories = data.data?.flatMap((char: ICharacter) => {
          return char.categories || [];
        }) || [];
        const uniqueCategories = [...new Set(allCategories)]
          .filter((category: any) => category && typeof category === 'string' && category.trim())
          .sort() as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  // Fonction pour charger les tueurs disponibles - Charge TOUTES les pages
  const loadKillers = async () => {
    try {
      // Charger tous les personnages sans pagination pour avoir tous les tueurs
      const response = await fetch(`${apiUrl}/api/characters?limit=10000`); // Limite élevée pour tout récupérer
      if (response.ok) {
        const data: ICharactersResponse = await response.json();
        // Extraire tous les tueurs uniques
        const allKillers = data.data?.flatMap((char: ICharacter) => {
          return char.killers || [];
        }) || [];
        
        const filteredKillers = [...new Set(allKillers)]
          .filter((killer: any) => killer && typeof killer === 'string' && killer.trim()) as string[];
        
        const uniqueKillers = filteredKillers.sort((a, b) => {
          // Tri personnalisé pour que "Aucun" vienne avant "Aucun +"
          if (a === "Aucun" && b === "Aucun +") return -1;
          if (a === "Aucun +" && b === "Aucun") return 1;
          return a.localeCompare(b);
        });
        setKillers(uniqueKillers);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tueurs:', error);
    }
  };

  // Effet pour charger les données initiales
  useEffect(() => {
    // Charger avec les paramètres de l'URL au montage
    const currentPage = parseInt(searchParams.get('page') || '1');
    loadCharacters(currentPage, searchTerm, selectedAffinity, selectedCategory, selectedKiller, selectedAttackType);
    loadAffinities();
    loadCategories();
    loadKillers();
  }, [apiUrl]);

  // Fonction de recherche avec debounce et mise à jour URL
  useEffect(() => {
    // Ne déclencher que si au moins un filtre a une vraie valeur OU si on est au montage avec des paramètres URL
    const hasFilters = searchTerm.trim() || selectedAffinity || selectedCategory || selectedKiller || selectedAttackType;
    const hasURLParams = searchParams.has('search') || searchParams.has('affinity') || searchParams.has('category') || searchParams.has('killer') || searchParams.has('attack_type');
    
    if (hasFilters || hasURLParams) {
      const timeoutId = setTimeout(() => {
        updateURLParams(searchTerm, selectedAffinity, selectedCategory, selectedKiller, selectedAttackType, itemsPerPage);
        loadCharacters(1, searchTerm, selectedAffinity, selectedCategory, selectedKiller, selectedAttackType);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, selectedAffinity, selectedCategory, selectedKiller, selectedAttackType, itemsPerPage]);

    // Gestion du changement de page
  const handlePageChange = (page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages) {
      updateURLParams(searchTerm, selectedAffinity, selectedCategory, selectedKiller, selectedAttackType, itemsPerPage, page);
      loadCharacters(page, searchTerm, selectedAffinity, selectedCategory, selectedKiller, selectedAttackType);
    }
  };

  // Fonction pour reset tous les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedAffinity("");
    setSelectedCategory("");
    setSelectedKiller("");
    setSelectedAttackType("");
    setSearchParams({}); 
    loadCharacters(1);
  };

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* Contrôles de filtrage */}
      <VStack spacing={4} align="stretch">
        {/* Première ligne - Recherche */}
        <Flex justify="center">
          <InputGroup maxW="500px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Rechercher un personnage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Flex>

        {/* Deuxième ligne - Filtres */}
        <Flex direction={{ base: "column", md: "row" }} gap={3} align="center" justify="center" flexWrap="wrap">
          {/* Filtre par affinité */}
          <AffinityFilter
            selectedAffinity={selectedAffinity}
            affinities={affinities}
            onAffinityChange={setSelectedAffinity}
          />

          {/* Filtre par catégorie */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            categories={categories}
            onCategoryChange={setSelectedCategory}
          />

          {/* Filtre par tueur */}
          <KillerFilter
            selectedKiller={selectedKiller}
            killers={killers}
            onKillerChange={setSelectedKiller}
          />

          {/* Filtre par type d'attaque */}
          <AttackTypeFilter
            selectedAttackType={selectedAttackType}
            onAttackTypeChange={setSelectedAttackType}
          />

          {/* Items par page */}
          <Select
            maxW="120px"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </Select>

          {/* Bouton reset */}
          {(searchTerm || selectedAffinity || selectedCategory || selectedKiller || selectedAttackType) && (
            <Button
              size="md"
              colorScheme="red"
              variant="outline"
              onClick={resetFilters}
            >
              Reset
            </Button>
          )}
        </Flex>
      </VStack>

      {/* Affichage des filtres actifs */}
      {(searchTerm || selectedAffinity || selectedCategory || selectedKiller || selectedAttackType) && (
        <Box p={3} bg={filterBg} borderRadius="md">
          <Text fontSize="sm" fontWeight="semibold" mb={2}>Filtres actifs :</Text>
          <HStack spacing={2} flexWrap="wrap">
            {searchTerm && (
              <Badge colorScheme="blue" variant={badgeVariant}>
                Recherche: {searchTerm}
              </Badge>
            )}
            {selectedAffinity && (
              <HStack spacing={1}>
                <AffinityIcon affinity={selectedAffinity} size="20px" />
                <Badge colorScheme="green" variant={badgeVariant}>
                  Affinité: {selectedAffinity}
                </Badge>
              </HStack>
            )}
            {selectedCategory && (
              <HStack spacing={1}>
                <CategoryIcon category={selectedCategory} size="20px" />
                <Badge colorScheme="purple" variant={badgeVariant}>
                  Catégorie: {selectedCategory}
                </Badge>
              </HStack>
            )}
            {selectedKiller && (
              <HStack spacing={1}>
                <KillerIcon killer={selectedKiller} size="20px" />
                <Badge colorScheme="orange" variant={badgeVariant}>
                  Tueur: {selectedKiller}
                </Badge>
              </HStack>
            )}
            {selectedAttackType && (
              <HStack spacing={1}>
                <AttackTypeBadge attackType={selectedAttackType} size="16px" />
                <Badge colorScheme="cyan" variant={badgeVariant}>
                  Type: {selectedAttackType === 'R' ? 'Rouge' : 'Bleu'}
                </Badge>
              </HStack>
            )}
          </HStack>
        </Box>
      )}

      {/* Informations sur les résultats */}
      {pagination && (
        <Text fontSize="sm" color="gray.600">
          {pagination.totalCount} personnage(s) trouvé(s) - 
          Page {pagination.currentPage} sur {pagination.totalPages} - 
          Affichage de {pagination.itemsOnPage} résultat(s)
        </Text>
      )}

      {/* Tableau des personnages */}
      <Box overflowX="auto" bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
        {isLoading ? (
          <Flex justify="center" p={8}>
            <Spinner size="lg" />
          </Flex>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Personnage</Th>
                <Th>Affinité</Th>
                <Th>Catégories</Th>
                <Th>Tueurs</Th>
                <Th>Type d'attaque</Th>
              </Tr>
            </Thead>
            <Tbody>
              {characters.map((character) => (
                <Tr key={character._id} _hover={{ bg: hoverBg }}>
                  <Td>
                    <HStack spacing={3}>
                      {character.link ? (
                        <Avatar
                          size="sm"
                          src={character.link}
                          name={character.name}
                        />
                      ) : (
                        <Box
                          w="32px"
                          h="32px"
                          bg="gray.200"
                          _dark={{ bg: "gray.600", color: "gray.400" }}
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="xs"
                          color="gray.500"
                        >
                          ?
                        </Box>
                      )}
                      <CustomLink to={`/personnage/${character._id}`} text={character.name} />
                    </HStack>
                  </Td>
                  <Td>
                    {character.affinity && (
                      <AffinityIcon 
                        affinity={character.affinity} 
                        size="20px" 
                        showLabel={true} 
                      />
                    )}
                  </Td>
                  <Td>
                    {character.categories && character.categories.length > 0 && (
                      <VStack spacing={1} align="start">
                        {character.categories.slice(0, 3).map((category, index) => (
                          <CategoryIcon 
                            key={index} 
                            category={category} 
                            size="20px"
                            showLabel={true}
                          />
                        ))}
                        {character.categories.length > 3 && (
                          <Text fontSize="xs" color="gray.500">
                            +{character.categories.length - 3}
                          </Text>
                        )}
                      </VStack>
                    )}
                  </Td>
                  <Td>
                    {character.killers && character.killers.length > 0 && (
                      <VStack spacing={1} align="start">
                        {character.killers.slice(0, 3).map((killer, index) => (
                          <KillerIcon 
                            key={index} 
                            killer={killer} 
                            size="24px"
                            showLabel={true}
                          />
                        ))}
                        {character.killers.length > 3 && (
                          <Text fontSize="xs" color="gray.500">
                            +{character.killers.length - 3}
                          </Text>
                        )}
                      </VStack>
                    )}
                  </Td>
                  <Td>
                    <AttackTypeBadge attackType={character.attack_type} size="20px" />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
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

      {/* Message si aucun résultat */}
      {!isLoading && characters.length === 0 && (
        <Text textAlign="center" color="gray.500" py={8}>
          Aucun personnage trouvé
        </Text>
      )}
    </VStack>
  );
}