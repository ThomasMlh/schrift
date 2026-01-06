import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Container,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Box,
  Divider,
  Select
} from "@chakra-ui/react";
import type { IUser, ICycle } from "../interfaces";
import { getUserAvatarUrl } from "../utils/discord";
import { formatRoleName } from "@/utils/user";
import { SEOHead } from "@/components/SEOHead";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";

interface UserStats {
  totalScores: number;
  averageScore: number;
  totalPoints: number;
  allRotations: {
    rotation_id: string;
    rotation_killer: string;
    rotation_attack: string;
    cycle_id: string;
    averageScore: number;
    scoreCount: number;
  }[];
  bestRotation: {
    rotation_id: string;
    rotation_killer: string;
    rotation_attack: string;
    cycle_id: string;
    averageScore: number;
    totalScore: number;
    scoreCount: number;
  } | null;
  worstRotation: {
    rotation_id: string;
    rotation_killer: string;
    rotation_attack: string;
    cycle_id: string;
    averageScore: number;
    totalScore: number;
    scoreCount: number;
  } | null;
  bestScore: {
    score: number;
    rotation_id: string;
    rotation_killer: string;
    rotation_attack: string;
    cycle_id: string;
  };
  worstScore: {
    score: number;
    rotation_id: string;
    rotation_killer: string;
    rotation_attack: string;
    cycle_id: string;
  };
}

