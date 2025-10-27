import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Button, HStack, VStack,
  Text, Input, InputGroup, InputLeftElement, Select, Spinner,
  useColorModeValue, Badge, Flex, Avatar
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";
import type { Character, Pagination, CharactersResponse } from "../interfaces";

interface CharactersTableProps {
  apiUrl: string;
}

export function CharactersTable({ apiUrl }: CharactersTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // États - Initialiser avec les paramètres URL
  const [characters, setCharacters] = useState<Character[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [selectedAffinity, setSelectedAffinity] = useState(searchParams.get('affinity') || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "");
  const [selectedKiller, setSelectedKiller] = useState(searchParams.get('killer') || "");
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
  const updateURLParams = (search = "", affinity = "", category = "", killer = "", limit = itemsPerPage, page = 1) => {
    const params = new URLSearchParams();
    
    if (search.trim()) params.set('search', search.trim());
    if (affinity) params.set('affinity', affinity);
    if (category) params.set('category', category);
    if (killer) params.set('killer', killer);
    if (limit !== 20) params.set('limit', limit.toString());
    if (page !== 1) params.set('page', page.toString());
    
    setSearchParams(params);
  };

  // Fonction pour obtenir la couleur d'une affinité
  const getAffinityColor = (affinity: string): string => {
    const affinityLower = affinity.toLowerCase();
    switch (affinityLower) {
      case 'instinct':
        return 'purple';
      case 'connaissance':
        return 'orange';
      case 'technique':
        return 'green';
      case 'vitesse':
        return 'cyan'; // Plus vif que blue en mode sombre
      case 'force':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Fonction principale pour charger les personnages
  const loadCharacters = async (page = 1, search = "", affinity = "", category = "", killer = "") => {
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

      const response = await fetch(url);

      
      if (response.ok) {
        const data: CharactersResponse = await response.json();
        setCharacters(data.characters);
        setPagination(data.pagination);
      } else {
        console.error('Erreur lors du chargement des personnages:', response.status);
        setCharacters([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des personnages:', error);
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
        // Extraire les affinités uniques depuis la première page
        const uniqueAffinities = [...new Set(
          data.characters?.map((char: Character) => char.affinity)
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
        const allCategories = data.characters?.flatMap((char: Character) => {
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
        const data = await response.json();
        // Extraire tous les tueurs uniques
        const allKillers = data.characters?.flatMap((char: Character) => {
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
    loadCharacters(currentPage, searchTerm, selectedAffinity, selectedCategory, selectedKiller);
    loadAffinities();
    loadCategories();
    loadKillers();
  }, [apiUrl]);

  // Fonction de recherche avec debounce et mise à jour URL
  useEffect(() => {
    // Ne déclencher que si au moins un filtre a une vraie valeur OU si on est au montage avec des paramètres URL
    const hasFilters = searchTerm.trim() || selectedAffinity || selectedCategory || selectedKiller;
    const hasURLParams = searchParams.has('search') || searchParams.has('affinity') || searchParams.has('category') || searchParams.has('killer');
    
    if (hasFilters || hasURLParams) {
      const timeoutId = setTimeout(() => {
        updateURLParams(searchTerm, selectedAffinity, selectedCategory, selectedKiller, itemsPerPage);
        loadCharacters(1, searchTerm, selectedAffinity, selectedCategory, selectedKiller);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, selectedAffinity, selectedCategory, selectedKiller, itemsPerPage]);

    // Gestion du changement de page
  const handlePageChange = (page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages) {
      updateURLParams(searchTerm, selectedAffinity, selectedCategory, selectedKiller, itemsPerPage, page);
      loadCharacters(page, searchTerm, selectedAffinity, selectedCategory, selectedKiller);
    }
  };

  // Fonction pour reset tous les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedAffinity("");
    setSelectedCategory("");
    setSelectedKiller("");
    setSearchParams({}); 
    loadCharacters(1);
  };

  // Génération des boutons de pagination
  const renderPaginationButtons = () => {
    if (!pagination) return null;

    const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination;
    const buttons = [];

    // Bouton précédent
    buttons.push(
      <Button
        key="prev"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        isDisabled={!hasPrevPage}
      >
        ← Précédent
      </Button>
    );

    // Calcul des pages à afficher
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Ajuster si on est près du début ou de la fin
    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    }
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }

    // Première page si pas visible
    if (startPage > 1) {
      buttons.push(
        <Button key={1} size="sm" variant={1 === currentPage ? "solid" : "outline"} onClick={() => handlePageChange(1)}>
          1
        </Button>
      );
      if (startPage > 2) {
        buttons.push(<Text key="ellipsis1">...</Text>);
      }
    }

    // Pages du milieu
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <Button
          key={page}
          size="sm"
          variant={page === currentPage ? "solid" : "outline"}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Button>
      );
    }

    // Dernière page si pas visible
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<Text key="ellipsis2">...</Text>);
      }
      buttons.push(
        <Button
          key={totalPages}
          size="sm"
          variant={totalPages === currentPage ? "solid" : "outline"}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    // Bouton suivant
    buttons.push(
      <Button
        key="next"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        isDisabled={!hasNextPage}
      >
        Suivant →
      </Button>
    );

    return buttons;
  };

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* Contrôles de filtrage */}
      <Flex direction={{ base: "column", md: "row" }} gap={4} align="center">
        {/* Recherche */}
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Rechercher un personnage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        {/* Filtre par affinité */}
        <Select
          maxW="200px"
          value={selectedAffinity}
          onChange={(e) => setSelectedAffinity(e.target.value)}
        >
          <option value="">Toutes les affinités</option>
          {affinities.map(affinity => (
            <option key={affinity} value={affinity}>{affinity}</option>
          ))}
        </Select>

        {/* Filtre par catégorie */}
        <Select
          maxW="200px"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Toutes les catégories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </Select>

        {/* Filtre par tueur */}
        <Select
          maxW="200px"
          value={selectedKiller}
          onChange={(e) => setSelectedKiller(e.target.value)}
        >
          <option value="">Tous les tueurs</option>
          {killers.map(killer => (
            <option key={killer} value={killer}>{killer}</option>
          ))}
        </Select>

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
        {(searchTerm || selectedAffinity || selectedCategory || selectedKiller) && (
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

      {/* Affichage des filtres actifs */}
      {(searchTerm || selectedAffinity || selectedCategory || selectedKiller) && (
        <Box p={3} bg={filterBg} borderRadius="md">
          <Text fontSize="sm" fontWeight="semibold" mb={2}>Filtres actifs :</Text>
          <HStack spacing={2} flexWrap="wrap">
            {searchTerm && (
              <Badge colorScheme="blue" variant={badgeVariant}>
                Recherche: {searchTerm}
              </Badge>
            )}
            {selectedAffinity && (
              <Badge colorScheme="green" variant={badgeVariant}>
                Affinité: {selectedAffinity}
              </Badge>
            )}
            {selectedCategory && (
              <Badge colorScheme="purple" variant={badgeVariant}>
                Catégorie: {selectedCategory}
              </Badge>
            )}
            {selectedKiller && (
              <Badge colorScheme="orange" variant={badgeVariant}>
                Tueur: {selectedKiller}
              </Badge>
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
                      <Text fontWeight="medium">{character.name}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    {character.affinity && (
                      <Badge colorScheme={getAffinityColor(character.affinity)} variant={badgeVariant}>
                        {character.affinity}
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    {character.categories && character.categories.length > 0 && (
                      <HStack spacing={1} flexWrap="wrap">
                        {character.categories.slice(0, 3).map((category, index) => (
                          <Badge key={index} size="sm" variant="outline">
                            {category}
                          </Badge>
                        ))}
                        {character.categories.length > 3 && (
                          <Text fontSize="xs" color="gray.500">
                            +{character.categories.length - 3}
                          </Text>
                        )}
                      </HStack>
                    )}
                  </Td>
                  <Td>
                    {character.killers && character.killers.length > 0 && (
                      <HStack spacing={1} flexWrap="wrap">
                        {character.killers.slice(0, 3).map((killer, index) => (
                          <Badge key={index} size="sm" variant="outline" colorScheme="red">
                            {killer}
                          </Badge>
                        ))}
                        {character.killers.length > 3 && (
                          <Text fontSize="xs" color="gray.500">
                            +{character.killers.length - 3}
                          </Text>
                        )}
                      </HStack>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <HStack justify="center" spacing={2} flexWrap="wrap">
          {renderPaginationButtons()}
        </HStack>
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