import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Flex,
  Spinner,
  useColorModeValue,
  Alert,
  AlertIcon,
  Stack
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { UserDisplay } from "./ui/UserDisplay";
import { ScoreBadge } from "./ui/ScoreBadge";
import { RankBadge } from "./ui/RankBadge";
import { CycleSelect } from "./ui/CycleSelect";
import { CustomSelect } from "./ui/CustomSelect";
import type { ICycle, IPodiumPlayer } from "@/interfaces";
import { useCycles, useGuilds, usePodium } from "@/hooks/useAPI";

export const PodiumSection: React.FC = () => {
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [selectedGuildId, setSelectedGuildId] = useState<string>("global");

  // Utilisation de useSWR pour les cycles et guildes (cache automatique + déduplication)
  const { cycles, isLoading: cyclesLoading } = useCycles({ limit: 50, authenticated: true });
  const { guilds } = useGuilds(true);

  // Utilisation du hook usePodium pour charger les données du podium
  const { podium, meta, isLoading, error } = usePodium({
    cycle_id: selectedCycleId,
    guild_id: selectedGuildId !== "global" ? selectedGuildId : undefined,
    authenticated: true,
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycles, cyclesLoading]);

  const renderPlayerCard = (
    player: IPodiumPlayer,
  ) => {
    return (
      <Card key={player.user_id} variant="outline">
        <CardBody p={{ base: 3, md: 4 }}>
            <VStack align="center">
              <RankBadge rank={player.rank} variant="with-emoji-separated" />
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
        <Stack direction={{ base: "column", md: "row" }} spacing={3} align="stretch">
          {/* Sélection du cycle */}
          <Box flex={1}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
              Cycle
            </Text>
            <CycleSelect
              cycles={cycles}
              value={selectedCycleId}
              onChange={setSelectedCycleId}
              placeholder="Sélectionner un cycle"
              allowDeselect={true}
              size="sm"
            />
          </Box>

          {/* Sélection de la guilde */}
          <Box flex={1}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
              Guilde
            </Text>
            <CustomSelect
              value={selectedGuildId}
              onChange={setSelectedGuildId}
              options={[
                { value: "global", label: "🌍 Global (Toutes les guildes)" },
                ...guilds.map((guild) => ({
                  value: guild._id,
                  label: `🏰 ${guild.name}`
                }))
              ]}
              placeholder="Sélectionner une guilde"
              allowDeselect={false}
              size="sm"
            />
          </Box>
        </Stack>

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
            <Text>{error instanceof Error ? error.message : String(error)}</Text>
          </Alert>
        ) : isLoading ? (
          <Flex justify="center" align="center" py={8}>
            <VStack spacing={3}>
              <Spinner size="lg" />
              <Text>Chargement du podium...</Text>
            </VStack>
          </Flex>
        ) : podium && podium.length > 0 ? (
          <>
            {/* Affichage mobile : toujours en colonne unique */}
            <Box display={{ base: "block", lg: "none" }}>
              <VStack spacing={3} align="stretch">
                {podium.map((player) =>
                  renderPlayerCard(player)
                )}
              </VStack>
            </Box>

            {/* Affichage desktop */}
            <Box display={{ base: "none", lg: "block" }}>
              {podium.length === 10 &&
              selectedGuildId === "global" ? (
                // 2 colonnes pour 10 joueurs en mode Global seulement
                <HStack spacing={4} align="start">
                  <VStack spacing={3} align="stretch" flex={1}>
                    {podium
                      .slice(0, 5)
                      .map((player) => renderPlayerCard(player))}
                  </VStack>
                  <VStack spacing={3} align="stretch" flex={1}>
                    {podium
                      .slice(5, 10)
                      .map((player) => renderPlayerCard(player))}
                  </VStack>
                </HStack>
              ) : (
                // Colonne unique
                <VStack spacing={3} align="stretch">
                  {podium.map((player) =>
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
        {meta && selectedCycleId && (
          <Text fontSize="xs" color="gray.500" textAlign="center">
            {meta.totalPlayers} joueur
            {meta.totalPlayers > 1 ? "s" : ""} au total
          </Text>
        )}
      </VStack>
    </Box>
  );
};
