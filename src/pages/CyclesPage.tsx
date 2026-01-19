import { useState } from "react";
import React from "react";
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

import { handleAttackType } from "../utils/attackTypes";
import { AlterationImage } from "../components/ui/AlterationImage";
import { AttackTypeBadge } from "../components/ui/AttackTypeBadge";
import { Pagination as PaginationComponent } from "../components/ui/Pagination";
import { HeroSection } from "../components/HeroSection";
import { SEOHead } from "../components/SEOHead";
import { useCycles } from "@/hooks/useAPI";

const CyclesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Bon nombre pour la grille
  
  // Utiliser useSWR pour les cycles avec pagination
  const { cycles = [], pagination, isLoading, mutate: mutateCycles } = useCycles({ page: currentPage, limit: itemsPerPage });
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const cardHeaderBg = useColorModeValue(
    'linear(to-br, blue.50, purple.50)',
    'linear(to-br, blue.900, purple.900)'
  );
  const datesBg = useColorModeValue('white', 'gray.700');
  const rotationItemBg = useColorModeValue('gray.50', 'gray.800');
  const rotationItemHoverBg = useColorModeValue('blue.50', 'gray.700');
  const numberBoxBg = useColorModeValue('blue.100', 'blue.800');
  const moreRotationsBg = useColorModeValue('purple.50', 'purple.900');

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Cycles de Rotation Bleach Brave Souls",
    "description": "Cycles de rotation et événements pour Bleach Brave Souls avec détails des rotations et classements",
    "url": "https://bbs-schrift.fr/cycles",
    "numberOfItems": pagination?.totalCount || cycles.length
  };

  return (
    <>
      <SEOHead
        title="Schrift BBS - Cycles de Rotation - Bleach Brave Souls"
        description="Découvrez tous les cycles de rotation de Bleach Brave Souls. Consultez les rotations, événements et classements de guilde détaillés."
        keywords="cycles, rotation, événements, classements"
        url="https://bbs-schrift.fr/cycles"
        structuredData={structuredData}
      />
      <Box w="100%">
        <HeroSection
          title="Cycles de Rotation"
          description="Découvrez tous les cycles de rotation disponibles"
          badge={{ text: "Événements BBS", icon: "⚡" }}
          size="lg"
        />

        <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">

        {/* Stats et contrôles */}
        <Box bg={cardBg} borderRadius="xl" borderWidth={1} borderColor={borderColor} boxShadow="md" overflow="hidden">
          <Flex 
            justify="space-between" 
            align="center" 
            p={6}
            flexDir={{ base: "column", md: "row" }}
            gap={{ base: 4, md: 0 }}
          >
            <HStack spacing={8}>
              <VStack align="start" spacing={1}>
                <HStack spacing={2}>
                  <CalendarIcon boxSize={5} color="blue.500" />
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                    Total
                  </Text>
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" bgGradient="linear(to-r, blue.500, purple.500)" bgClip="text">
                  {isLoading ? "..." : (pagination?.totalCount ?? cycles.length)}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  cycle{(pagination?.totalCount ?? cycles.length) > 1 ? 's' : ''} disponible{(pagination?.totalCount ?? cycles.length) > 1 ? 's' : ''}
                </Text>
              </VStack>
              
              {pagination && (
                <VStack align="start" spacing={1}>
                  <HStack spacing={2}>
                    <ViewIcon boxSize={5} color="purple.500" />
                    <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                      Page actuelle
                    </Text>
                  </HStack>
                  <Text fontSize="3xl" fontWeight="bold" bgGradient="linear(to-r, purple.500, pink.500)" bgClip="text">
                    {pagination.itemsOnPage}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    sur cette page
                  </Text>
                </VStack>
              )}
            </HStack>

            <HStack spacing={3} flexWrap="wrap" justify={{ base: "center", md: "flex-end" }}>
              <Select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                w={{ base: "full", sm: "140px" }}
                size="md"
                borderRadius="lg"
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
                variant="solid"
                onClick={() => mutateCycles()}
                isLoading={isLoading}
                loadingText="..."
                borderRadius="lg"
                px={6}
              >
                Actualiser
              </Button>
            </HStack>
          </Flex>
        </Box>

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
            {(() => {
              // Grouper les cycles par année
              const cyclesByYear = cycles.reduce((acc, cycle) => {
                const year = cycle.year;
                if (!acc[year]) acc[year] = [];
                acc[year].push(cycle);
                return acc;
              }, {} as Record<number, typeof cycles>);

              // Trier les années par ordre décroissant
              const sortedYears = Object.keys(cyclesByYear).sort((a, b) => Number(b) - Number(a));

              return sortedYears.map((year) => (
                <React.Fragment key={year}>
                  {/* Séparateur d'année */}
                  <Box 
                    w="100%" 
                    py={4}
                    px={6}
                    bg={bgColor}
                    borderRadius="xl"
                    borderWidth={2}
                    borderColor={borderColor}
                    boxShadow="md"
                  >
                    <HStack spacing={3} justify="center">
                      <CalendarIcon boxSize={6} color="blue.500" />
                      <Heading 
                        size="lg" 
                        bgGradient="linear(to-r, blue.500, purple.500)" 
                        bgClip="text"
                        fontWeight="bold"
                      >
                        Année {year}
                      </Heading>
                      <CalendarIcon boxSize={6} color="purple.500" />
                    </HStack>
                  </Box>

                  {/* Grille des cycles de cette année */}
                  <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={8} w="100%">
                    {cyclesByYear[Number(year)].map((cycle) => (
                      <Card
                        key={cycle._id}
                        bg={cardBg}
                        borderColor={borderColor}
                        borderWidth={1}
                _hover={{ 
                  transform: 'translateY(-8px)', 
                  shadow: '2xl',
                  borderColor: 'blue.400',
                  _dark: { borderColor: 'blue.500' }
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                borderRadius="xl"
                overflow="hidden"
                position="relative"
              >
                {/* Gradient accent en haut */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  h="4px"
                  bgGradient="linear(to-r, blue.400, purple.500)"
                />
                
                <CardBody p={0}>
                  {/* En-tête de la carte */}
                  <Box 
                    bgGradient={cardHeaderBg}
                    p={6} 
                    pb={5}
                  >
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between" align="start">
                        <Heading 
                          as={Link}
                          to={`/cycle/${cycle._id}`}
                          size="lg" 
                          flex={1}
                          color="gray.800"
                          _dark={{ color: "white" }}
                          _hover={{ 
                            color: "blue.600", 
                            _dark: { color: "blue.300" },
                            textDecoration: "underline"
                          }}
                          textDecoration="none"
                          transition="all 0.2s"
                        >
                          {cycle.name}
                        </Heading>
                        <Badge 
                          colorScheme="blue" 
                          fontSize="sm" 
                          px={3} 
                          py={1.5} 
                          borderRadius="full"
                          fontWeight="bold"
                        >
                          {cycle.rotations?.length || 0} ⚔️
                        </Badge>
                      </HStack>

                      {/* Dates avec design moderne */}
                      {cycle.rotations && cycle.rotations[0]?.start_date && (
                        <Flex 
                          gap={4} 
                          flexWrap="wrap"
                          fontSize="sm"
                          bg={datesBg}
                          p={3}
                          borderRadius="lg"
                        >
                          <HStack spacing={2} flex={1} minW="fit-content">
                            <Box p={1.5} bg="green.100" _dark={{ bg: "green.800" }} borderRadius="md">
                              <CalendarIcon color="green.600" _dark={{ color: "green.300" }} boxSize={3.5} />
                            </Box>
                            <VStack spacing={0} align="start">
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">Début</Text>
                              <Text color="gray.700" _dark={{ color: "gray.200" }} fontWeight="semibold">
                                {cycle.rotations[0].start_date}
                              </Text>
                            </VStack>
                          </HStack>
                          {cycle.rotations[cycle.rotations.length - 1]?.end_date && (
                            <HStack spacing={2} flex={1} minW="fit-content">
                              <Box p={1.5} bg="red.100" _dark={{ bg: "red.800" }} borderRadius="md">
                                <CalendarIcon color="red.600" _dark={{ color: "red.300" }} boxSize={3.5} />
                              </Box>
                              <VStack spacing={0} align="start">
                                <Text fontSize="xs" color="gray.500" fontWeight="medium">Fin</Text>
                                <Text color="gray.700" _dark={{ color: "gray.200" }} fontWeight="semibold">
                                  {cycle.rotations[cycle.rotations.length - 1].end_date}
                                </Text>
                              </VStack>
                            </HStack>
                          )}
                        </Flex>
                      )}
                    </VStack>
                  </Box>

                  {/* Contenu principal */}
                  <Box p={6}>
                    {cycle.rotations && cycle.rotations.length > 0 && (
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between" pb={2} borderBottom="2px solid" borderColor={borderColor}>
                          <HStack spacing={2}>
                            <Box w="3px" h="20px" bg="blue.500" borderRadius="full" />
                            <Text fontSize="md" fontWeight="bold" color="gray.700" _dark={{ color: "gray.200" }}>
                              Aperçu des rotations
                            </Text>
                          </HStack>
                          <Badge variant="subtle" colorScheme="purple" fontSize="xs" px={2} py={1} borderRadius="md">
                            {cycle.rotations.length > 5 ? "Top 5" : `${cycle.rotations.length} total`}
                          </Badge>
                        </HStack>
                        
                        <VStack spacing={2} align="stretch">
                          {cycle.rotations.slice(0, 5).map((rotation, index) => (
                            <Box 
                              key={index} 
                              p={4}
                              bg={rotationItemBg}
                              _hover={{
                                bg: rotationItemHoverBg,
                                transform: 'translateX(4px)',
                                shadow: 'sm'
                              }}
                              borderRadius="lg"
                              border="1px solid"
                              borderColor={borderColor}
                              transition="all 0.2s"
                              position="relative"
                              overflow="hidden"
                            >
                              {/* Indicateur de position */}
                              <Box
                                position="absolute"
                                left={0}
                                top={0}
                                bottom={0}
                                w="4px"
                                bgGradient="linear(to-b, blue.400, purple.500)"
                              />
                              
                              <Flex justify="space-between" align="center" gap={3}>
                                <HStack spacing={3} flex={1}>
                                  <Flex
                                    alignItems="center"
                                    justifyContent="center"
                                    w="32px"
                                    h="32px"
                                    bg={numberBoxBg}
                                    color="blue.600"
                                    _dark={{ color: "blue.300" }}
                                    fontWeight="bold"
                                    fontSize="sm"
                                    borderRadius="lg"
                                  >
                                    #{index + 1}
                                  </Flex>
                                  <VStack spacing={1} align="start" flex={1}>
                                    <Text fontWeight="bold" fontSize="sm">
                                      {rotation.killer}
                                    </Text>
                                    <HStack spacing={2} flexWrap="wrap">
                                      <AttackTypeBadge 
                                        attackType={rotation.attack} 
                                        size="14px" 
                                      />
                                      <Text fontSize="xs" color="gray.500">
                                        {handleAttackType(rotation)}
                                      </Text>
                                      <AlterationImage 
                                        alteration={rotation.alteration} 
                                        size="16px" 
                                      />
                                    </HStack>
                                  </VStack>
                                </HStack>
                                <Badge 
                                  colorScheme="purple" 
                                  fontSize="xs"
                                  px={3}
                                  py={1.5}
                                  borderRadius="full"
                                  fontWeight="semibold"
                                >
                                  {rotation.period}
                                </Badge>
                              </Flex>
                            </Box>
                          ))}
                          
                          {cycle.rotations.length > 5 && (
                            <Box 
                              textAlign="center" 
                              py={3}
                              bg={moreRotationsBg}
                              borderRadius="lg"
                              borderWidth={1}
                              borderStyle="dashed"
                              borderColor="purple.300"
                              _dark={{ borderColor: "purple.600" }}
                            >
                              <Text fontSize="sm" color="purple.600" _dark={{ color: "purple.300" }} fontWeight="semibold">
                                ✨ +{cycle.rotations.length - 5} autres rotations disponibles
                              </Text>
                            </Box>
                          )}
                        </VStack>

                        {/* Bouton voir plus avec style moderne */}
                        <Button
                          as={Link}
                          to={`/cycle/${cycle._id}`}
                          rightIcon={<ExternalLinkIcon />}
                          colorScheme="blue"
                          variant="solid"
                          size="md"
                          w="full"
                          mt={4}
                          _hover={{ 
                            transform: 'translateY(-2px)',
                            shadow: 'lg'
                          }}
                          transition="all 0.2s"
                          borderRadius="lg"
                        >
                          Voir tous les détails
                        </Button>
                      </VStack>
                    )}
                  </Box>
                </CardBody>
              </Card>
                    ))}
                  </SimpleGrid>
                </React.Fragment>
              ));
            })()}
            
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
      </Box>
    </>
  );
}

export default CyclesPage;