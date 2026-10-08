import {
  VStack,
  HStack,
  Box,
  Text,
  IconButton,
  useColorModeValue,
  useColorMode,
  Badge,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserSearchSelect } from "../ui/UserSearchSelect";
import { UserDisplay } from "../ui/UserDisplay";
import type { IUser, IGuild } from "@/interfaces";

const DEFAULT_COLORS = ["#3182CE", "#38A169", "#DD6B20", "#9F7AEA", "#E53E3E"];

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
  entityColors?: string[];
  onSearchChange?: (query: string) => void;
  guilds?: IGuild[];
}

export const MultiPlayerSelector = ({
  selectedPlayers,
  onAddPlayer,
  onRemovePlayer,
  maxPlayers = 5,
  availableUsers,
  entityColors = DEFAULT_COLORS,
  onSearchChange,
  guilds = [],
}: MultiPlayerSelectorProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = "bg.card";
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = "text.muted";
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    onSearchChange?.(q);
  };
  const [selectedUserId, setSelectedUserId] = useState("");
  const { t } = useTranslation();

  // availableUsers liste des comptes bbs (pas des users) : un joueur avec plusieurs comptes y
  // apparaît une fois par compte, chacun avec son propre bbs_id — c'est ce bbs_id qui sert de
  // clé de sélection (deux comptes d'un même joueur partagent le même _id user).
  const handleUserSelect = (bbsId: string) => {
    const user = availableUsers.find((u) => u.bbs_id === bbsId);
    if (user && selectedPlayers.length < maxPlayers) {
      onAddPlayer(bbsId, user);
      setSelectedUserId("");
      setSearchQuery("");
    }
  };

  const availableUsersFiltered = availableUsers.filter(
    (user) => !selectedPlayers.some((p) => p.id === user.bbs_id)
  );

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      p={4}
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color={mutedText}>
            {t("components.multiPlayerSelector.heading")}
          </Text>
          <Badge
            colorScheme={selectedPlayers.length >= maxPlayers ? "red" : "blue"}
            variant="subtle"
            fontSize="xs"
            borderRadius="full"
          >
            {selectedPlayers.length}/{maxPlayers}
          </Badge>
        </HStack>

        {/* Selected players */}
        <VStack spacing={2} align="stretch">
          {selectedPlayers.map((player, index) => {
            const color = entityColors[index % entityColors.length];
            return (
              <Box
                key={player.id}
                px={3}
                py={2}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                borderLeftWidth="3px"
                borderLeftColor={color}
                bg={isDark ? "rgba(255,255,255,0.03)" : "gray.50"}
                transition="all 0.15s ease"
                _hover={{ transform: "translateX(3px)", borderColor }}
              >
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Box w={2} h={2} borderRadius="full" bg={color} flexShrink={0} />
                    <UserDisplay user={player.user} avatarSize="sm" textSize="sm" />
                  </HStack>
                  <IconButton
                    icon={<CloseIcon boxSize={2.5} />}
                    aria-label={t("components.multiPlayerSelector.ariaRemove")}
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => onRemovePlayer(player.id)}
                  />
                </HStack>
              </Box>
            );
          })}

          {selectedPlayers.length === 0 && (
            <Box
              p={5}
              textAlign="center"
              borderRadius="lg"
              borderWidth="2px"
              borderStyle="dashed"
              borderColor={borderColor}
            >
              <Text color={mutedText} fontSize="sm">
                {t("components.multiPlayerSelector.empty")}
              </Text>
              <Text color={mutedText} fontSize="xs" mt={1} opacity={0.7}>
                {t("components.multiPlayerSelector.emptyHint", { max: maxPlayers })}
              </Text>
            </Box>
          )}
        </VStack>

        {/* Add player */}
        {selectedPlayers.length < maxPlayers && (
          <Box>
            <Text fontSize="xs" fontWeight="medium" mb={2} color={mutedText}>
              {t("components.multiPlayerSelector.addLabel")}
            </Text>
            <UserSearchSelect
              users={availableUsersFiltered}
              selectedUserId={selectedUserId}
              onUserSelect={handleUserSelect}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              placeholder={t("components.multiPlayerSelector.searchPlaceholder")}
              guilds={guilds}
              getItemId={(u) => u.bbs_id || u._id || ''}
            />
          </Box>
        )}

        {selectedPlayers.length >= maxPlayers && (
          <Text fontSize="xs" color="orange.400" textAlign="center">
            {t("components.multiPlayerSelector.limitReached", { max: maxPlayers })}
          </Text>
        )}
      </VStack>
    </Box>
  );
};
