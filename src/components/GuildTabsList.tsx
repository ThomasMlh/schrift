import {
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Box,
  VStack,
  Text,
  HStack,
  Stack,
  Select,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useBreakpointValue,
  useColorModeValue
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import type { Role, IGuild, IUser } from "../interfaces";
import { UserDisplay } from "./ui/UserDisplay";
import { useGuilds } from "@/hooks/useAPI";
import { useAPIMutations } from "@/hooks/useAPIMutations";
import { useAuth } from "@/providers/AuthProvider";

interface GuildTabsListProps {
  editable?: boolean;
  refreshTrigger?: number;
}

const GuildTabsList: React.FC<GuildTabsListProps> = ({
  editable = false,
  refreshTrigger = 0
}) => {
  const { getAuthHeaders } = useAuth();
  const { updateUserRole, moveUserToGuild, removeGuildMember } = useAPIMutations();
  // Utiliser useSWR pour les guildes (cache automatique + déduplication)
  const { guilds, mutate: mutateGuilds } = useGuilds(true);
  
  // États
  const [membersByGuild, setMembersByGuild] = useState<Record<string, IUser[]>>(
    {}
  );
  const [isDeleteMemberOpen, setIsDeleteMemberOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string;
    name: string;
    guildId: string;
  } | null>(null);
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const orientation =
    useBreakpointValue<"vertical" | "horizontal">({
      base: "vertical",
      md: "horizontal"
    }) || "horizontal";

  // API URL depuis les variables d'environnement
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const shadowColor = useColorModeValue("lg", "dark-lg");

  // Charger les membres quand les guildes changent
  useEffect(() => {
    if (!apiUrl || guilds.length === 0) return;

    guilds.forEach((guild) => {
      fetch(`${apiUrl}/api/guildes/${guild._id}/membres`, {
        headers: getAuthHeaders()
      })
        .then((res) => res.json())
        .then((data) => {
          // L'API retourne { success: true, membres: [...], count: number } ou { success: true, data: [...], count: number }
          const membersList = data.data || data;
          const members = Array.isArray(membersList) ? membersList : [];

          setMembersByGuild((prev) => {
            const updated = {
              ...prev,
              [guild._id]: members
            };
            return updated;
          });
        })
        .catch((error) => {
          setMembersByGuild((prev) => ({ ...prev, [guild._id]: [] }));
          toast({
            title: "Erreur",
            description:
              error.message ||
              `Impossible de recharger les membres de la guilde ${guild.name}`,
            status: "error",
            duration: 3000
          });
        });
    });
  }, [apiUrl, guilds, toast, getAuthHeaders]);

  // Réagir aux changements externes (quand une guilde est modifiée depuis AdminPage)
  useEffect(() => {
    if (refreshTrigger > 0) {
      // Recharger les guildes avec mutate
      mutateGuilds();
    }
  }, [refreshTrigger, mutateGuilds]);

  // Fonction pour recharger les membres
  const loadMembers = () => {
    if (!apiUrl || guilds.length === 0) return;

    guilds.forEach((guild) => {
      fetch(`${apiUrl}/api/guildes/${guild._id}/membres`, {
        headers: getAuthHeaders()
      })
        .then((res) => res.json())
        .then((data) => {
          // L'API retourne { success: true, membres: [...], count: number } ou { success: true, data: [...], count: number }
          const membersList = data.data || data;
          const members = Array.isArray(membersList) ? membersList : [];

          setMembersByGuild((prev) => ({
            ...prev,
            [guild._id]: members
          }));
        })
        .catch((error) => {
          setMembersByGuild((prev) => ({ ...prev, [guild._id]: [] }));
          toast({
            title: "Erreur",
            description:
              error instanceof Error
                ? error.message
                : `Impossible de recharger les membres de la guilde ${guild.name}`,
            status: "error",
            duration: 3000
          });
        });
    });
  };

  // Ouvrir la popup de confirmation pour supprimer un membre
  const handleRemoveMember = (member: IUser, guildId: string) => {
    setMemberToDelete({
      id: member._id,
      name: member.global_name || member.username,
      guildId: guildId
    });
    setIsDeleteMemberOpen(true);
  };

  // Confirmer la suppression du membre
  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      await removeGuildMember(memberToDelete.guildId, memberToDelete.id);

      loadMembers();
      toast({
        title: "Membre supprimé",
        description: "Le membre a été supprimé avec succès",
        status: "success",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression du membre",
        status: "error",
        duration: 3000
      });
    } finally {
      setIsDeleteMemberOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleRoleChange = async (member: IUser, newRole: Role) => {
    try {
      await updateUserRole(member._id, newRole);

      loadMembers();
      toast({
        title: "Rôle modifié",
        description: `${member.username} est maintenant ${
          newRole === "chef"
            ? "Chef"
            : newRole === "sous-chef"
            ? "Sous-Chef"
            : "Membre"
        }`,
        status: "success",
        duration: 2000
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la modification du rôle";
      toast({
        title: "Erreur",
        description: errorMessage,
        status: "error",
        duration: 3000
      });
    }
  };

  const handleMoveMember = async (
    fromGuildId: string,
    member: IUser,
    toGuildId: string
  ) => {
    if (fromGuildId === toGuildId || !apiUrl) return;

    const targetGuild = guilds.find((g) => g._id === toGuildId);

    try {
      await moveUserToGuild(member._id, toGuildId);

      loadMembers();
      toast({
        title: "Membre déplacé",
        description: `${member.username} a été déplacé vers ${
          targetGuild?.name || "la nouvelle guilde"
        }`,
        status: "success",
        duration: 2000
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du déplacement du membre";
      toast({
        title: "Erreur",
        description: errorMessage,
        status: "error",
        duration: 3000
      });
    }
  };

  // Fonction pour trier les membres : chef > sous-chefs > membres, puis alphabétique
  const sortMembers = (members: IUser[]): IUser[] => {
    return [...members].sort((a, b) => {
      // Définir l'ordre de priorité des rôles
      const roleOrder = { chef: 1, "sous-chef": 2, membre: 3 };

      // Comparer d'abord par rôle
      const roleComparison = roleOrder[a.role] - roleOrder[b.role];
      if (roleComparison !== 0) {
        return roleComparison;
      }

      // Si même rôle, trier par ordre alphabétique
      return a.username.localeCompare(b.username, "fr", {
        sensitivity: "base"
      });
    });
  };

  if (guilds.length === 0 || !guilds) {
    return (
      <Text color="gray.500" textAlign="center" py={8}>
        Aucune guilde disponible.
      </Text>
    );
  }

  return (
    <Tabs
      isFitted
      variant="enclosed"
      colorScheme="white"
      w="100%"
      borderWidth="1px"
      borderTopLeftRadius="md"
      borderTopRightRadius="md"
      borderBottomLeftRadius="0"
      borderBottomRightRadius="0"
      orientation={orientation}
      boxShadow={shadowColor}
    >
      <TabList>
        {guilds.map((guild: IGuild) => (
          <Tab
            key={guild._id}
            // _focus={{ boxShadow: 'none' }}
            // _focusVisible={{ boxShadow: 'outline' }}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
          >
            Ṣčhrīft {guild.name}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {guilds.map((guild: IGuild) => (
          <TabPanel key={guild._id} px={0}>
            <Box
              borderRadius="md"
              borderTopRadius="0"
              bg="white"
              _dark={{ bg: "gray.800" }}
              maxH="60vh"
              overflowY="auto"
              p={3}
            >
              <Box p={4}>
                <Text fontSize="xs" color="gray.500">
                  {membersByGuild[guild._id]?.length || 0} / 20 membres
                </Text>
              </Box>
              <VStack spacing={4} align="stretch">
                {membersByGuild[guild._id]?.length > 0 ? (
                  sortMembers(membersByGuild[guild._id]).map(
                    (member: IUser) => (
                      <Stack
                        key={member._id}
                        direction={{ base: "column", md: "row" }}
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        justify="space-between"
                        align={{ base: "stretch", md: "center" }}
                        bg="gray.50"
                        _dark={{ bg: "gray.700" }}
                        spacing={3}
                      >
                        <VStack align="start" spacing={1} flex={1}>
                          <UserDisplay user={member} roleBadge />
                        </VStack>
                        {editable && (
                          <Stack
                            direction={{ base: "column", md: "row" }}
                            spacing={2}
                            w={{ base: "100%", md: "auto" }}
                          >
                            <Select
                              size="sm"
                              value={member.role}
                              width="auto"
                              onChange={(e) =>
                                handleRoleChange(member, e.target.value as Role)
                              }
                            >
                              <option value="membre">Membre</option>
                              <option value="sous-chef">Sous-Chef</option>
                              <option value="chef">Chef</option>
                            </Select>
                            <HStack
                              spacing={2}
                              justify={{
                                base: "space-between",
                                md: "flex-start"
                              }}
                            >
                              <IconButton
                                aria-label="Supprimer"
                                icon={<span>🗑️</span>}
                                size="sm"
                                bg="red.500"
                                color="white"
                                _hover={{ bg: "red.600" }}
                                onClick={() =>
                                  handleRemoveMember(member, guild._id)
                                }
                              />
                              <Select
                                size="sm"
                                value={guild._id}
                                onChange={(e) =>
                                  handleMoveMember(
                                    guild._id,
                                    member,
                                    e.target.value
                                  )
                                }
                                width="auto"
                                flex={1}
                              >
                                <option value={guild._id}>Rester</option>
                                {guilds
                                  .filter(
                                    (g: IGuild) =>
                                      g._id !== guild._id &&
                                      (membersByGuild[g._id]?.length ?? 0) < 20
                                  )
                                  .map((g: IGuild) => (
                                    <option key={g._id} value={g._id}>
                                      → {g.name}
                                    </option>
                                  ))}
                              </Select>
                            </HStack>
                          </Stack>
                        )}
                      </Stack>
                    )
                  )
                ) : (
                  <Text color="gray.500" textAlign="center" py={8}>
                    Aucun membre dans cette guilde
                  </Text>
                )}
              </VStack>
            </Box>
          </TabPanel>
        ))}
      </TabPanels>

      {/* Popup de confirmation pour la suppression */}
      <AlertDialog
        isOpen={isDeleteMemberOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          setIsDeleteMemberOpen(false);
          setMemberToDelete(null);
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Confirmer la suppression</AlertDialogHeader>
            <AlertDialogBody>
              Êtes-vous sûr de vouloir supprimer le membre "
              {memberToDelete?.name}" ? Cette action est irréversible.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  setIsDeleteMemberOpen(false);
                  setMemberToDelete(null);
                }}
              >
                Annuler
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteMember} ml={3}>
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Tabs>
  );
};

export { GuildTabsList };
