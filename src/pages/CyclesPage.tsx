import { useState } from "react";
import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  VStack,
  SimpleGrid,
  Text,
  Badge,
  Flex,
  Alert,
  AlertIcon,
  useColorModeValue,
  HStack,
  Button,
  Icon,
  Divider,
  IconButton,
  Tooltip,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { FiCalendar, FiLayers, FiRefreshCw, FiList } from "react-icons/fi";

import { AlterationImage } from "../components/ui/AlterationImage";
import { cycleSlug } from "@/utils/cycleHelpers";
import { AttackTypeBadge } from "../components/ui/AttackTypeBadge";
import { Pagination as PaginationComponent } from "../components/ui/Pagination";
import { CustomSelect } from "../components/ui/CustomSelect";
import { HeroSection } from "../components/HeroSection";
import { SEOHead } from "../components/SEOHead";
import { useCycles } from "@/hooks/useAPI";
import { useTranslation } from "react-i18next";
import RotationCalendar from "../components/cycles/RotationCalendar";

const CyclesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const { t } = useTranslation();

  const { cycles = [], pagination, isLoading, mutate: mutateCycles } = useCycles({ page: currentPage, limit: itemsPerPage });

  const cardBg = useColorModeValue("white", "rgba(26, 32, 44, 0.7)");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const statBg = useColorModeValue("white", "rgba(26, 32, 44, 0.6)");
  const yearLabelColor = useColorModeValue("gray.500", "whiteAlpha.500");
  const rotationRowBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const rotationRowHover = useColorModeValue("blue.50", "whiteAlpha.100");
  const killLabelColor = useColorModeValue("gray.700", "whiteAlpha.900");
  const subTextColor = useColorModeValue("gray.500", "whiteAlpha.600");
  const headerAccentBg = useColorModeValue(
    "linear-gradient(135deg, rgba(66,153,225,0.08), rgba(159,122,234,0.08))",
    "linear-gradient(135deg, rgba(66,153,225,0.12), rgba(159,122,234,0.12))"
  );

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const totalCount = pagination?.totalCount ?? cycles.length;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Cycles de Rotation Bleach Brave Souls",
    "description": "Cycles de rotation et événements pour Bleach Brave Souls avec détails des rotations et classements",
    "url": "https://bbs-schrift.fr/cycles",
    "numberOfItems": totalCount,
  };

  return (
    <>
      <SEOHead
        title={t("pages.cycles.seoTitle")}
        description={t("pages.cycles.seoDescription")}
        keywords="cycles, rotation, événements, classements"
        url="https://bbs-schrift.fr/cycles"
        structuredData={structuredData}
      />
      <Box w="100%">
        <HeroSection
          title={t("pages.cycles.heroTitle")}
          description={t("pages.cycles.heroDescription")}
          badge={{ text: t("pages.cycles.heroBadge"), icon: "⚡" }}
          size="lg"
        />

        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">

            {/* Stats + contrôles */}
            <Box
              bg={statBg}
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              boxShadow="md"
              overflow="hidden"
            >
              <Flex
                justify="space-between"
                align="center"
                px={6}
                py={5}
                flexDir={{ base: "column", md: "row" }}
                gap={{ base: 4, md: 0 }}
              >
                <HStack spacing={6}>
                  <HStack spacing={3}>
                    <Box
                      bg="blue.500"
                      borderRadius="lg"
                      p={2}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiCalendar} color="white" boxSize={4} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="2xl" fontWeight="extrabold" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                        {isLoading ? "…" : totalCount}
                      </Text>
                      <Text fontSize="xs" fontWeight="semibold" color={subTextColor} textTransform="uppercase" letterSpacing="wide">
                        {totalCount > 1 ? t("pages.cycles.statsCyclePlural") : t("pages.cycles.statsCycleSingular")}
                      </Text>
                    </VStack>
                  </HStack>

                  {pagination && (
                    <HStack spacing={3}>
                      <Box
                        bgGradient="linear(to-br, purple.500, pink.500)"
                        borderRadius="lg"
                        p={2}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiLayers} color="white" boxSize={4} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="2xl" fontWeight="extrabold" bgGradient="linear(to-r, purple.500, pink.400)" bgClip="text">
                          {pagination.itemsOnPage}
                        </Text>
                        <Text fontSize="xs" fontWeight="semibold" color={subTextColor} textTransform="uppercase" letterSpacing="wide">
                          {t("pages.cycles.statsOnPage")}
                        </Text>
                      </VStack>
                    </HStack>
                  )}
                </HStack>

                <HStack spacing={3} flexWrap="wrap" justify={{ base: "center", md: "flex-end" }}>
                  {viewMode === "list" && (
                    <>
                      <CustomSelect
                        value={String(itemsPerPage)}
                        onChange={(val) => handleItemsPerPageChange(parseInt(val))}
                        w={{ base: "full", sm: "140px" }}
                        options={[
                          { value: "3", label: t("pages.cycles.select3") },
                          { value: "6", label: t("pages.cycles.select6") },
                          { value: "9", label: t("pages.cycles.select9") },
                          { value: "12", label: t("pages.cycles.select12") },
                        ]}
                        allowDeselect={false}
                      />
                      <Button
                        leftIcon={<Icon as={FiRefreshCw} />}
                        size="md"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => mutateCycles()}
                        isLoading={isLoading}
                        loadingText="…"
                        borderRadius="lg"
                      >
                        {t("pages.cycles.buttonRefresh")}
                      </Button>
                    </>
                  )}
                  <HStack spacing={1}>
                    <Tooltip label={t("pages.cycles.buttonListView")} placement="top" hasArrow openDelay={400}>
                      <IconButton
                        aria-label={t("pages.cycles.buttonListView")}
                        icon={<Icon as={FiList} />}
                        size="sm"
                        variant={viewMode === "list" ? "solid" : "ghost"}
                        colorScheme={viewMode === "list" ? "blue" : "gray"}
                        onClick={() => setViewMode("list")}
                        borderRadius="lg"
                      />
                    </Tooltip>
                    <Tooltip label={t("pages.cycles.buttonCalendarView")} placement="top" hasArrow openDelay={400}>
                      <IconButton
                        aria-label={t("pages.cycles.buttonCalendarView")}
                        icon={<Icon as={FiCalendar} />}
                        size="sm"
                        variant={viewMode === "calendar" ? "solid" : "ghost"}
                        colorScheme={viewMode === "calendar" ? "blue" : "gray"}
                        onClick={() => setViewMode("calendar")}
                        borderRadius="lg"
                      />
                    </Tooltip>
                  </HStack>
                </HStack>
              </Flex>
            </Box>

            {/* Contenu */}
            {viewMode === "calendar" ? (
              <RotationCalendar />
            ) : isLoading ? (
              <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6} w="100%">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Box
                    key={i}
                    bg={cardBg}
                    borderRadius="xl"
                    borderWidth={1}
                    borderColor={borderColor}
                    overflow="hidden"
                  >
                    <Box h="3px" bgGradient="linear(to-r, blue.400, purple.500)" />
                    <Box p={5} pb={4}>
                      <Flex justify="space-between" align="flex-start" gap={3}>
                        <VStack align="start" spacing={2} flex={1}>
                          <Skeleton height="22px" width="70%" borderRadius="md" />
                          <Skeleton height="14px" width="50%" borderRadius="md" />
                        </VStack>
                        <Skeleton height="22px" width="50px" borderRadius="md" />
                      </Flex>
                    </Box>
                    <Box px={5} pb={5} pt={3}>
                      <SkeletonText mt={2} noOfLines={5} spacing={3} skeletonHeight="12px" />
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            ) : !Array.isArray(cycles) || cycles.length === 0 ? (
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                {!Array.isArray(cycles) ? t("pages.cycles.errorLoading") : t("pages.cycles.noCycles")}
              </Alert>
            ) : (
              <VStack spacing={10} align="stretch">
                {(() => {
                  const cyclesByYear = cycles.reduce((acc, cycle) => {
                    const year = cycle.year;
                    if (!acc[year]) acc[year] = [];
                    acc[year].push(cycle);
                    return acc;
                  }, {} as Record<number, typeof cycles>);

                  const sortedYears = Object.keys(cyclesByYear).sort((a, b) => Number(b) - Number(a));

                  return sortedYears.map((year) => (
                    <React.Fragment key={year}>
                      {/* Séparateur d'année */}
                      <Flex align="center" gap={3}>
                        <Divider flex={1} borderColor={borderColor} />
                        <HStack spacing={2} flexShrink={0}>
                          <Text fontSize="xs" fontWeight="semibold" color={yearLabelColor} textTransform="uppercase" letterSpacing="widest">
                            {t("pages.cycles.yearPrefix")}
                          </Text>
                          <Badge
                            fontSize="sm"
                            px={3}
                            py={1}
                            borderRadius="full"
                            bgGradient="linear(to-r, blue.500, purple.500)"
                            color="white"
                            fontWeight="bold"
                            letterSpacing="wide"
                          >
                            {year}
                          </Badge>
                        </HStack>
                        <Divider flex={1} borderColor={borderColor} />
                      </Flex>

                      {/* Grille des cycles */}
                      <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6} w="100%">
                        {cyclesByYear[Number(year)].map((cycle) => (
                          <Box
                            key={cycle._id}
                            bg={cardBg}
                            backdropFilter="blur(12px)"
                            borderRadius="xl"
                            borderWidth={1}
                            borderColor={borderColor}
                            overflow="hidden"
                            position="relative"
                            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                            _hover={{
                              transform: "translateY(-4px)",
                              shadow: "xl",
                              borderColor: "blue.400",
                              _dark: { borderColor: "blue.600" },
                            }}
                          >
                            {/* Barre de couleur en haut */}
                            <Box h="3px" bgGradient="linear(to-r, blue.400, purple.500)" />

                            {/* En-tête */}
                            <Box p={5} pb={4} background={headerAccentBg}>
                              <Flex justify="space-between" align="flex-start" gap={3}>
                                <VStack align="start" spacing={1} flex={1} minW={0}>
                                  <Heading
                                    as={Link}
                                    to={`/cycle/${cycleSlug(cycle.name, cycle.year)}`}
                                    size="md"
                                    noOfLines={2}
                                    color="inherit"
                                    _hover={{ color: "blue.500", _dark: { color: "blue.300" } }}
                                    textDecoration="none"
                                    transition="color 0.15s"
                                  >
                                    {cycle.name}
                                  </Heading>
                                  {cycle.rotations?.[0]?.start_date && (
                                    <HStack spacing={1.5} fontSize="xs" color={subTextColor}>
                                      <Icon as={FiCalendar} boxSize={3} />
                                      <Text>{cycle.rotations[0].start_date}</Text>
                                      <Text>→</Text>
                                      <Text>{cycle.rotations[cycle.rotations.length - 1]?.end_date ?? "—"}</Text>
                                    </HStack>
                                  )}
                                </VStack>
                                <Badge
                                  colorScheme="blue"
                                  variant="subtle"
                                  fontSize="xs"
                                  px={2.5}
                                  py={1}
                                  borderRadius="md"
                                  fontWeight="bold"
                                  flexShrink={0}
                                >
                                  {cycle.rotations?.length || 0} ⚔️
                                </Badge>
                              </Flex>
                            </Box>

                            {/* Rotations preview */}
                            {cycle.rotations && cycle.rotations.length > 0 && (
                              <Box px={5} pb={5} pt={3}>
                                <Text fontSize="xs" fontWeight="semibold" color={subTextColor} textTransform="uppercase" letterSpacing="wider" mb={2}>
                                  {t("pages.cycles.rotationsPreview")}
                                </Text>

                                <VStack spacing={1} align="stretch">
                                  {cycle.rotations.slice(0, 5).map((rotation, index) => (
                                    <Flex
                                      key={index}
                                      align="center"
                                      gap={2.5}
                                      px={3}
                                      py={2}
                                      bg={rotationRowBg}
                                      _hover={{ bg: rotationRowHover }}
                                      borderRadius="lg"
                                      transition="background 0.15s"
                                    >
                                      <Text
                                        fontSize="xs"
                                        fontWeight="bold"
                                        color="blue.500"
                                        minW="22px"
                                        textAlign="right"
                                        flexShrink={0}
                                      >
                                        #{rotation.position || index + 1}
                                      </Text>
                                      <Text fontSize="sm" fontWeight="semibold" color={killLabelColor} flex={1} noOfLines={1}>
                                        {t(`factions.${rotation.killer}`, rotation.killer)}
                                      </Text>
                                      <HStack spacing={1.5} flexShrink={0}>
                                        <AttackTypeBadge attackType={rotation.attack} size="14px" />
                                        <Text fontSize="xs" color={subTextColor}>{t(`attackTypes.${rotation.attack}`, rotation.attack)}</Text>
                                        <AlterationImage alteration={rotation.alteration} size="15px" />
                                      </HStack>
                                      <Badge
                                        fontSize="2xs"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                        colorScheme={rotation.period?.includes("Vendredi") ? "pink" : "blue"}
                                        flexShrink={0}
                                      >
                                        {t(`periodsShort.${rotation.period}`, rotation.period?.includes("Vendredi") ? "V–D" : "M–J")}
                                      </Badge>
                                    </Flex>
                                  ))}

                                  {cycle.rotations.length > 5 && (
                                    <Text fontSize="xs" color={subTextColor} textAlign="center" pt={1}>
                                      +{cycle.rotations.length - 5} {t("pages.cycles.moreRotations")}
                                    </Text>
                                  )}
                                </VStack>

                                <Button
                                  as={Link}
                                  to={`/cycle/${cycleSlug(cycle.name, cycle.year)}`}
                                  rightIcon={<ChevronRightIcon />}
                                  colorScheme="blue"
                                  variant="ghost"
                                  size="sm"
                                  w="full"
                                  mt={4}
                                  borderRadius="lg"
                                  justifyContent="space-between"
                                  _hover={{ bg: rotationRowHover }}
                                >
                                  {t("pages.cycles.seeAllDetails")}
                                </Button>
                              </Box>
                            )}
                          </Box>
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
};

export default CyclesPage;