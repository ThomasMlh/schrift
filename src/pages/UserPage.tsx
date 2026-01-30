import { useParams } from "react-router-dom";
import { useState } from "react";
import {
  Container,
  VStack,
  HStack,
  Text,
  Badge,
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
  Divider
} from "@chakra-ui/react";
import { formatRoleName } from "@/utils/user";
import { SEOHead } from "@/components/SEOHead";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { UserDisplay } from "@/components/ui/UserDisplay";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { useCycles, useUser, useUserStats, useGuild } from "@/hooks/useAPI";

const UserPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [selectedCycle, setSelectedCycle] = useState<string>("");

  // Utilisation des hooks
  const {
    user: userData,
    isLoading: userLoading,
    error: userError
  } = useUser(userId);
  const { guildName, isLoading: guildLoading } = useGuild(userData?.guilde_id);
  const { cycles } = useCycles({ limit: 100, page: 1 });
  const { stats, isLoading: statsLoading } = useUserStats(
    userId,
    selectedCycle
  );

  // Enrichir l'utilisateur avec l'avatar et le nom de guilde
  const user = userData
    ? {
        ...userData,
        guild_name: guildName
      }
    : null;

  const loading = userLoading || guildLoading;
  const error = userError
    ? "Erreur lors du chargement du profil utilisateur"
    : null;

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

  return (
    <>
      <SEOHead
        title={`${user.bbs_name || user.global_name} - Profil Joueur`}
        description={`Profil de ${user.bbs_name || user.global_name}${user.guild_name ? ` - Guilde ${user.guild_name}` : ""}`}
        url={`https://bbs-schrift.fr/joueur/${userId}`}
        noIndex={true}
      />
      <Container maxW="container.md" py={8}>
        <Card>
          <CardBody>
            <VStack spacing={2} align="center">
              <UserDisplay
                user={user}
                avatarSize="2xl"
                direction="column"
                textSize="2xl"
                spacing={4}
              />

              <VStack spacing={2} textAlign="center">
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
              <Box maxW="300px">
                <CycleSelect
                  cycles={cycles}
                  value={selectedCycle}
                  onChange={setSelectedCycle}
                  placeholder="Tous les cycles"
                  allowDeselect={true}
                  valueKey="_id"
                  size="md"
                />
              </Box>
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
                <Heading size="md" mb={4}>
                  📊 Statistiques Globales
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <Stat>
                    <StatLabel>Total Scores</StatLabel>
                    <StatNumber fontSize="3xl">{stats.totalScores}</StatNumber>
                    <StatHelpText>Participations</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Score Moyen</StatLabel>
                    <StatNumber fontSize="3xl">
                      {Math.round(stats.averageScore).toLocaleString()}
                    </StatNumber>
                    <StatHelpText>Par rotation</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Points Totaux</StatLabel>
                    <StatNumber fontSize="3xl">
                      {stats.totalPoints.toLocaleString()}
                    </StatNumber>
                    <StatHelpText>Cumulés</StatHelpText>
                  </Stat>
                </SimpleGrid>

                <Divider my={6} />

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box>
                    <Stat>
                      <StatLabel color="green.500">🏆 Meilleur Score</StatLabel>
                      <StatNumber fontSize="2xl" color="green.500">
                        {stats.bestScore.score.toLocaleString()}
                      </StatNumber>
                      <StatHelpText>
                        <HStack spacing={2}>
                          <Text>{stats.bestScore.rotation_killer}</Text>
                          <AttackTypeBadge
                            attackType={stats.bestScore.rotation_attack}
                          />
                        </HStack>
                      </StatHelpText>
                    </Stat>
                  </Box>
                  <Box>
                    <Stat>
                      <StatLabel color="red.500">📉 Pire Score</StatLabel>
                      <StatNumber fontSize="2xl" color="red.500">
                        {stats.worstScore.score.toLocaleString()}
                      </StatNumber>
                      <StatHelpText>
                        <HStack spacing={2}>
                          <Text>{stats.worstScore.rotation_killer}</Text>
                          <AttackTypeBadge
                            attackType={stats.worstScore.rotation_attack}
                          />
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
                    <Heading size="sm" mb={3} color="green.500">
                      🏆 Meilleure Rotation
                    </Heading>
                    <VStack align="stretch" spacing={2}>
                      <HStack spacing={2}>
                        <Text fontWeight="bold" fontSize="lg">
                          {stats.bestRotation.rotation_killer}
                        </Text>
                        <AttackTypeBadge
                          attackType={stats.bestRotation.rotation_attack}
                        />
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">
                          Moyenne:
                        </Text>
                        <Text fontWeight="semibold">
                          {stats.bestRotation.averageScore.toLocaleString()}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">
                          Participations:
                        </Text>
                        <Badge>{stats.bestRotation.scoreCount}</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">
                          Total:
                        </Text>
                        <Text fontWeight="semibold">
                          {stats.bestRotation.totalScore.toLocaleString()}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <Heading size="sm" mb={3} color="red.500">
                      📉 Rotation à Améliorer
                    </Heading>
                    <VStack align="stretch" spacing={2}>
                      <HStack spacing={2}>
                        <Text fontWeight="bold" fontSize="lg">
                          {stats.worstRotation.rotation_killer}
                        </Text>
                        <AttackTypeBadge
                          attackType={stats.worstRotation.rotation_attack}
                        />
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">
                          Moyenne:
                        </Text>
                        <Text fontWeight="semibold">
                          {stats.worstRotation.averageScore.toLocaleString()}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">
                          Participations:
                        </Text>
                        <Badge>{stats.worstRotation.scoreCount}</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">
                          Total:
                        </Text>
                        <Text fontWeight="semibold">
                          {stats.worstRotation.totalScore.toLocaleString()}
                        </Text>
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
              <Text fontSize="lg" color="gray.500">
                Aucune statistique disponible
              </Text>
              <Text fontSize="sm" color="gray.400" mt={2}>
                Ce joueur n'a pas encore de scores enregistrés
              </Text>
            </Box>
          </Center>
        )}
      </Container>
    </>
  );
};

export default UserPage;