export default function UserPage() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<IUser | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [cycles, setCycles] = useState<ICycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // API URL depuis les variables d'environnement
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Fonction pour les requêtes publiques (sans token requis)
  const publicFetch = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  };

  useEffect(() => {
    if (!userId || !apiUrl) {
      setError("ID utilisateur manquant");
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);
        const response = await publicFetch(`${apiUrl}/api/users/${userId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Utilisateur introuvable");
          } else {
            setError("Erreur lors du chargement du profil utilisateur");
          }
          return;
        }

        const { user } = await response.json();
        // Fetch guild_name
        const guildResponse = await publicFetch(
          `${apiUrl}/api/guildes/${user.guilde_id}`
        );
        if (guildResponse.ok) {
          const guildData = await guildResponse.json();
          user.guild_name = guildData.name;
        }

        // Construire l'URL de l'avatar avec le nom d'utilisateur
        const avatarUrl = getUserAvatarUrl(user);

        setUser({
          ...user,
          avatar: avatarUrl || undefined
        });
        setError(null);
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
        setError("Erreur lors du chargement du profil utilisateur");
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil utilisateur",
          status: "error",
          duration: 3000
        });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, apiUrl, toast]);

  useEffect(() => {
    if (!apiUrl) return;

    const loadCycles = async () => {
      try {
        const response = await publicFetch(`${apiUrl}/api/cycles?page=1&limit=100`);
        if (response.ok) {
          const data = await response.json();
          setCycles(data.data || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des cycles:", error);
      }
    };

    loadCycles();
  }, [apiUrl]);

  useEffect(() => {
    if (!user || !apiUrl) return;

    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const url = selectedCycle 
          ? `${apiUrl}/api/users/${userId}/stats?cycle_id=${selectedCycle}`
          : `${apiUrl}/api/users/${userId}/stats`;
        const response = await publicFetch(url);

        if (response.ok) {
          const data = await response.json();
          setStats(data.data.stats);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [user, userId, apiUrl, selectedCycle]);

  if (loading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Chargement du profil...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Utilisateur introuvable
        </Alert>
      </Container>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "chef":
        return "purple";
      case "sous-chef":
        return "blue";
      case "membre":
        return "green";
      default:
        return "gray";
    }
  };

  return (
    <>
      <SEOHead
        title={`${user.bbs_name || user.global_name} - Profil Joueur`}
        description={`Profil de ${user.bbs_name || user.global_name}${user.guild_name ? ` - Guilde ${user.guild_name}` : ''}`}
        url={`https://bbs-schrift.fr/joueur/${userId}`}
        noIndex={true}
      />
      <Container maxW="container.md" py={8}>
        <Card>
          <CardBody>
            <VStack spacing={6} align="center">
            <Avatar
              size="2xl"
              src={user.avatar}
              name={user.bbs_name || user.global_name}
            />

            <VStack spacing={2} textAlign="center">
              <Heading size="lg">{user.bbs_name || user.global_name}</Heading>

              {
                <Text color="gray.500" fontSize="md">
                  {user.global_name}
                </Text>
              }

              {user.guilde_id ? (
                <HStack spacing={2}>
                  <Badge
                    colorScheme={getRoleBadgeColor(user.role || "membre")}
                    variant="solid"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {formatRoleName(user.role)} {user.guild_name}
                  </Badge>
                </HStack>
              ) : (
                <Text fontSize="md" color="gray.500">
                  Aucune guilde
                </Text>
              )}
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      <Card mt={6}>
        <CardBody>
          <HStack spacing={4} align="center">
            <Text fontWeight="semibold">Filtrer par cycle:</Text>
            <Select 
              value={selectedCycle} 
              onChange={(e) => setSelectedCycle(e.target.value)}
              maxW="300px"
              placeholder="Tous les cycles"
            >
              {cycles.map((cycle) => (
                <option key={cycle._id} value={cycle._id}>
                  {cycle.name}
                </option>
              ))}
            </Select>
          </HStack>
        </CardBody>
      </Card>

      {statsLoading ? (
        <Center mt={5}>
          <Spinner />
        </Center>
      ) : stats && stats.totalScores > 0 ? (
        <VStack spacing={6} mt={6}>
          <Card w="full">
            <CardBody>
              <Heading size="md" mb={4}>📊 Statistiques Globales</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Stat>
                  <StatLabel>Total Scores</StatLabel>
                  <StatNumber fontSize="3xl">{stats.totalScores}</StatNumber>
                  <StatHelpText>Participations</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Score Moyen</StatLabel>
                  <StatNumber fontSize="3xl">{Math.round(stats.averageScore).toLocaleString()}</StatNumber>
                  <StatHelpText>Par rotation</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Points Totaux</StatLabel>
                  <StatNumber fontSize="3xl">{stats.totalPoints.toLocaleString()}</StatNumber>
                  <StatHelpText>Cumulés</StatHelpText>
                </Stat>
              </SimpleGrid>
              
              <Divider my={6} />
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box>
                  <Stat>
                    <StatLabel color="green.500">🏆 Meilleur Score</StatLabel>
                    <StatNumber fontSize="2xl" color="green.500">{stats.bestScore.score.toLocaleString()}</StatNumber>
                    <StatHelpText>
                      <HStack spacing={2}>
                        <Text>{stats.bestScore.rotation_killer}</Text>
                        <AttackTypeBadge attackType={stats.bestScore.rotation_attack} />
                      </HStack>
                    </StatHelpText>
                  </Stat>
                </Box>
                <Box>
                  <Stat>
                    <StatLabel color="red.500">📉 Pire Score</StatLabel>
                    <StatNumber fontSize="2xl" color="red.500">{stats.worstScore.score.toLocaleString()}</StatNumber>
                    <StatHelpText>
                      <HStack spacing={2}>
                        <Text>{stats.worstScore.rotation_killer}</Text>
                        <AttackTypeBadge attackType={stats.worstScore.rotation_attack} />
                      </HStack>
                    </StatHelpText>
                  </Stat>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {stats.bestRotation && stats.worstRotation && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
              <Card>
                <CardBody>
                  <Heading size="sm" mb={3} color="green.500">🏆 Meilleure Rotation</Heading>
                  <VStack align="stretch" spacing={2}>
                    <HStack spacing={2}>
                      <Text fontWeight="bold" fontSize="lg">{stats.bestRotation.rotation_killer}</Text>
                      <AttackTypeBadge attackType={stats.bestRotation.rotation_attack} />
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Moyenne:</Text>
                      <Text fontWeight="semibold">{stats.bestRotation.averageScore.toLocaleString()}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Participations:</Text>
                      <Badge>{stats.bestRotation.scoreCount}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Total:</Text>
                      <Text fontWeight="semibold">{stats.bestRotation.totalScore.toLocaleString()}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Heading size="sm" mb={3} color="red.500">📉 Rotation à Améliorer</Heading>
                  <VStack align="stretch" spacing={2}>
                    <HStack spacing={2}>
                      <Text fontWeight="bold" fontSize="lg">{stats.worstRotation.rotation_killer}</Text>
                      <AttackTypeBadge attackType={stats.worstRotation.rotation_attack} />
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Moyenne:</Text>
                      <Text fontWeight="semibold">{stats.worstRotation.averageScore.toLocaleString()}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Participations:</Text>
                      <Badge>{stats.worstRotation.scoreCount}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Total:</Text>
                      <Text fontWeight="semibold">{stats.worstRotation.totalScore.toLocaleString()}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}
        </VStack>
      ) : (
        <Center mt={5}>
          <Box textAlign="center" py={8}>
            <Text fontSize="lg" color="gray.500">Aucune statistique disponible</Text>
            <Text fontSize="sm" color="gray.400" mt={2}>Ce joueur n'a pas encore de scores enregistrés</Text>
          </Box>
        </Center>
      )}
    </Container>
    </>
  );
}
