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
  Heading
} from "@chakra-ui/react";
import type { User } from "../interfaces";
import { getUserAvatarUrl } from "../utils/discord";
import { formatRoleName } from "@/utils/user";

export default function UserPage() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

      <Center mt={5}>Stats à venir...</Center>
    </Container>
  );
}
