import {
  VStack,
  HStack,
  Box,
  Text,
  IconButton,
  Card,
  CardBody,
  useColorModeValue,
  Badge
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { UserSearchSelect } from "../ui/UserSearchSelect";
import { UserDisplay } from "../ui/UserDisplay";
import type { IUser } from "@/interfaces";

interface SelectedPlayer {
  id: string;
  user: IUser;
}

interface MultiPlayerSelectorProps {
  selectedPlayers: SelectedPlayer[];
  onAddPlayer: (userId: string, user: IUser) => void;
  onRemovePlayer: (id: string) => void;
  maxPlayers?: number;
  availableUsers: IUser[];
}

export const MultiPlayerSelector = ({
  selectedPlayers,
  onAddPlayer,
  onRemovePlayer,
  maxPlayers = 5,
  availableUsers
}: MultiPlayerSelectorProps) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
    const bgColor = useColorModeValue("gray.50", "gray.700");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const handleUserSelect = (userId: string) => {
    const user = availableUsers.find((u) => u._id === userId);
    if (user && selectedPlayers.length < maxPlayers) {
      onAddPlayer(userId, user);
      setSelectedUserId("");
      setSearchQuery("");
    }
  };

  const availableUsersFiltered = availableUsers.filter(
    (user) => !selectedPlayers.some((p) => p.id === user._id)
  );

  return (
    <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Text fontSize="lg" fontWeight="bold">
                👥 Joueurs sélectionnés
              </Text>
              <Badge colorScheme="blue" fontSize="sm">
                {selectedPlayers.length}/{maxPlayers}
              </Badge>
            </HStack>
          </HStack>

          {/* Liste des joueurs sélectionnés */}
          <VStack spacing={3} align="stretch">
            {selectedPlayers.map((player, index) => (
              <Box
                key={player.id}
                p={3}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                bg={bgColor}
                transition="all 0.2s"
                _hover={{
                  borderColor: "blue.400",
                  transform: "translateX(4px)"
                }}
              >
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Badge colorScheme="purple" fontSize="sm">
                      #{index + 1}
                    </Badge>
                    <UserDisplay
                      user={player.user}
                      avatarSize="sm"
                      textSize="sm"
                    />
                  </HStack>
                  <IconButton
                    icon={<CloseIcon />}
                    aria-label="Retirer le joueur"
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => onRemovePlayer(player.id)}
                  />
                </HStack>
              </Box>
            ))}

            {selectedPlayers.length === 0 && (
              <Box
                p={6}
                textAlign="center"
                borderRadius="lg"
                borderWidth="2px"
                borderStyle="dashed"
                borderColor={borderColor}
              >
                <Text color="gray.500" fontSize="sm">
                  Aucun joueur sélectionné
                </Text>
                <Text color="gray.400" fontSize="xs" mt={1}>
                  Ajoutez jusqu'à {maxPlayers} joueurs pour comparer
                </Text>
              </Box>
            )}
          </VStack>

          {/* Sélecteur d'ajout */}
          {selectedPlayers.length < maxPlayers && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
                Ajouter un joueur
              </Text>
              <UserSearchSelect
                users={availableUsersFiltered}
                selectedUserId={selectedUserId}
                onUserSelect={handleUserSelect}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Rechercher un joueur..."
              />
            </Box>
          )}

          {selectedPlayers.length >= maxPlayers && (
            <Text fontSize="xs" color="orange.500" textAlign="center">
              ⚠️ Limite de {maxPlayers} joueurs atteinte
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};
