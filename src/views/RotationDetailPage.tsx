'use client';
import {
  Container,
  VStack,
  HStack,
  Text,
  Box,
  useColorModeValue,
  Button,
  Flex,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  IconButton,
  Badge
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowBackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon
} from "@chakra-ui/icons";
import type {
  IRotationTemplate,
  IScoreWithUser,
  IRankInfo,
  ICycle
} from "@/interfaces";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { UserDisplay } from "@/components/ui/UserDisplay";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ScoreLegend } from "@/components/ui/ScoreLegend";
import { useGuilds, useRotationScores } from "@/hooks/useAPI";
import { RankBadge } from "@/components/ui/RankBadge";
import { AlterationImage } from "@/components/ui/AlterationImage";
import { SEOHead } from "@/components/SEOHead";
import { HeroSection } from "@/components/HeroSection";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useTranslation } from "react-i18next";
import { PageLoader } from "@/components/ui/PageLoader";

const RotationDetailPage = () => {
  const params = useParams();
  const cycleId = params?.cycleId as string;
  const position = params?.position as string;
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();

  const [scores, setScores] = useState<IScoreWithUser[]>([]);
  const [cycle, setCycle] = useState<ICycle | null>(null);
  const [rotation, setRotation] = useState<IRotationTemplate | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Constante : chaque cycle a toujours 20 rotations
  const totalRotations = 20;

  // Utiliser les hooks API
  const { guilds, isLoading: isLoadingGuilds } = useGuilds(false, true);
  const {
    fetchRotationScores,
    isLoading,
    error: apiError
  } = useRotationScores();
  const [selectedGuild, setSelectedGuild] = useState<string>(""); // ID de la guilde ou vide pour "toutes"
  const hasInitialData = useRef(false);

  // Hooks UI
  const cardBg = useColorModeValue("white", "rgba(26, 32, 44, 0.7)");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const subTextColor = useColorModeValue("gray.500", "whiteAlpha.600");
  const labelColor = useColorModeValue("gray.700", "whiteAlpha.900");
  const statBg = useColorModeValue("white", "rgba(26, 32, 44, 0.6)");
  const tableHeaderBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const rowHoverBg = useColorModeValue("blue.50", "whiteAlpha.100");

  // Fonction pour obtenir le nom de la guilde à partir de l'ID
  const getGuildNameFromId = (guildId?: string): string | undefined => {
    if (!guildId) return undefined;
    const guild = guilds.find((g) => g._id === guildId);
    return guild?.name;
  };

  const loadScores = async (guildFilter?: string) => {
    if (!cycleId || !position) return;

    // Trouver le nom de la guilde si un filtre est fourni
    let guildName: string | undefined;
    if (guildFilter) {
      const selectedGuildData = guilds.find(
        (guild) => guild._id === guildFilter
      );
      if (selectedGuildData) {
        guildName = selectedGuildData.name;
      }
    }

    const data = await fetchRotationScores(cycleId, position, {
      page: currentPage,
      limit: itemsPerPage,
      guildName
    });

    if (data) {
      setScores(data.data);
      setCycle(data.cycle);
      setRotation(data.rotation);
      setCurrentPage(data.pagination?.currentPage || 1);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.totalItems || data.data?.length || 0);
      hasInitialData.current = true;
    } else if (apiError) {
      toast({
        title: t("common.error"),
        description: apiError,
        status: "error",
        duration: 5000
      });
    }
  };

  // Fonction pour créer les informations de rang basées sur le rang du serveur
  const getRankInfo = (rank: number): IRankInfo => {
    if (rank === 1) {
      // Or pour le #1
      return {
        rank: 1,
        color: "yellow.600",
        bgColor: "yellow.50",
        borderColor: "yellow.300"
      };
    } else if (rank === 2) {
      // Argent pour le #2
      return {
        rank: 2,
        color: "gray.600",
        bgColor: "gray.50",
        borderColor: "gray.300"
      };
    } else if (rank === 3) {
      // Bronze pour le #3
      return {
        rank: 3,
        color: "orange.600",
        bgColor: "orange.50",
        borderColor: "orange.300"
      };
    } else {
      // Pas de podium
      return {
        rank: rank,
        color: "gray.500",
        bgColor: "transparent",
        borderColor: "transparent"
      };
    }
  };

  useEffect(() => {
    if (cycleId && position) {
      loadScores(selectedGuild || undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleId, position, currentPage, itemsPerPage, selectedGuild]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (
    value: string
  ) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset à la première page
  };

  const handleGuildChange = async (
    value: string
  ) => {
    const newGuildId = value;
    setSelectedGuild(newGuildId);
    setCurrentPage(1); // Reset à la première page quand on change le filtre

    // Faire la requête API avec le nouveau filtre
    await loadScores(newGuildId);
  };

  const handlePreviousRotation = () => {
    const currentPosition = parseInt(position || "1");
    if (currentPosition > 1) {
      router.push(`/cycle/${cycleId}/rotation/${currentPosition - 1}`);
    }
  };

  const handleNextRotation = () => {
    const currentPosition = parseInt(position || "1");
    if (currentPosition < totalRotations) {
      router.push(`/cycle/${cycleId}/rotation/${currentPosition + 1}`);
    }
  };

  if (isLoading && !hasInitialData.current) {
    return (
      <Container maxW="container.xl" py={8}>
        <PageLoader height="200px" />
      </Container>
    );
  }

  if (apiError) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="center">
          <Text fontSize="xl" color="red.500">
            {apiError}
          </Text>
          <Button
            leftIcon={<ArrowBackIcon />}
            colorScheme="blue"
            onClick={() => router.back()}
          >
            Retour
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <>
      <SEOHead
        title={cycle ? `Rotation ${position} - ${cycle.name} ${cycle.year} - Schrift BBS` : `Rotation ${position} - Cycle ${cycleId} - Schrift BBS`}
        description={cycle ? `Détails de la rotation ${position} du cycle ${cycle.name} (${cycle.year})` : `Détails de la rotation ${position} du cycle ${cycleId}`}
        noIndex={true}
      />
      <Box w="100%">
        <HeroSection
          title={`Rotation #${position}`}
          description={cycle ? `${cycle.name} — ${cycle.year}` : ""}
          badge={{ text: `${position} / ${totalRotations}`, icon: "⚡" }}
          size="sm"
        />

        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} align="stretch">

            {/* Nav bar */}
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
              <Button
                leftIcon={<ArrowBackIcon />}
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                _hover={{ transform: "translateX(-4px)" }}
                transition="all 0.2s"
              >
                {t("pages.rotationDetail.buttonBack")}
              </Button>
              {rotation && (
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="purple"
                  rightIcon={<ExternalLinkIcon />}
                  onClick={() =>
                    router.push(
                      `/personnages?killer=${encodeURIComponent(rotation.killer)}&attack_type=${encodeURIComponent(rotation.attack)}`
                    )
                  }
                >
                  {t("pages.rotationDetail.buttonViewCharacters")}
                </Button>
              )}
              <HStack spacing={2}>
                <IconButton
                  aria-label={t("pages.rotationDetail.buttonPrevious")}
                  icon={<ChevronLeftIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousRotation}
                  isDisabled={parseInt(position || "1") <= 1}
                />
                <Text fontSize="sm" fontWeight="semibold" color={subTextColor}>
                  {position} / {totalRotations}
                </Text>
                <IconButton
                  aria-label={t("pages.rotationDetail.buttonNext")}
                  icon={<ChevronRightIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={handleNextRotation}
                  isDisabled={parseInt(position || "1") >= totalRotations}
                />
              </HStack>
            </Flex>

            {/* Rotation info strip */}
            {rotation && (
              <Box
                bg={statBg}
                borderRadius="xl"
                borderWidth={1}
                borderColor={borderColor}
                boxShadow="md"
                overflow="hidden"
              >
                <Flex justify="center" align="center" px={6} py={5} gap={{ base: 4, md: 8 }} wrap="wrap">
                  <VStack spacing={1} align="center">
                    <Text fontSize="2xs" color={subTextColor} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
                      {t("pages.cycleDetail.fieldKiller")}
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color={labelColor}>
                      {t(`factions.${rotation.killer}`, rotation.killer)}
                    </Text>
                  </VStack>

                  <Divider orientation="vertical" h="36px" display={{ base: "none", md: "block" }} />

                  <VStack spacing={1} align="center">
                    <Text fontSize="2xs" color={subTextColor} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
                      {t("pages.cycleDetail.fieldAttack")}
                    </Text>
                    <HStack spacing={2}>
                      <AttackTypeBadge attackType={rotation.attack} size="16px" />
                      <Text fontSize="sm" color={subTextColor}>
                        {t(`attackTypes.${rotation.attack}`, rotation.attack)}
                      </Text>
                    </HStack>
                  </VStack>

                  <Divider orientation="vertical" h="36px" display={{ base: "none", md: "block" }} />

                  <VStack spacing={1} align="center">
                    <Text fontSize="2xs" color={subTextColor} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
                      {t("pages.cycleDetail.fieldAlteration")}
                    </Text>
                    <AlterationImage alteration={rotation.alteration} size="20px" showLabel={true} />
                  </VStack>

                  <Divider orientation="vertical" h="36px" display={{ base: "none", md: "block" }} />

                  <VStack spacing={1} align="center">
                    <Text fontSize="2xs" color={subTextColor} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
                      {t("pages.rotationDetail.tableScore")}s
                    </Text>
                    <Text fontSize="md" fontWeight="bold" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                      {totalItems}
                      {selectedGuild && (
                        <Text as="span" fontSize="xs" color="blue.500" ml={1} fontWeight="normal">
                          ({guilds.find((g) => g._id === selectedGuild)?.name})
                        </Text>
                      )}
                    </Text>
                  </VStack>
                </Flex>
              </Box>
            )}

            {/* Filter bar */}
            <Box
              bg={cardBg}
              backdropFilter="blur(12px)"
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              p={4}
              position="relative"
              zIndex={2}
            >
              <Flex direction={{ base: "column", md: "row" }} gap={4} align="center" justify="space-between">
                <HStack spacing={4} align="center" flex={1}>
                  <Text fontSize="sm" fontWeight="medium" color={labelColor} minW="max-content">
                    {t("pages.rotationDetail.filterGuildLabel")}
                  </Text>
                  <CustomSelect
                    value={selectedGuild}
                    onChange={handleGuildChange}
                    placeholder={t("pages.rotationDetail.allGuilds")}
                    size="sm"
                    maxW="300px"
                    isDisabled={isLoadingGuilds}
                    options={guilds.map((guild) => ({ value: guild._id, label: guild.name }))}
                  />
                </HStack>
                <ScoreLegend />
              </Flex>
            </Box>

            {/* Scores table */}
            <Box
              bg={cardBg}
              backdropFilter="blur(12px)"
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              overflow="hidden"
              position="relative"
            >
              {isLoading && hasInitialData.current && (
                <Flex
                  position="absolute"
                  inset={0}
                  zIndex={1}
                  justify="center"
                  align="center"
                  bg="blackAlpha.200"
                  borderRadius="xl"
                >
                  <PageLoader height="auto" />
                </Flex>
              )}
              {scores.length === 0 && !isLoading ? (
                <Flex justify="center" align="center" py={12}>
                  <Text fontSize="lg" color={subTextColor}>
                    {selectedGuild
                      ? `${t("pages.rotationDetail.noScoreForGuild")} ${guilds.find((g) => g._id === selectedGuild)?.name}`
                      : t("pages.rotationDetail.noScoreForRotation")}
                  </Text>
                </Flex>
              ) : (
                <>
                  <TableContainer>
                    <Table variant="simple" size={{ base: "sm", md: "md" }}>
                      <Thead bg={tableHeaderBg}>
                        <Tr>
                          <Th borderColor={borderColor}>{t("pages.rotationDetail.tableRank")}</Th>
                          <Th borderColor={borderColor}>{t("pages.rotationDetail.tablePlayer")}</Th>
                          {!selectedGuild && (
                            <Th display={{ base: "none", md: "table-cell" }} borderColor={borderColor}>
                              {t("pages.rotationDetail.tableGuild")}
                            </Th>
                          )}
                          <Th isNumeric borderColor={borderColor}>{t("pages.rotationDetail.tableScore")}</Th>
                          <Th display={{ base: "none", sm: "table-cell" }} borderColor={borderColor}>
                            {t("pages.rotationDetail.tableDate")}
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {scores.map((score) => {
                          const rankInfo = getRankInfo(score.rank);
                          return (
                            <Tr
                              key={score._id}
                              borderLeft={rankInfo.rank <= 3 ? "3px solid" : "none"}
                              borderLeftColor={rankInfo.borderColor}
                              _hover={{ bg: rowHoverBg }}
                              transition="background 0.15s"
                            >
                              <Td borderColor={borderColor}>
                                <RankBadge rank={rankInfo.rank} variant="compact" />
                              </Td>
                              <Td borderColor={borderColor}>
                                <UserDisplay user={score.user} rainbowText={score.rank === 1} />
                              </Td>
                              {!selectedGuild && (
                                <Td display={{ base: "none", md: "table-cell" }} borderColor={borderColor}>
                                  {score.user.guilde_id && (
                                    <Badge colorScheme="blue" fontSize="xs">
                                      {getGuildNameFromId(score.user.guilde_id)}
                                    </Badge>
                                  )}
                                </Td>
                              )}
                              <Td isNumeric borderColor={borderColor}>
                                <ScoreBadge score={score.score} />
                              </Td>
                              <Td display={{ base: "none", sm: "table-cell" }} borderColor={borderColor}>
                                <Text fontSize="sm" color={subTextColor}>
                                  {new Date(score.created_at).toLocaleDateString("fr-FR")}
                                </Text>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  <VStack spacing={4} p={4} borderTop="1px solid" borderTopColor={borderColor}>
                    <Flex justify="space-between" align="center" w="100%" flexWrap="wrap" gap={4}>
                      <HStack spacing={2}>
                        <Text fontSize="sm" color={subTextColor}>
                          {t("pages.rotationDetail.paginationShow")}
                        </Text>
                        <CustomSelect
                          size="sm"
                          value={String(itemsPerPage)}
                          onChange={handleItemsPerPageChange}
                          w="auto"
                          options={[
                            { value: "10", label: "10" },
                            { value: "20", label: "20" },
                            { value: "50", label: "50" },
                            { value: "100", label: "100" },
                          ]}
                          allowDeselect={false}
                        />
                        <Text fontSize="sm" color={subTextColor} display={{ base: "none", sm: "block" }}>
                          {t("pages.rotationDetail.paginationPerPage")}
                        </Text>
                      </HStack>

                      <HStack spacing={2}>
                        <IconButton
                          aria-label={t("pages.rotationDetail.ariaPreviousPage")}
                          icon={<ChevronLeftIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePageChange(currentPage - 1)}
                          isDisabled={currentPage <= 1}
                        />
                        <Text fontSize="sm" color={subTextColor} whiteSpace="nowrap">
                          {currentPage} / {totalPages}
                        </Text>
                        <IconButton
                          aria-label="Page suivante"
                          icon={<ChevronRightIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePageChange(currentPage + 1)}
                          isDisabled={currentPage >= totalPages}
                        />
                      </HStack>
                    </Flex>

                    <Text fontSize="sm" color={subTextColor} textAlign="center" display={{ base: "none", md: "block" }}>
                      {selectedGuild
                        ? `${totalItems} résultat${totalItems > 1 ? "s" : ""} — ${guilds.find((g) => g._id === selectedGuild)?.name}`
                        : `${(currentPage - 1) * itemsPerPage + 1} – ${Math.min(currentPage * itemsPerPage, totalItems)} / ${totalItems}`}
                    </Text>
                  </VStack>
                </>
              )}
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default RotationDetailPage;
