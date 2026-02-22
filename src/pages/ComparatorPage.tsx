import {
  Container,
  VStack,
  Text,
  Box,
  Card,
  CardBody,
  Flex,
  HStack,
  Badge,
  Button,
  Alert,
  AlertIcon,
  useToast,
  useColorModeValue,
  Stat,
  StatArrow,
  IconButton,
  Divider,
  Grid
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CustomSelect } from "../components/ui/CustomSelect";
import { CycleSelect } from "../components/ui/CycleSelect";
import { UserSearchSelect } from "../components/ui/UserSearchSelect";
import { HeroSection } from "../components/HeroSection";
import type { IComparisonResponse, ICycleRotation, IRotationTemplate } from "../interfaces";
import { SEOHead } from "@/components/SEOHead";
import ComparisonEntity from "@/components/ui/ComparisonEntity";
import { useUsers, useGuilds, useCycles, useRotations } from "@/hooks/useAPI";

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

  // Utiliser useSWR pour les données (cache automatique)

  const { users = [] } = useUsers({ authenticated: false, limit: 1000 });
  const { guilds = [] } = useGuilds(false);
  const { cycles = [] } = useCycles();
  const { rotations: allRotations = [] } = useRotations();
  const [comparisonResult, setComparisonResult] =
    useState<IComparisonResponse | null>(null);

  // États de chargement
  const [isLoading, setIsLoading] = useState(false);

  // Hooks UI
  const bgColor = useColorModeValue("white", "gray.800");
  const hoverBgGray = useColorModeValue("gray.100", "gray.700");
  const borderColorBlue = useColorModeValue("blue.200", "blue.700");
  const borderColorPurple = useColorModeValue("purple.300", "purple.600");
  const bgGradientOrGray = useColorModeValue("gradient", "gray.700");
  const borderColorBlueAlt = useColorModeValue("blue.200", "blue.600");
  const borderColorGreen = useColorModeValue("green.200", "green.600");
  const borderColorOrange = useColorModeValue("orange.200", "orange.600");

  // Effet pour déclencher automatiquement la comparaison si les paramètres URL sont présents
  useEffect(() => {
    if (entity1 && entity2) {
      performComparison();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity1, entity2]);

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
    } catch {
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
        (r: ICycleRotation) => r._id === selectedRotationId
      );
      if (rotation) return rotation;
    }

    // Sinon chercher dans toutes les rotations
    return allRotations.find((r: IRotationTemplate) => r._id === selectedRotationId);
  };

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
        title="Schrift BBS - Comparateur"
        description="Comparez les performances entre joueurs ou guildes dans Bleach Brave Souls. Analysez les scores moyens, totaux et plus encore."
        keywords="comparateur, comparaison, joueurs, guildes, scores, statistiques"
        url="https://bbs-schrift.fr/comparateur"
        structuredData={structuredData}
      />
      <Flex w="100%" align="center" justify="center" flexDir="column" mb={"10%"}>
        <HeroSection
          title="Comparateur"
          description="Comparez les performances entre joueurs ou guildes"
          badge={{ text: "Analyse", icon: "⚔️" }}
        />

        <Container maxW="container.xl" py={8} >
            <VStack spacing={6} align="stretch" w={{ base: "100%", md: "90%" }} mx="auto">
              {/* Contrôles de configuration */}
              <Card
                borderWidth={0}
                boxShadow="2xl"
                bg={bgColor}
              >
                {/* En-tête avec gradient */}
                <Box
                  bgGradient="linear(to-r, blue.500, purple.500)"
                  p={4}
                  color="white"
                  borderTopRadius="md"
                >
                  <HStack spacing={2}>
                    <Text fontSize="2xl">⚙️</Text>
                    <Text fontSize="lg" fontWeight="bold">
                      Configuration
                    </Text>
                  </HStack>
                </Box>
                <CardBody p={6}>
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
                        <CycleSelect
                          cycles={cycles.filter((cycle) => cycle._id)}
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
                          placeholder="Tous les cycles"
                          isDisabled={isLoading}
                          size="md"
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
                            .filter((rotation) => rotation._id) // Filtrer les rotations sans _id
                            .map((rotation) => ({
                              value: ('rotation_id' in rotation && rotation.rotation_id) ? rotation.rotation_id : (rotation._id || ''),
                              label: `${
                                'position' in rotation && rotation.position
                                  ? `#${rotation.position} - `
                                  : ""
                              }${rotation.killer} ${rotation.attack === "R" ? "🔴" : rotation.attack === "B" ? "🔵" : "🟠 Mêlée"}`
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
                              guilds={guilds}
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
                              guilds={guilds}
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
                    <HStack spacing={3} justify="center" pt={2}>
                      <Button
                        size="lg"
                        bgGradient="linear(to-r, blue.400, purple.500)"
                        color="white"
                        _hover={{
                          bgGradient: "linear(to-r, blue.500, purple.600)",
                          transform: "translateY(-2px)",
                          boxShadow: "xl"
                        }}
                        _active={{
                          transform: "translateY(0)"
                        }}
                        onClick={performComparison}
                        isLoading={isLoading}
                        loadingText="Comparaison..."
                        isDisabled={!entity1 || !entity2 || entity1 === entity2}
                        minW="200px"
                        fontWeight="bold"
                        boxShadow="lg"
                        transition="all 0.3s"
                        leftIcon={<Text fontSize="lg">🔍</Text>}
                      >
                        Comparer
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        colorScheme="gray"
                        onClick={resetComparison}
                        isDisabled={isLoading}
                        minW="150px"
                        _hover={{
                          bg: hoverBgGray,
                          transform: "translateY(-2px)"
                        }}
                        transition="all 0.3s"
                      >
                        Réinitialiser
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
              {/* Résultats de la comparaison */}
              {comparisonResult && comparisonResult.comparison && (
                <VStack spacing={6} align="stretch">
                  {/* Informations de filtre */}
                  <Box
                    p={5}
                    bgGradient="linear(to-r, blue.50, purple.50)"
                    _dark={{ bgGradient: "linear(to-r, blue.900, purple.900)" }}
                    borderRadius="xl"
                    borderWidth="2px"
                    borderColor={borderColorBlue}
                    boxShadow="md"
                  >
                    <VStack spacing={3} align="stretch">
                      <HStack spacing={2} flexWrap="wrap">
                        <Text fontSize="sm" fontWeight="bold" color="gray.700" _dark={{ color: "gray.200" }}>
                          📊 Comparaison:
                        </Text>
                        <Badge
                          colorScheme="blue"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {comparisonResult.filters.type === "players"
                            ? "👤 Joueurs"
                            : "🏛️ Guildes"}
                        </Badge>
                        <Badge
                          colorScheme="green"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {comparisonResult.filters.cycle_id
                            ? "🎯 Cycle spécifique"
                            : "🔄 Tous les cycles"}
                        </Badge>
                        {selectedRotationId && (
                          <Badge
                            colorScheme="purple"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="bold"
                          >
                            🔄 Rotation spécifique
                          </Badge>
                        )}
                      </HStack>

                      {/* Informations détaillées sur la rotation */}
                      {selectedRotationId &&
                        (() => {
                          const rotationInfo = getSelectedRotationInfo();
                          return rotationInfo ? (
                            <Box
                              p={4}
                              bgGradient="linear(to-r, purple.100, pink.100)"
                              _dark={{ bgGradient: "linear(to-r, purple.800, pink.800)" }}
                              borderRadius="lg"
                              borderWidth="2px"
                              borderColor={borderColorPurple}
                              mt={2}
                            >
                              <VStack spacing={2} align="start">
                                <HStack spacing={2}>
                                  <Text fontSize="lg">
                                    {rotationInfo.attack === "R" ? "🔴" : rotationInfo.attack === "B" ? "🔵" : "🟠"}
                                  </Text>
                                  <Text fontSize="md" fontWeight="bold">
                                    {'position' in rotationInfo && rotationInfo.position && `#${rotationInfo.position} - `}
                                    {rotationInfo.killer}
                                  </Text>
                                  <Badge colorScheme={rotationInfo.attack === "R" ? "red" : "blue"} fontSize="xs">
                                    {rotationInfo.attack}
                                  </Badge>
                                </HStack>
                                {'start_date' in rotationInfo &&
                                  'end_date' in rotationInfo &&
                                  rotationInfo.start_date &&
                                  rotationInfo.end_date && (
                                    <HStack spacing={1}>
                                      <Text fontSize="xs">📅</Text>
                                      <Text fontSize="sm" fontWeight="medium" color="gray.600" _dark={{ color: "gray.300" }}>
                                        {rotationInfo.start_date} → {rotationInfo.end_date}
                                      </Text>
                                    </HStack>
                                  )}
                                {'period' in rotationInfo && rotationInfo.period && (
                                  <HStack spacing={1}>
                                    <Text fontSize="xs">⏰</Text>
                                    <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
                                      {rotationInfo.period}
                                    </Text>
                                  </HStack>
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
                    gap={8}
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
                    <Card
                      borderWidth={0}
                      boxShadow="xl"
                      position="relative"
                    >
                      {/* Gradient header */}
                      <Box
                        bgGradient="linear(to-r, purple.500, pink.500)"
                        p={6}
                        color="white"
                        position="relative"
                        overflow="hidden"
                        borderTopRadius="md"
                      >
                        <Box position="relative" zIndex={1}>
                          <HStack spacing={2} mb={2}>
                            <Text fontSize="2xl">📊</Text>
                            <Text fontSize="xl" fontWeight="bold">
                              Analyse des différences
                            </Text>
                          </HStack>
                          <Text fontSize="sm" opacity={0.9}>
                            Comparaison détaillée des performances
                          </Text>
                        </Box>
                        {/* Pattern de fond */}
                        <Box
                          position="absolute"
                          top="-50%"
                          right="-10%"
                          width="120%"
                          height="200%"
                          opacity={0.1}
                          transform="rotate(-12deg)"
                          bgGradient="linear(to-br, white, transparent)"
                        />
                      </Box>

                      <CardBody p={6}>
                        <Grid
                          templateColumns={{
                            base: "1fr",
                            md: "repeat(2, 1fr)",
                            lg: "repeat(3, 1fr)"
                          }}
                          gap={6}
                        >
                          {/* Différence de moyenne */}
                          <Box
                            p={5}
                            borderRadius="xl"
                            bg={bgGradientOrGray}
                            bgGradient="linear(135deg, blue.50 0%, purple.50 100%)"
                            _dark={{ bg: "gray.700" }}
                            border="2px solid"
                            borderColor={borderColorBlueAlt}
                            transition="all 0.3s"
                            _hover={{
                              transform: "translateY(-4px)",
                              boxShadow: "lg"
                            }}
                          >
                            <VStack align="start" spacing={3}>
                              <HStack>
                                <Text fontSize="2xl">📈</Text>
                                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                                  Différence de moyenne
                                </Text>
                              </HStack>
                              <Text fontSize="3xl" fontWeight="black">
                                {comparisonResult.comparison.differences
                                  .averageScore.difference > 0
                                  ? "+"
                                  : ""}
                                {comparisonResult.comparison.differences.averageScore.difference.toLocaleString(
                                  "fr-FR"
                                )}
                              </Text>
                              <Stat>
                                <HStack spacing={1}>
                                  <StatArrow
                                    type={
                                      comparisonResult.comparison.differences
                                        .averageScore.difference >= 0
                                        ? "increase"
                                        : "decrease"
                                    }
                                  />
                                  <Text fontSize="xs" color="gray.500">
                                    points de différence
                                  </Text>
                                </HStack>
                              </Stat>
                            </VStack>
                          </Box>

                          {/* Différence de participation */}
                          <Box
                            p={5}
                            borderRadius="xl"
                            bgGradient="linear(135deg, green.50 0%, teal.50 100%)"
                            _dark={{ bg: "gray.700" }}
                            border="2px solid"
                            borderColor={borderColorGreen}
                            transition="all 0.3s"
                            _hover={{
                              transform: "translateY(-4px)",
                              boxShadow: "lg"
                            }}
                          >
                            <VStack align="start" spacing={3}>
                              <HStack>
                                <Text fontSize="2xl">🎯</Text>
                                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                                  Différence de participation
                                </Text>
                              </HStack>
                              <Text fontSize="3xl" fontWeight="black">
                                {comparisonResult.comparison.differences
                                  .totalScores.difference > 0
                                  ? "+"
                                  : ""}
                                {
                                  comparisonResult.comparison.differences
                                    .totalScores.difference
                                }
                              </Text>
                              <Stat>
                                <HStack spacing={1}>
                                  <StatArrow
                                    type={
                                      comparisonResult.comparison.differences
                                        .totalScores.difference >= 0
                                        ? "increase"
                                        : "decrease"
                                    }
                                  />
                                  <Text fontSize="xs" color="gray.500">
                                    scores supplémentaires
                                  </Text>
                                </HStack>
                              </Stat>
                            </VStack>
                          </Box>

                          {/* Différence score brut moyen */}
                          <Box
                            p={5}
                            borderRadius="xl"
                            bgGradient="linear(135deg, orange.50 0%, red.50 100%)"
                            _dark={{ bg: "gray.700" }}
                            border="2px solid"
                            borderColor={borderColorOrange}
                            transition="all 0.3s"
                            _hover={{
                              transform: "translateY(-4px)",
                              boxShadow: "lg"
                            }}
                          >
                            <VStack align="start" spacing={3}>
                              <HStack>
                                <Text fontSize="2xl">⚡</Text>
                                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                                  Score brut moyen
                                </Text>
                              </HStack>
                              <Text fontSize="3xl" fontWeight="black">
                                {comparisonResult.comparison.differences
                                  .averageRawScore.difference > 0
                                  ? "+"
                                  : ""}
                                {comparisonResult.comparison.differences.averageRawScore.difference.toLocaleString(
                                  "fr-FR"
                                )}
                              </Text>
                              <Stat>
                                <HStack spacing={1}>
                                  <StatArrow
                                    type={
                                      comparisonResult.comparison.differences
                                        .averageRawScore.difference >= 0
                                        ? "increase"
                                        : "decrease"
                                    }
                                  />
                                  <Text fontSize="xs" color="gray.500">
                                    points de différence
                                  </Text>
                                </HStack>
                              </Stat>
                            </VStack>
                          </Box>
                        </Grid>
                      </CardBody>
                    </Card>
                  )}
                  {/* Message égalité */}
                  {!comparisonResult.comparison.winner && (
                    <Alert
                      status="info"
                      borderRadius="xl"
                      variant="subtle"
                      boxShadow="md"
                      p={4}
                    >
                      <AlertIcon />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">
                          🤝 Performance égale !
                        </Text>
                        <Text fontSize="sm">
                          Les deux entités ont une moyenne identique de{" "}
                          <Text as="span" fontWeight="bold">
                            {comparisonResult.comparison.summary.entity1.averageScore.toLocaleString(
                              "fr-FR"
                            )}
                          </Text>{" "}
                          points
                        </Text>
                      </VStack>
                    </Alert>
                  )}
                </VStack>
              )}
            </VStack>
        </Container>
      </Flex>
    </>
  );
};

export default ComparatorPage;
