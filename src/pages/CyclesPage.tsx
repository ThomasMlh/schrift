import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  VStack,
  SimpleGrid,
  Text,
  Flex,
  Alert,
  AlertIcon,
  HStack,
  Button,
  ButtonGroup,
  Icon,
  Divider,
  Progress,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { FiCalendar, FiList, FiChevronRight } from "react-icons/fi";

import { cycleSlug, getRotationRealDates } from "@/utils/cycleHelpers";
import { Pagination as PaginationComponent } from "../components/ui/Pagination";
import { CustomSelect } from "../components/ui/CustomSelect";
import { HeroSection } from "../components/HeroSection";
import { SEOHead } from "../components/SEOHead";
import { useCycles } from "@/hooks/useAPI";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { useTranslation } from "react-i18next";
import RotationCalendar from "../components/cycles/RotationCalendar";
import { RotationStrip } from "../components/cycles/RotationStrip";
import type { ICycle } from "@/interfaces";

const formatDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

/** Dates réelles de début et de fin d'un cycle, ou null s'il n'a pas de rotation datée */
const cycleRange = (cycle: ICycle) => {
  const rotations = (cycle.rotations ?? []).filter((r) => r.start_date && r.end_date);
  if (!rotations.length) return null;
  const { realStartDate, realEndDate } = getRotationRealDates(
    rotations[0].start_date,
    rotations[rotations.length - 1].end_date
  );
  return `${formatDate(realStartDate)} → ${formatDate(realEndDate)}`;
};

const CyclesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const { t } = useTranslation();

  const { cycles = [], pagination, isLoading } = useCycles({ page: currentPage, limit: itemsPerPage });
  const { currentCycle, currentRotation, isRotationActive } = useCurrentRotation(cycles, isLoading);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const totalCount = pagination?.totalCount ?? cycles.length;

  // Cycle en cours mis en avant (il n'apparaît alors plus dans la grille)
  const featured = currentCycle;
  const featuredRotations = featured?.rotations ?? [];
  const activeIndex = currentRotation ? featuredRotations.indexOf(currentRotation) : -1;
  const doneCount = activeIndex >= 0 ? activeIndex + (isRotationActive ? 1 : 0) : 0;
  const featuredRange = featured ? cycleRange(featured) : null;
  const listedCycles = cycles.filter((cycle) => cycle._id !== featured?._id);

  const cyclesByYear = listedCycles.reduce((acc, cycle) => {
    (acc[cycle.year] ??= []).push(cycle);
    return acc;
  }, {} as Record<number, ICycle[]>);
  const sortedYears = Object.keys(cyclesByYear).sort((a, b) => Number(b) - Number(a));

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
          size="lg"
        />

        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">

            {/* Barre d'outils */}
            <Flex justify="space-between" align="center" gap={3} wrap="wrap">
              <ButtonGroup size="sm" isAttached variant="outline">
                <Button
                  leftIcon={<Icon as={FiList} />}
                  onClick={() => setViewMode("list")}
                  variant={viewMode === "list" ? "solid" : "outline"}
                  colorScheme={viewMode === "list" ? "purple" : "gray"}
                  aria-pressed={viewMode === "list"}
                >
                  {t("pages.cycles.buttonListView")}
                </Button>
                <Button
                  leftIcon={<Icon as={FiCalendar} />}
                  onClick={() => setViewMode("calendar")}
                  variant={viewMode === "calendar" ? "solid" : "outline"}
                  colorScheme={viewMode === "calendar" ? "purple" : "gray"}
                  aria-pressed={viewMode === "calendar"}
                >
                  {t("pages.cycles.buttonCalendarView")}
                </Button>
              </ButtonGroup>

              {viewMode === "list" && (
                <HStack spacing={3}>
                  <Text fontSize="sm" color="text.muted" display={{ base: "none", sm: "block" }}>
                    {isLoading ? "…" : t("pages.cycles.totalCount", { count: totalCount })}
                  </Text>
                  <CustomSelect
                    value={String(itemsPerPage)}
                    onChange={(val) => handleItemsPerPageChange(parseInt(val))}
                    w="140px"
                    options={[
                      { value: "3", label: t("pages.cycles.select3") },
                      { value: "6", label: t("pages.cycles.select6") },
                      { value: "9", label: t("pages.cycles.select9") },
                      { value: "12", label: t("pages.cycles.select12") },
                    ]}
                    allowDeselect={false}
                  />
                </HStack>
              )}
            </Flex>

            {viewMode === "calendar" ? (
              <RotationCalendar />
            ) : isLoading ? (
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5} w="100%">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Box key={i} bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle" p={5}>
                    <Skeleton height="20px" width="60%" borderRadius="md" />
                    <Skeleton height="12px" width="45%" borderRadius="md" mt={2} />
                    <Skeleton height="8px" borderRadius="full" mt={5} />
                    <SkeletonText mt={5} noOfLines={1} skeletonHeight="12px" />
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

                {/* Cycle en cours */}
                {featured && (
                  <Box
                    bg="bg.card"
                    borderRadius="2xl"
                    borderWidth="1px"
                    borderColor="purple.400"
                    boxShadow="md"
                    p={{ base: 5, md: 7 }}
                  >
                    <Flex
                      direction={{ base: "column", md: "row" }}
                      justify="space-between"
                      align={{ base: "stretch", md: "flex-end" }}
                      gap={5}
                      mb={6}
                    >
                      <Box minW={0}>
                        <HStack spacing={2} mb={1}>
                          <Box w="8px" h="8px" borderRadius="full" bg="green.400" boxShadow="0 0 0 4px rgba(72,187,120,0.2)" />
                          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="green.400">
                            {t("pages.cycles.currentCycle")}
                          </Text>
                        </HStack>
                        <Text
                          as={Link}
                          to={`/cycle/${cycleSlug(featured.name, featured.year)}`}
                          display="inline-block"
                          fontSize={{ base: "2xl", md: "3xl" }}
                          fontWeight="extrabold"
                          letterSpacing="tight"
                          bgGradient="linear(to-r, purple.300, blue.400)"
                          bgClip="text"
                          _hover={{ opacity: 0.85 }}
                        >
                          {featured.name} — {featured.year}
                        </Text>
                        {featuredRange && (
                          <Text fontSize="sm" color="text.muted">{featuredRange}</Text>
                        )}
                      </Box>

                      <Box w={{ base: "100%", md: "300px" }} flexShrink={0}>
                        <HStack justify="space-between" mb={2} fontSize="sm">
                          <Text color="text.muted">{t("pages.cycles.rotationsPlayed")}</Text>
                          <Text fontWeight="bold" color="text.strong">
                            {doneCount} / {featuredRotations.length}
                          </Text>
                        </HStack>
                        <Progress
                          value={featuredRotations.length ? (doneCount / featuredRotations.length) * 100 : 0}
                          size="sm"
                          borderRadius="full"
                          colorScheme="purple"
                          bg="bg.inset"
                          aria-label={t("pages.cycles.rotationsPlayed")}
                        />
                      </Box>
                    </Flex>

                    <RotationStrip
                      rotations={featuredRotations}
                      doneCount={doneCount}
                      activeIndex={activeIndex}
                      height="12px"
                    />

                    <Flex mt={5} justify="space-between" align="center" gap={3} wrap="wrap">
                      {currentRotation ? (
                        <Text fontSize="sm" color="text.secondary">
                          <Text as="span" fontWeight="semibold" color={isRotationActive ? "green.400" : "orange.400"}>
                            {isRotationActive ? t("pages.cycles.rotationNow") : t("pages.cycles.rotationNext")}
                          </Text>
                          {" · "}#{currentRotation.position || activeIndex + 1}{" "}
                          {t(`factions.${currentRotation.killer}`, currentRotation.killer)}
                        </Text>
                      ) : <Box />}
                      <Button
                        as={Link}
                        to={`/cycle/${cycleSlug(featured.name, featured.year)}`}
                        size="sm"
                        colorScheme="purple"
                        rightIcon={<Icon as={FiChevronRight} />}
                      >
                        {t("pages.cycles.seeCycle")}
                      </Button>
                    </Flex>
                  </Box>
                )}

                {/* Autres cycles, par année */}
                {sortedYears.map((year) => (
                  <VStack key={year} spacing={4} align="stretch">
                    <Flex align="center" gap={3}>
                      <Text
                        fontSize="lg"
                        fontWeight="extrabold"
                        bgGradient="linear(to-r, blue.400, purple.500)"
                        bgClip="text"
                        flexShrink={0}
                      >
                        {year}
                      </Text>
                      <Divider borderColor="border.subtle" />
                    </Flex>

                    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5} w="100%">
                      {cyclesByYear[Number(year)].map((cycle) => {
                        const range = cycleRange(cycle);
                        const rotationCount = cycle.rotations?.length ?? 0;
                        return (
                          <Box
                            key={cycle._id}
                            as={Link}
                            to={`/cycle/${cycleSlug(cycle.name, cycle.year)}`}
                            display="block"
                            bg="bg.card"
                            borderRadius="xl"
                            borderWidth="1px"
                            borderColor="border.subtle"
                            p={5}
                            role="group"
                            transition="border-color 0.15s, transform 0.15s"
                            _hover={{ borderColor: "purple.400", transform: "translateY(-2px)" }}
                          >
                            <Flex justify="space-between" align="start" gap={3}>
                              <Box minW={0}>
                                <Text fontSize="lg" fontWeight="bold" color="text.strong" noOfLines={1}>
                                  {cycle.name}
                                </Text>
                                {range && <Text fontSize="xs" color="text.muted">{range}</Text>}
                              </Box>
                              <Icon
                                as={FiChevronRight}
                                boxSize={5}
                                color="text.muted"
                                flexShrink={0}
                                transition="transform 0.15s, color 0.15s"
                                _groupHover={{ color: "purple.400", transform: "translateX(2px)" }}
                              />
                            </Flex>

                            {rotationCount > 0 && (
                              <Box mt={5}>
                                <RotationStrip rotations={cycle.rotations} />
                              </Box>
                            )}

                            <Text mt={4} fontSize="xs" color="text.muted">
                              {t("pages.cycles.rotationCount", { count: rotationCount })}
                            </Text>
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  </VStack>
                ))}

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
