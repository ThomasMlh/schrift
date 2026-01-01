import {
  Container,
  VStack,
  Text,
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  Badge,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  IconButton,
  Divider,
  Grid
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CustomSelect } from "../components/ui/CustomSelect";
import { UserSearchSelect } from "../components/ui/UserSearchSelect";
import { HeroSection } from "../components/HeroSection";
import type { IComparisonResponse, IUser, ICycle, IGuild } from "../interfaces";
import { SEOHead } from "@/components/SEOHead";
import ComparisonEntity from "@/components/ui/ComparisonEntity";

const ComparatorPage: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados
  const [comparisonType, setComparisonType] = useState<"players" | "guilds">(
    (searchParams.get("type") as "players" | "guilds") || "players"
  );
  const [entity1, setEntity1] = useState<string>(
    searchParams.get("entity1") || ""
  );
  const [entity2, setEntity2] = useState<string>(
    searchParams.get("entity2") || ""
  );
  const [selectedCycleId, setSelectedCycleId] = useState<string>(
    searchParams.get("cycle_id") || ""
  );
  const [selectedRotationId, setSelectedRotationId] = useState<string>(
    searchParams.get("rotation_id") || ""
  );
  const [entity1SearchQuery, setEntity1SearchQuery] = useState<string>("");
  const [entity2SearchQuery, setEntity2SearchQuery] = useState<string>("");

  // Données
  const [users, setUsers] = useState<IUser[]>([]);
  const [guilds, setGuilds] = useState<IGuild[]>([]);
  const [cycles, setCycles] = useState<ICycle[]>([]);
  const [allRotations, setAllRotations] = useState<any[]>([]);
  const [comparisonResult, setComparisonResult] =
    useState<IComparisonResponse | null>(null);

  // États de chargement
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Hooks UI
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const filterBg = useColorModeValue("blue.50", "blue.900");
  const rotationInfoBg = useColorModeValue("blue.50", "blue.900");

  // Chargement des données initiales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Effet pour déclencher automatiquement la comparaison si les paramètres URL sont présents
  useEffect(() => {
    if (entity1 && entity2 && !isLoadingData) {
      performComparison();
    }
  }, [entity1, entity2, isLoadingData]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      const [usersResponse, guildsResponse, cyclesResponse, rotationsResponse] =
        await Promise.all([
          fetch(`${apiUrl}/api/users?limit=1000`),
          fetch(`${apiUrl}/api/guildes`),
          fetch(`${apiUrl}/api/cycles`),
          fetch(`${apiUrl}/api/rotations`)
        ]);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
      }

      if (guildsResponse.ok) {
        const guildsData = await guildsResponse.json();
        setGuilds(
          Array.isArray(guildsData) ? guildsData : guildsData.guilds || []
        );
      }

      if (cyclesResponse.ok) {
        const cyclesData = await cyclesResponse.json();
        setCycles(
          Array.isArray(cyclesData) ? cyclesData : cyclesData.data || []
        );
      }

      if (rotationsResponse.ok) {
        const rotationsData = await rotationsResponse.json();
        setAllRotations(
          Array.isArray(rotationsData)
            ? rotationsData
            : rotationsData.data || []
        );
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données",
        status: "error",
        duration: 3000
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fonction pour mettre à jour les paramètres URL
  const updateURLParams = (
    type = comparisonType,
    e1 = entity1,
    e2 = entity2,
    cycleId = selectedCycleId,
    rotationId = selectedRotationId
  ) => {
    const params = new URLSearchParams();

    params.set("type", type);
    if (e1) params.set("entity1", e1);
    if (e2) params.set("entity2", e2);
    if (cycleId) params.set("cycle_id", cycleId);
    if (rotationId) params.set("rotation_id", rotationId);

    setSearchParams(params);
  };

  // Fonction pour effectuer la comparaison
  const performComparison = async () => {
    if (!entity1 || !entity2) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner deux entités à comparer",
        status: "warning",
        duration: 3000
      });
      return;
    }

    if (entity1 === entity2) {
      toast({
        title: "Sélection invalide",
        description: "Vous devez sélectionner deux entités différentes",
        status: "warning",
        duration: 3000
      });
      return;
    }

    setIsLoading(true);
    try {
      let url = `${apiUrl}/api/scores/compare?type=${comparisonType}&entity1=${encodeURIComponent(
        entity1
      )}&entity2=${encodeURIComponent(entity2)}`;

      if (selectedCycleId) {
        url += `&cycle_id=${encodeURIComponent(selectedCycleId)}`;
      }

      if (selectedRotationId) {
        url += `&rotation_id=${encodeURIComponent(selectedRotationId)}`;
      }

      const response = await fetch(url);

      if (response.ok) {
        const data: IComparisonResponse = await response.json();
        setComparisonResult(data);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de la comparaison",
          status: "error",
          duration: 3000
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors de la comparaison",
        status: "error",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour inverser les entités
  const swapEntities = () => {
    const temp = entity1;
    setEntity1(entity2);
    setEntity2(temp);
    updateURLParams(
      comparisonType,
      entity2,
      entity1,
      selectedCycleId,
      selectedRotationId
    );
  };

  // Fonction pour réinitialiser
  const resetComparison = () => {
    setEntity1("");
    setEntity2("");
    setEntity1SearchQuery("");
    setEntity2SearchQuery("");
    setSelectedCycleId("");
    setSelectedRotationId("");
    setComparisonResult(null);
    setSearchParams(new URLSearchParams({ type: comparisonType }));
  };

  // Obtenir le cycle sélectionné
  const selectedCycle = cycles.find((c) => c._id === selectedCycleId);

  // Obtenir les rotations disponibles (du cycle sélectionné ou toutes les rotations)
  const getAvailableRotations = () => {
    if (selectedCycle && selectedCycle.rotations) {
      return selectedCycle.rotations;
    }
    return allRotations;
  };

  // Obtenir les informations de la rotation sélectionnée
  const getSelectedRotationInfo = () => {
    if (!selectedRotationId) return null;

    // Chercher d'abord dans les rotations du cycle sélectionné
    if (selectedCycle && selectedCycle.rotations) {
      const rotation = selectedCycle.rotations.find(
        (r: any) => r._id === selectedRotationId
      );
      if (rotation) return rotation;
    }

    // Sinon chercher dans toutes les rotations
    return allRotations.find((r: any) => r._id === selectedRotationId);
  };

  if (isLoadingData) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="lg" />
          <Text>Chargement des données...</Text>
        </VStack>
      </Container>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Comparateur - Bleach Brave Souls | Schrift BBS",
    description:
      "Comparez les performances entre joueurs ou guildes dans Bleach Brave Souls. Analysez les scores moyens, totaux et plus encore.",
    url: "https://bbs-schrift.fr/comparateur"
  };

  return (
    <>
      <SEOHead
        title="Comparateur - Bleach Brave Souls | Schrift BBS"
        description="Comparez les performances entre joueurs ou guildes dans Bleach Brave Souls. Analysez les scores moyens, totaux et plus encore."
        keywords="comparateur, comparaison, joueurs, guildes, scores, statistiques"
        url="https://bbs-schrift.fr/comparateur"
        structuredData={structuredData}
      />
      <Box w="100%">
        <HeroSection
          title="Comparateur"
          description="Comparez les performances entre joueurs ou guildes"
          badge={{ text: "Analyse", icon: "⚔️" }}
        />

        <Container maxW="container.xl" py={8}>
          <Box
            bg={bgColor}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="lg"
            p={{ base: 4, md: 6 }}
            w={{ base: "100%", md: "90%" }}
            mx="auto"
          >
            <VStack spacing={6} align="stretch">
              {/* Contrôles de configuration */}
              <Card>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="semibold">
                    Configuration
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Type de comparaison */}
                    <Flex direction={{ base: "column", md: "row" }} gap={4}>
                      <Box flex={1}>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Type de comparaison
                        </Text>
                        <CustomSelect
                          value={comparisonType}
                          onChange={(value) => {
                            const newType = value as "players" | "guilds";
                            setComparisonType(newType);
                            setEntity1("");
                            setEntity2("");
                            setEntity1SearchQuery("");
                            setEntity2SearchQuery("");
                            setComparisonResult(null);
                            updateURLParams(
                              newType,
                              "",
                              "",
                              selectedCycleId,
                              selectedRotationId
                            );
                          }}
                          options={[
                            { value: "players", label: "👤 Joueurs" },
                            { value: "guilds", label: "🏛️ Guildes" }
                          ]}
                          isDisabled={isLoading}
                        />
                      </Box>
                      {/* Sélection du cycle (optionnel) */}
                      <Box flex={1}>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Cycle (optionnel)
                        </Text>
                        <CustomSelect
                          placeholder="Tous les cycles"
                          value={selectedCycleId}
                          onChange={(value) => {
                            setSelectedCycleId(value);
                            setSelectedRotationId("");
                            updateURLParams(
                              comparisonType,
                              entity1,
                              entity2,
                              value,
                              ""
                            );
                          }}
                          options={cycles
                            .filter((cycle) => cycle._id) // Filtrer les cycles sans _id
                            .map((cycle) => ({
                              value: cycle._id!,
                              label: cycle.name
                            }))}
                          allowDeselect={true}
                          isDisabled={isLoading}
                        />
                      </Box>
                      {/* Sélection de la rotation (optionnel) */}
                      <Box flex={1}>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Rotation (optionnel)
                        </Text>
                        <CustomSelect
                          placeholder="Toutes les rotations"
                          value={selectedRotationId}
                          onChange={(value) => {
                            setSelectedRotationId(value);
                            updateURLParams(
                              comparisonType,
                              entity1,
                              entity2,
                              selectedCycleId,
                              value
                            );
                          }}
                          options={getAvailableRotations()
                            .filter((rotation: any) => rotation._id) // Filtrer les rotations sans _id
                            .map((rotation: any) => ({
                              value: rotation.rotation_id,
                              label: `${
                                rotation.position
                                  ? `#${rotation.position} - `
                                  : ""
                              }${rotation.killer} (${rotation.attack})`
                            }))}
                          allowDeselect={true}
                          isDisabled={isLoading}
                        />
                      </Box>
                    </Flex>
                    <Divider />
                    {/* Sélection des entités */}
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="sm" fontWeight="medium">
                        Sélection des{" "}
                        {comparisonType === "players" ? "joueurs" : "guildes"}
                      </Text>
                      <Flex
                        direction={{ base: "column", lg: "row" }}
                        gap={4}
                        align="center"
                      >
                        {/* Entité 1 */}
                        <Box flex={1} w="full">
                          {comparisonType === "players" ? (
                            <UserSearchSelect
                              users={users}
                              selectedUserId={entity1}
                              onUserSelect={(userId) => {
                                setEntity1(userId);
                                updateURLParams(
                                  comparisonType,
                                  userId,
                                  entity2,
                                  selectedCycleId,
                                  selectedRotationId
                                );
                              }}
                              searchQuery={entity1SearchQuery}
                              onSearchChange={setEntity1SearchQuery}
                              placeholder="Sélectionner le premier joueur"
                            />
                          ) : (
                            <CustomSelect
                              placeholder="Sélectionner la première guilde"
                              value={entity1}
                              onChange={(value) => {
                                setEntity1(value);
                                updateURLParams(
                                  comparisonType,
                                  value,
                                  entity2,
                                  selectedCycleId,
                                  selectedRotationId
                                );
                              }}
                              options={guilds.map((guild) => ({
                                value: guild.name,
                                label: guild.name
                              }))}
                              isDisabled={isLoading}
                            />
                          )}
                        </Box>
                        {/* Bouton d'échange */}
                        <IconButton
                          aria-label="Échanger les entités"
                          icon={<RepeatIcon />}
                          onClick={swapEntities}
                          isDisabled={!entity1 || !entity2 || isLoading}
                          variant="ghost"
                          size="sm"
                        />
                        {/* Entité 2 */}
                        <Box flex={1} w="full">
                          {comparisonType === "players" ? (
                            <UserSearchSelect
                              users={users}
                              selectedUserId={entity2}
                              onUserSelect={(userId) => {
                                setEntity2(userId);
                                updateURLParams(
                                  comparisonType,
                                  entity1,
                                  userId,
                                  selectedCycleId,
                                  selectedRotationId
                                );
                              }}
                              searchQuery={entity2SearchQuery}
                              onSearchChange={setEntity2SearchQuery}
                              placeholder="Sélectionner le second joueur"
                            />
                          ) : (
                            <CustomSelect
                              placeholder="Sélectionner la seconde guilde"
                              value={entity2}
                              onChange={(value) => {
                                setEntity2(value);
                                updateURLParams(
                                  comparisonType,
                                  entity1,
                                  value,
                                  selectedCycleId,
                                  selectedRotationId
                                );
                              }}
                              options={guilds.map((guild) => ({
                                value: guild.name,
                                label: guild.name
                              }))}
                              isDisabled={isLoading}
                            />
                          )}
                        </Box>
                      </Flex>
                    </VStack>
                    {/* Boutons d'action */}
                    <HStack spacing={3} justify="center">
                      <Button
                        colorScheme="blue"
                        onClick={performComparison}
                        isLoading={isLoading}
                        loadingText="Comparaison..."
                        isDisabled={!entity1 || !entity2 || entity1 === entity2}
                        minW="150px"
                      >
                        🔍 Comparer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetComparison}
                        isDisabled={isLoading}
                        minW="100px"
                      >
                        Réinitialiser
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
              {/* Résultats de la comparaison */}
              {comparisonResult && comparisonResult.comparison && (
                <VStack spacing={4} align="stretch">
                  {/* Informations de filtre */}
                  <Box p={3} bg={filterBg} borderRadius="md">
                    <VStack spacing={2} align="stretch">
                      <HStack spacing={2} flexWrap="wrap">
                        <Text fontSize="sm" fontWeight="medium">
                          Comparaison:
                        </Text>
                        <Badge colorScheme="blue">
                          {comparisonResult.filters.type === "players"
                            ? "Joueurs"
                            : "Guildes"}
                        </Badge>
                        <Badge colorScheme="green">
                          {comparisonResult.filters.cycle_id
                            ? "Cycle spécifique"
                            : "Tous les cycles"}
                        </Badge>
                        {selectedRotationId && (
                          <Badge colorScheme="purple">
                            Rotation spécifique
                          </Badge>
                        )}
                      </HStack>

                      {/* Informations détaillées sur la rotation */}
                      {selectedRotationId &&
                        (() => {
                          const rotationInfo = getSelectedRotationInfo();
                          return rotationInfo ? (
                            <Box p={3} bg={rotationInfoBg} borderRadius="md">
                              <VStack spacing={2} align="start">
                                <Text fontSize="md" fontWeight="bold">
                                  #{rotationInfo.position} -{" "}
                                  {rotationInfo.killer} ({rotationInfo.attack})
                                </Text>
                                {rotationInfo.start_date &&
                                  rotationInfo.end_date && (
                                    <Text fontSize="sm" color="gray.600">
                                      {rotationInfo.start_date} →{" "}
                                      {rotationInfo.end_date}
                                    </Text>
                                  )}
                                {rotationInfo.period && (
                                  <Text fontSize="sm" color="gray.500">
                                    Période: {rotationInfo.period}
                                  </Text>
                                )}
                              </VStack>
                            </Box>
                          ) : null;
                        })()}
                    </VStack>
                  </Box>
                  {/* Cartes de comparaison */}
                  <Grid
                    templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
                    gap={6}
                  >
                    {Object.entries(comparisonResult.comparison.entities).map(
                      ([entityId, entityData]) => (
                        <ComparisonEntity
                          key={entityId}
                          entityId={entityId}
                          entityData={entityData}
                          isWinner={
                            comparisonResult.comparison.winner === entityId
                          }
                          comparisonType={comparisonType}
                        />
                      )
                    )}
                  </Grid>
                  {/* Analyse des différences */}
                  {comparisonResult.comparison.differences && (
                    <Card>
                      <CardHeader>
                        <Text fontSize="lg" fontWeight="semibold">
                          📊 Analyse des différences
                        </Text>
                      </CardHeader>
                      <CardBody>
                        <Grid
                          templateColumns={{
                            base: "1fr",
                            md: "repeat(2, 1fr)",
                            lg: "repeat(3, 1fr)"
                          }}
                          gap={4}
                        >
                          <Stat>
                            <StatLabel>Différence de moyenne</StatLabel>
                            <StatNumber>
                              {comparisonResult.comparison.differences
                                .averageScore.difference > 0
                                ? "+"
                                : ""}
                              {comparisonResult.comparison.differences.averageScore.difference.toLocaleString(
                                "fr-FR"
                              )}
                            </StatNumber>
                            <StatHelpText>
                              <StatArrow
                                type={
                                  comparisonResult.comparison.differences
                                    .averageScore.difference >= 0
                                    ? "increase"
                                    : "decrease"
                                }
                              />
                              points de différence
                            </StatHelpText>
                          </Stat>
                          <Stat>
                            <StatLabel>Différence de participation</StatLabel>
                            <StatNumber>
                              {comparisonResult.comparison.differences
                                .totalScores.difference > 0
                                ? "+"
                                : ""}
                              {
                                comparisonResult.comparison.differences
                                  .totalScores.difference
                              }
                            </StatNumber>
                            <StatHelpText>
                              <StatArrow
                                type={
                                  comparisonResult.comparison.differences
                                    .totalScores.difference >= 0
                                    ? "increase"
                                    : "decrease"
                                }
                              />
                              scores supplémentaires
                            </StatHelpText>
                          </Stat>
                          <Stat>
                            <StatLabel>Différence score brut moyen</StatLabel>
                            <StatNumber>
                              {comparisonResult.comparison.differences
                                .averageRawScore.difference > 0
                                ? "+"
                                : ""}
                              {comparisonResult.comparison.differences.averageRawScore.difference.toLocaleString(
                                "fr-FR"
                              )}
                            </StatNumber>
                            <StatHelpText>
                              <StatArrow
                                type={
                                  comparisonResult.comparison.differences
                                    .averageRawScore.difference >= 0
                                    ? "increase"
                                    : "decrease"
                                }
                              />
                              points de différence
                            </StatHelpText>
                          </Stat>
                        </Grid>
                      </CardBody>
                    </Card>
                  )}
                  {/* Message égalité */}
                  {!comparisonResult.comparison.winner && (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Text>
                        Les deux entités ont une performance égale ! (Moyenne
                        identique:{" "}
                        {comparisonResult.comparison.summary.entity1.averageScore.toLocaleString(
                          "fr-FR"
                        )}{" "}
                        points)
                      </Text>
                    </Alert>
                  )}
                </VStack>
              )}
            </VStack>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ComparatorPage;
