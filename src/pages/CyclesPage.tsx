import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Badge,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  HStack,
  Button,
  Select
} from "@chakra-ui/react";
import { ExternalLinkIcon, CalendarIcon, ViewIcon } from "@chakra-ui/icons";
import type { Cycle, CyclesResponse, Pagination } from "../interfaces";
import { handleAttackType } from "../utils/attackTypes";
import { AlterationImage } from "../components/ui/AlterationImage";
import { AttackTypeBadge } from "../components/ui/AttackTypeBadge";
import { Pagination as PaginationComponent } from "../components/ui/Pagination";

const CyclesPage = () => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Bon nombre pour la grille
  const [isLoading, setIsLoading] = useState(true);
  
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const loadCycles = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/cycles?page=${page}&limit=${itemsPerPage}`);
      if (response.ok) {
        const data: CyclesResponse = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setCycles(data.data);
          if (data.pagination) {
            setPagination(data.pagination);
            setCurrentPage(data.pagination.currentPage);
          }
        } else {
          console.error("Format de données inattendu:", data);
          setCycles([]);
          setPagination(null);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des cycles:", error);
      setCycles([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCycles(currentPage);
  }, []);

  const handlePageChange = (page: number) => {
    loadCycles(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    // Recharger avec la nouvelle limite
    const loadWithNewLimit = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/cycles?page=1&limit=${newItemsPerPage}`);
        if (response.ok) {
          const data: CyclesResponse = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setCycles(data.data);
            if (data.pagination) {
              setPagination(data.pagination);
              setCurrentPage(data.pagination.currentPage);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des cycles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadWithNewLimit();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* En-tête avec gradient */}
        <Box 
          textAlign="center" 
          py={12}
          px={8}
          bgGradient="linear(to-r, blue.400, purple.500)"
          borderRadius="xl"
          color="white"
        >
          <Heading size="2xl" mb={4}>Cycles de Rotation</Heading>
          <Text fontSize="lg" opacity={0.9}>
            Découvrez tous les cycles de rotation disponibles
          </Text>
        </Box>

        {/* Stats et boutons */}
        <Flex justify="space-between" align="center" bg={cardBg} p={6} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              {isLoading ? "..." : (pagination?.totalCount ?? cycles.length)}
            </Text>
            <Text fontSize="sm" color="gray.500">
              cycle{(pagination?.totalCount ?? cycles.length) > 1 ? 's' : ''} disponible{(pagination?.totalCount ?? cycles.length) > 1 ? 's' : ''}
            </Text>
          </VStack>
          <HStack spacing={4}>
            <Select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
              w="auto"
              size="md"
            >
              <option value={3}>3 par page</option>
              <option value={6}>6 par page</option>
              <option value={9}>9 par page</option>
              <option value={12}>12 par page</option>
            </Select>
            <Button
              leftIcon={<ViewIcon />}
              size="md"
              colorScheme="blue"
              variant="outline"
              onClick={() => loadCycles(currentPage)}
              isLoading={isLoading}
              loadingText="Actualisation..."
            >
              Actualiser
            </Button>
          </HStack>
        </Flex>

        {isLoading ? (
          <Flex justify="center" p={16}>
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text color="gray.500">Chargement des cycles...</Text>
            </VStack>
          </Flex>
        ) : !Array.isArray(cycles) || cycles.length === 0 ? (
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            {!Array.isArray(cycles) ? "Erreur lors du chargement des cycles." : "Aucun cycle disponible pour le moment."}
          </Alert>
        ) : (
          <VStack spacing={8}>
            <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={8}>
              {cycles.map((cycle) => (
              <Card
                key={cycle._id}
                bg={cardBg}
                borderColor={borderColor}
                borderWidth={1}
                _hover={{ 
                  transform: 'translateY(-4px)', 
                  shadow: 'xl',
                  borderColor: 'blue.300'
                }}
                transition="all 0.3s ease"
                borderRadius="xl"
                overflow="hidden"
              >
                <CardBody p={0}>
                  {/* En-tête de la carte */}
                  <Box bg="blue.50" _dark={{ bg: "blue.900" }} p={6} pb={4}>
                    <HStack justify="space-between" align="start" mb={3}>
                      <Heading 
                        as={Link}
                        to={`/cycle/${cycle._id}`}
                        size="lg" 
                        flex={1}
                        color="black.600"
                        _dark={{ color: "white" }}
                        _hover={{ color: "black", _dark: { color: "white" } }}
                        textDecoration="none"
                        transition="color 0.2s"
                      >
                        {cycle.name}
                      </Heading>
                      <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                        {cycle.rotations?.length || 0} rotations
                      </Badge>
                    </HStack>

                    {/* Dates */}
                    {cycle.rotations && cycle.rotations[0]?.start_date && (
                      <HStack spacing={6} fontSize="sm">
                        <HStack spacing={2}>
                          <CalendarIcon color="green.500" />
                          <Text color="gray.600" _dark={{ color: "gray.300" }}>
                            <Text as="span" fontWeight="medium">Début:</Text> {cycle.rotations[0].start_date}
                          </Text>
                        </HStack>
                        {cycle.rotations[cycle.rotations.length - 1]?.end_date && (
                          <HStack spacing={2}>
                            <CalendarIcon color="red.500" />
                            <Text color="gray.600" _dark={{ color: "gray.300" }}>
                              <Text as="span" fontWeight="medium">Fin:</Text> {cycle.rotations[cycle.rotations.length - 1].end_date}
                            </Text>
                          </HStack>
                        )}
                      </HStack>
                    )}
                  </Box>

                  {/* Contenu principal */}
                  <Box p={6}>
                    {cycle.rotations && cycle.rotations.length > 0 && (
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="md" fontWeight="semibold" color="gray.700" _dark={{ color: "gray.200" }}>
                            Aperçu des rotations
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {cycle.rotations.length > 5 ? "Top 5" : "Toutes"}
                          </Text>
                        </HStack>
                        
                        <VStack spacing={3} align="stretch">
                          {cycle.rotations.slice(0, 5).map((rotation, index) => (
                            <Box 
                              key={index} 
                              p={3} 
                              bg="gray.50" 
                              _dark={{ bg: "gray.800", borderColor: "gray.700" }} 
                              borderRadius="md"
                              border="1px solid"
                              borderColor="gray.200"
                            >
                              <HStack justify="space-between" spacing={3}>
                                <HStack spacing={3} flex={1}>
                                  <Text 
                                    fontWeight="bold" 
                                    fontSize="sm" 
                                    color="blue.600"
                                    _dark={{ color: "blue.300" }}
                                    minW="30px"
                                  >
                                    #{index + 1}
                                  </Text>
                                  <VStack spacing={1} align="start" flex={1}>
                                    <Text fontWeight="medium" fontSize="sm">
                                      {rotation.killer}
                                    </Text>
                                    <HStack spacing={2}>
                                      <AttackTypeBadge 
                                        attackType={rotation.attack} 
                                        size="12px" 
                                      />
                                      <Text fontSize="xs" color="gray.500">
                                        {handleAttackType(rotation)}
                                      </Text>
                                      <AlterationImage 
                                        alteration={rotation.alteration} 
                                        size="14px" 
                                      />
                                    </HStack>
                                  </VStack>
                                </HStack>
                                <Badge 
                                  size="sm" 
                                  colorScheme="purple" 
                                  fontSize="xs"
                                  px={2}
                                  py={1}
                                  borderRadius="md"
                                >
                                  {rotation.period}
                                </Badge>
                              </HStack>
                            </Box>
                          ))}
                          
                          {cycle.rotations.length > 5 && (
                            <Box textAlign="center" py={2}>
                              <Text fontSize="sm" color="blue.500" fontWeight="medium">
                                ... et {cycle.rotations.length - 5} autres rotations
                              </Text>
                            </Box>
                          )}
                        </VStack>

                        {/* Bouton voir plus */}
                        <Button
                          as={Link}
                          to={`/cycle/${cycle._id}`}
                          rightIcon={<ExternalLinkIcon />}
                          colorScheme="blue"
                          variant="outline"
                          size="sm"
                          mt={4}
                          _hover={{ transform: 'translateY(-1px)' }}
                        >
                          Voir le détail complet
                        </Button>
                      </VStack>
                    )}
                  </Box>
                </CardBody>
              </Card>
            ))}
            </SimpleGrid>
            
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
        )}
      </VStack>
    </Container>
  );
}

export default CyclesPage;