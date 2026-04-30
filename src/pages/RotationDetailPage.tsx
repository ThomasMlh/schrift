import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Box,
  Spinner,
  useColorModeValue,
  Button,
  Flex,
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
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowBackIcon,
  ChevronLeftIcon,
  ChevronRightIcon
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
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useTranslation } from "react-i18next";

const RotationDetailPage = () => {
  const { cycleId, position } = useParams<{
    cycleId: string;
    position: string;
  }>();
  const navigate = useNavigate();
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
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textSecondary = useColorModeValue("gray.700", "gray.300");
  const shadowColor = useColorModeValue("lg", "dark-lg");

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
      navigate(`/cycle/${cycleId}/rotation/${currentPosition - 1}`);
    }
  };

  const handleNextRotation = () => {
    const currentPosition = parseInt(position || "1");
    if (currentPosition < totalRotations) {
      navigate(`/cycle/${cycleId}/rotation/${currentPosition + 1}`);
    }
  };

  if (isLoading && !hasInitialData.current) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" />
        </Flex>
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
            onClick={() => navigate(-1)}
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
      <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <VStack spacing={4} align="stretch">
          <HStack
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={2}
          >
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              {t("pages.rotationDetail.buttonBack")}
            </Button>

            <HStack spacing={2}>
              <Button
                leftIcon={<ChevronLeftIcon />}
                variant="outline"
                size="sm"
                onClick={handlePreviousRotation}
                isDisabled={parseInt(position || "1") <= 1}
              >
                {t("pages.rotationDetail.buttonPrevious")}
              </Button>
              <Button
                rightIcon={<ChevronRightIcon />}
                variant="outline"
                size="sm"
                onClick={handleNextRotation}
                isDisabled={parseInt(position || "1") >= totalRotations}
              >
                {t("pages.rotationDetail.buttonNext")}
              </Button>
            </HStack>
          </HStack>

          <VStack align="start" spacing={2}>
            <Heading size={{ base: "md", md: "lg" }}>
              <VStack spacing={2} align="start">
                <HStack spacing={2} align="center" flexWrap="wrap">
                  <Text as="span">
                    {cycle?.name} - {cycle?.year}
                  </Text>
                </HStack>
                <Text as="span">Rotation #{position}</Text>
                <HStack spacing={2} align="center" justify="center" flexWrap="wrap">
                  <Text as="span">{rotation?.killer ? t(`factions.${rotation.killer}`, rotation.killer) : ""}</Text>
                  {rotation?.attack && (
                    <AttackTypeBadge attackType={rotation.attack} size="24px" />
                  )}
                  {rotation?.alteration && (
                    <AlterationImage alteration={rotation.alteration} size="30px" />
                  )}
                </HStack>
              </VStack>
            </Heading>
            <Text color={textSecondary} fontSize="sm">
              {totalItems} score{totalItems > 1 ? "s" : ""} {t("pages.rotationDetail.scoreTotalSuffix")}
              {selectedGuild && (
                <Text as="span" ml={2} fontSize="xs" color="blue.500">
                  ({t("pages.rotationDetail.filteredOnPrefix")}{" "}
                  {guilds.find((g) => g._id === selectedGuild)?.name})
                </Text>
              )}
            </Text>
          </VStack>
        </VStack>

        {/* Filtre des guildes */}
        <Box
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          p={4}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={4}
            align="center"
            justify="space-between"
          >
            <HStack spacing={4} align="center" flex={1}>
              <Text fontSize="sm" fontWeight="medium" minW="max-content">
                {t("pages.rotationDetail.filterGuildLabel")}
              </Text>
              <CustomSelect
                value={selectedGuild}
                onChange={handleGuildChange}
                placeholder={t("pages.rotationDetail.allGuilds")}
                size="sm"
                maxW="300px"
                isDisabled={isLoadingGuilds}
                options={guilds.map((guild) => ({
                  value: guild._id,
                  label: guild.name,
                }))}
              />
            </HStack>
            <Box>
              <ScoreLegend />
            </Box>
          </Flex>
        </Box>

        {/* Scores Table */}
        <Box
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow={shadowColor}
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
              borderRadius="lg"
            >
              <Spinner size="lg" />
            </Flex>
          )}
          {scores.length === 0 && !isLoading ? (
            <Flex justify="center" align="center" py={12}>
              <Text fontSize="lg" color={textSecondary}>
                {selectedGuild
                  ? `${t("pages.rotationDetail.noScoreForGuild")} ${guilds.find((g) => g._id === selectedGuild)?.name}`
                  : t("pages.rotationDetail.noScoreForRotation")}
              </Text>
            </Flex>
          ) : (
            <>
              <TableContainer>
                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                  <Thead>
                    <Tr>
                      <Th>{t("pages.rotationDetail.tableRank")}</Th>
                      <Th>{t("pages.rotationDetail.tablePlayer")}</Th>
                      {!selectedGuild && (
                        <Th display={{ base: "none", md: "table-cell" }}>
                          {t("pages.rotationDetail.tableGuild")}
                        </Th>
                      )}
                      <Th isNumeric>{t("pages.rotationDetail.tableScore")}</Th>
                      <Th display={{ base: "none", sm: "table-cell" }}>{t("pages.rotationDetail.tableDate")}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {scores.map((score) => {
                      const rankInfo = getRankInfo(score.rank);

                      return (
                        <Tr
                          key={score._id}
                          borderLeft={rankInfo.rank <= 3 ? "4px solid" : "none"}
                          borderLeftColor={rankInfo.borderColor}
                        >
                          <Td>
                            <RankBadge rank={rankInfo.rank} variant="compact" />
                          </Td>
                          <Td>
                            <UserDisplay
                              user={score.user}
                              rainbowText={score.rank === 1}
                            />
                          </Td>
                          {!selectedGuild && (
                            <Td display={{ base: "none", md: "table-cell" }}>
                              {score.user.guilde_id && (
                                <Badge colorScheme="blue" fontSize="xs">
                                  {getGuildNameFromId(score.user.guilde_id)}
                                </Badge>
                              )}
                            </Td>
                          )}
                          <Td isNumeric>
                            <ScoreBadge score={score.score} />
                          </Td>
                          <Td display={{ base: "none", sm: "table-cell" }}>
                            <Text fontSize="sm" color={textSecondary}>
                              {new Date(score.created_at).toLocaleDateString(
                                "fr-FR"
                              )}
                            </Text>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <VStack
                spacing={4}
                p={4}
                borderTop="1px solid"
                borderTopColor={borderColor}
              >
                {/* Controls row */}
                <Flex
                  justify="space-between"
                  align="center"
                  w="100%"
                  flexWrap="wrap"
                  gap={4}
                >
                  <HStack spacing={2}>
                    <Text fontSize="sm" color={textSecondary}>
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
                    <Text
                      fontSize="sm"
                      color={textSecondary}
                      display={{ base: "none", sm: "block" }}
                    >
                      {t("pages.rotationDetail.paginationPerPage")}
                    </Text>
                  </HStack>

                  <HStack spacing={2}>
                    <IconButton
                      aria-label={t("pages.rotationDetail.ariaPreviousPage")}
                      icon={<ChevronLeftIcon />}
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      isDisabled={currentPage <= 1}
                    />
                    <Text
                      fontSize="sm"
                      color={textSecondary}
                      whiteSpace="nowrap"
                    >
                      {currentPage}/{totalPages}
                    </Text>
                    <IconButton
                      aria-label="Page suivante"
                      icon={<ChevronRightIcon />}
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      isDisabled={currentPage >= totalPages}
                    />
                  </HStack>
                </Flex>

                {/* Info row - hidden on very small screens */}
                <Text
                  fontSize="sm"
                  color={textSecondary}
                  textAlign="center"
                  display={{ base: "none", md: "block" }}
                >
                  {selectedGuild
                    ? `Affichage de ${totalItems} résultat${totalItems > 1 ? "s" : ""} pour ${guilds.find((g) => g._id === selectedGuild)?.name}`
                    : `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, totalItems)} sur ${totalItems}`}
                </Text>
              </VStack>
            </>
          )}
        </Box>
      </VStack>
    </Container>
    </>
  );
};

export default RotationDetailPage;
