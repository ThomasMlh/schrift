import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Select,
  Card,
  CardBody,
  Badge,
  Flex,
  Spinner,
  useColorModeValue,
  Alert,
  AlertIcon
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { UserDisplay } from "./ui/UserDisplay";
import { ScoreBadge } from "./ui/ScoreBadge";
import type { ICycle, IPodiumPlayer, IPodiumData } from "@/interfaces";
import { useCycles, useGuilds } from "@/hooks/useAPI";

interface PodiumSectionProps {
  // Props optionnelles pour les tests
}

export const PodiumSection = ({}: PodiumSectionProps = {}) => {
  const [podiumData, setPodiumData] = useState<IPodiumData | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [selectedGuildId, setSelectedGuildId] = useState<string>("global");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utilisation de useSWR pour les cycles et guildes (cache automatique + déduplication)
  const { cycles, isLoading: cyclesLoading } = useCycles({ limit: 50, authenticated: true });
  const { guilds } = useGuilds(true);

  // API URL depuis les variables d'environnement
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Fonction utilitaire pour les requêtes authentifiées
  const authenticatedFetch = (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("userToken");
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    });
  };

  // Hooks UI
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const shadowColor = useColorModeValue("lg", "dark-lg");

  // Sélectionner le cycle le plus récent par défaut quand les cycles sont chargés
  useEffect(() => {
    if (!cyclesLoading && cycles.length > 0 && !selectedCycleId) {
      // Trier par date de création décroissante pour avoir le plus récent en premier
      const sortedCycles = [...cycles].sort((a: ICycle, b: ICycle) => {
        if (a.created_at && b.created_at) {
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        }
        return 0;
      });
      
      if (sortedCycles.length > 0) {
        setSelectedCycleId(sortedCycles[0]._id || '');
      }
    }
  }, [cycles, cyclesLoading]);

  const loadPodium = async () => {
    if (!selectedCycleId || !apiUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        cycle_id: selectedCycleId
      });

      // Ajouter guild_id seulement si ce n'est pas "global"
      if (selectedGuildId !== "global") {
        params.append("guild_id", selectedGuildId);
      }

      const response = await authenticatedFetch(
        `${apiUrl}/api/users/podium?${params.toString()}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setPodiumData(data);
      } else {
        setError(data.message || "Erreur lors du chargement du podium");
      }
    } catch (error) {
      console.error("Erreur lors du chargement du podium:", error);
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  // Charger le podium quand les filtres changent
  useEffect(() => {
    if (selectedCycleId) {
      loadPodium();
    }
  }, [selectedCycleId, selectedGuildId]);

  const getRankDisplay = (rank: number) => {
    const medals = {
      1: { emoji: "🥇", color: "yellow", bg: "yellow.50" },
      2: { emoji: "🥈", color: "gray", bg: "gray.50" },
      3: { emoji: "🥉", color: "orange", bg: "orange.50" }
    };

    const medal = medals[rank as keyof typeof medals];

    if (medal) {
      return (
        <HStack spacing={2}>
          <Text fontSize="xl">{medal.emoji}</Text>
          <Badge
            colorScheme={medal.color}
            variant="solid"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
          >
            #{rank}
          </Badge>
        </HStack>
      );
    }

    return (
      <Badge
        variant="outline"
        colorScheme="gray"
        fontSize="sm"
        px={3}
        py={1}
        borderRadius="full"
      >
        #{rank}
      </Badge>
    );
  };

  const renderPlayerCard = (
    player: IPodiumPlayer,
  ) => {
    return (
      <Card key={player.user_id} variant="outline">
        <CardBody p={{ base: 3, md: 4 }}>
            <VStack align="center">
              {getRankDisplay(player.rank)}
              <UserDisplay
                user={{
                  _id: player.user_id,
                  username: player.username,
                  global_name: player.global_name,
                  discord_id: player.discord_id,
                  bbs_name: player.bbs_name,
                  avatar: player.avatar,
                  guilde_id: "",
                  role: "membre"
                }}
                avatarSize="sm"
                textSize="sm"
                rainbowText={player.rank === 1}
              />

              <ScoreBadge
                score={player.averageScore}
              />
              <Text fontSize="sm" color="gray.500">
                {player.totalScores} score
                {player.totalScores > 1 ? "s" : ""}
              </Text>
            </VStack>
        </CardBody>
      </Card>
    );
  };

  const selectedCycle = cycles.find((cycle) => cycle._id === selectedCycleId);
  const selectedGuild = guilds.find((guild) => guild._id === selectedGuildId);

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow={shadowColor}
      p={{ base: 4, md: 6 }}
      w="100%"
      mx="auto"
    >
      <VStack spacing={6} align="stretch">
        {/* En-tête */}
        <VStack spacing={4} textAlign="center">
          <Heading size="lg">🏆 Podium des Joueurs</Heading>
          <Text color="gray.600" fontSize="sm">
            Classement basé sur la moyenne des scores par cycle
          </Text>
        </VStack>

        {/* Filtres */}
        <HStack spacing={4} flexWrap="wrap">
          {/* Sélection du cycle */}
          <VStack align="start" spacing={1} flex={1} minW="200px">
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Cycle
            </Text>
            <Select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              size="sm"
            >
              <option value="">Sélectionner un cycle</option>
              {cycles.map((cycle) => (
                <option key={cycle._id} value={cycle._id}>
                  {cycle.name}
                </option>
              ))}
            </Select>
          </VStack>

          <VStack align="start" spacing={1} flex={1} minW="200px">
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Guilde
            </Text>
            <Select
              value={selectedGuildId}
              onChange={(e) => setSelectedGuildId(e.target.value)}
              size="sm"
            >
              <option value="global">🌍 Global (Toutes les guildes)</option>
              {guilds.map((guild) => (
                <option key={guild._id} value={guild._id}>
                  🏰 {guild.name}
                </option>
              ))}
            </Select>
          </VStack>
        </HStack>

        {/* Informations du filtre actuel */}
        {selectedCycle && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={0} fontSize="sm">
              <Text>
                <strong>Cycle:</strong> {selectedCycle.name}
              </Text>
              <Text>
                <strong>Guilde:</strong>{" "}
                {selectedGuildId === "global" ? "Global" : selectedGuild?.name}
              </Text>
            </VStack>
          </Alert>
        )}

        {/* Contenu du podium */}
        {!selectedCycleId ? (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text>Veuillez sélectionner un cycle pour afficher le podium</Text>
          </Alert>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>{error}</Text>
          </Alert>
        ) : isLoading ? (
          <Flex justify="center" align="center" py={8}>
            <VStack spacing={3}>
              <Spinner size="lg" />
              <Text>Chargement du podium...</Text>
            </VStack>
          </Flex>
        ) : podiumData && podiumData.podium.length > 0 ? (
          <>
            {/* Affichage mobile : toujours en colonne unique */}
            <Box display={{ base: "block", lg: "none" }}>
              <VStack spacing={3} align="stretch">
                {podiumData.podium.map((player) =>
                  renderPlayerCard(player)
                )}
              </VStack>
            </Box>

            {/* Affichage desktop */}
            <Box display={{ base: "none", lg: "block" }}>
              {podiumData.podium.length === 10 &&
              selectedGuildId === "global" ? (
                // 2 colonnes pour 10 joueurs en mode Global seulement
                <HStack spacing={4} align="start">
                  <VStack spacing={3} align="stretch" flex={1}>
                    {podiumData.podium
                      .slice(0, 5)
                      .map((player) => renderPlayerCard(player))}
                  </VStack>
                  <VStack spacing={3} align="stretch" flex={1}>
                    {podiumData.podium
                      .slice(5, 10)
                      .map((player) => renderPlayerCard(player))}
                  </VStack>
                </HStack>
              ) : (
                // Colonne unique
                <VStack spacing={3} align="stretch">
                  {podiumData.podium.map((player) =>
                    renderPlayerCard(player)
                  )}
                </VStack>
              )}
            </Box>
          </>
        ) : (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Text>Aucun score trouvé pour ce cycle</Text>
          </Alert>
        )}

        {/* Stats supplémentaires */}
        {podiumData && selectedCycleId && (
          <Text fontSize="xs" color="gray.500" textAlign="center">
            {podiumData.meta.totalPlayers} joueur
            {podiumData.meta.totalPlayers > 1 ? "s" : ""} au total
          </Text>
        )}
      </VStack>
    </Box>
  );
};
