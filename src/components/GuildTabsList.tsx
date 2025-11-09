import {
  Tabs, TabList, TabPanels, TabPanel, Tab,
  Box, VStack, Text, HStack, Stack, Select, IconButton,
  useToast, AlertDialog, AlertDialogBody, AlertDialogContent, 
  AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button,
  useBreakpointValue
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import type { Role, Guild, User } from "../interfaces";
import { UserDisplay } from "./ui/UserDisplay";

interface GuildTabsListProps {
  editable?: boolean;
  refreshTrigger?: number;
}

const GuildTabsList = ({
  editable = false,
  refreshTrigger = 0
}: GuildTabsListProps) => {
  // Seulement les hooks essentiels
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [membersByGuild, setMembersByGuild] = useState<Record<string, User[]>>({});
  const [isDeleteMemberOpen, setIsDeleteMemberOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string; guildId: string } | null>(null);
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const orientation = useBreakpointValue<"vertical" | "horizontal">({ base: 'vertical', md: 'horizontal' }) || 'horizontal';

  // API URL depuis les variables d'environnement
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Fonction utilitaire pour les requêtes authentifiées
  const authenticatedFetch = (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('userToken');
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });
  };

  // Charger les guildes au montage du composant
  useEffect(() => {
    if (!apiUrl) return;

    authenticatedFetch(`${apiUrl}/api/guildes`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGuilds(data);
        }
      })
      .catch((error) => {
        setGuilds([]);
        toast({
          title: "Erreur",
          description: error.message || "Impossible de charger les guildes",
          status: "error",
          duration: 3000,
        });
      });
  }, [apiUrl, toast]);

  // Charger les membres quand les guildes changent
  useEffect(() => {
    if (!apiUrl || guilds.length === 0) return;

    guilds.forEach(guild => {
      authenticatedFetch(`${apiUrl}/api/guildes/${guild._id}/membres`)
        .then(res => res.json())
        .then(data => {
          // L'API retourne { success: true, membres: [...], count: number } ou { success: true, data: [...], count: number }
          const membersList = data.data || data;
          const members = Array.isArray(membersList) ? membersList : [];
          
          setMembersByGuild(prev => {
            const updated = {
              ...prev,
              [guild._id]: members
            };
            return updated;
          });
        })
        .catch((error) => {
          setMembersByGuild(prev => ({ ...prev, [guild._id]: [] }));
          toast({
            title: "Erreur",
            description: error.message || `Impossible de recharger les membres de la guilde ${guild.name}`,
            status: "error",
            duration: 3000,
          });
        });
    });
  }, [apiUrl, guilds, toast]);

  // Réagir aux changements externes (quand une guilde est modifiée depuis AdminPage)
  useEffect(() => {
    if (refreshTrigger > 0 && apiUrl) {
      // Recharger les guildes
      authenticatedFetch(`${apiUrl}/api/guildes`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setGuilds(data);
          }
        })
        .catch(error => {
          toast({
            title: "Erreur",
            description: error.message || "Impossible de recharger les guildes",
            status: "error",
            duration: 3000,
          });
        });
    }
  }, [refreshTrigger, apiUrl, toast]);

  // Fonction pour recharger les membres
  const loadMembers = () => {
    if (!apiUrl || guilds.length === 0) return;

    guilds.forEach(guild => {
      authenticatedFetch(`${apiUrl}/api/guildes/${guild._id}/membres`)
        .then(res => res.json())
        .then(data => {
          // L'API retourne { success: true, membres: [...], count: number } ou { success: true, data: [...], count: number }
          const membersList = data.data || data;
          const members = Array.isArray(membersList) ? membersList : [];
          
          setMembersByGuild(prev => ({
            ...prev,
            [guild._id]: members
          }));
        })
        .catch(error => {
          setMembersByGuild(prev => ({ ...prev, [guild._id]: [] }));
          toast({
            title: "Erreur",
            description: error instanceof Error ? error.message : `Impossible de recharger les membres de la guilde ${guild.name}`,
            status: "error",
            duration: 3000,
          });
        });
    });
  };

  // Ouvrir la popup de confirmation pour supprimer un membre
  const handleRemoveMember = (member: User, guildId: string) => {
    setMemberToDelete({ id: member._id, name: member.global_name || member.username, guildId: guildId });
    setIsDeleteMemberOpen(true);
  };

  // Confirmer la suppression du membre
  const confirmDeleteMember = async () => {
    if (!apiUrl || !memberToDelete) return;

    try {
      const response = await authenticatedFetch(`${apiUrl}/api/guildes/${memberToDelete.guildId}/membres/${memberToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        loadMembers();
        toast({
          title: "Membre supprimé",
          description: data.message,
          status: "success",
          duration: 2000,
        });
      } else {
        toast({
          title: "Erreur",
          description: data.message,
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression du membre",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsDeleteMemberOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleRoleChange = async (member: User, newRole: Role) => {
    if (!apiUrl) return;

    try {
      const response: any = await authenticatedFetch(`${apiUrl}/api/users/${member._id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (response.ok) {
        loadMembers();
        toast({
          title: "Rôle modifié",
          description: data.message || `${member.username} est maintenant ${newRole === "chef" ? "Chef" : newRole === "sous-chef" ? "Sous-Chef" : "Membre"}`,
          status: "success",
          duration: 2000,
        });
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de modifier le rôle",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification du rôle",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleMoveMember = async (fromGuildId: string, member: User, toGuildId: string) => {
    if (fromGuildId === toGuildId || !apiUrl) return;

    const targetGuild = guilds.find(g => g._id === toGuildId);

    try {
      const response = await authenticatedFetch(`${apiUrl}/api/users/${member._id}/guild`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guildeId: toGuildId }),
      });

      const data = await response.json();

      if (response.ok) {
        loadMembers();
        toast({
          title: "Membre déplacé",
          description: data.message || `${member.username} a été déplacé vers ${targetGuild?.name || 'la nouvelle guilde'}`,
          status: "success",
          duration: 2000,
        });
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de déplacer le membre",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du déplacement du membre",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Fonction pour trier les membres : chef > sous-chefs > membres, puis alphabétique
  const sortMembers = (members: User[]): User[] => {
    return [...members].sort((a, b) => {
      // Définir l'ordre de priorité des rôles
      const roleOrder = { chef: 1, "sous-chef": 2, membre: 3 };
      
      // Comparer d'abord par rôle
      const roleComparison = roleOrder[a.role] - roleOrder[b.role];
      if (roleComparison !== 0) {
        return roleComparison;
      }
      
      // Si même rôle, trier par ordre alphabétique
      return a.username.localeCompare(b.username, 'fr', { sensitivity: 'base' });
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
      variant='enclosed'
      colorScheme="white"
      w="80%"
      borderWidth="1px"
      p={2}
      borderTopLeftRadius="md"
      borderTopRightRadius="md"
      borderBottomLeftRadius="0"
      borderBottomRightRadius="0"
      orientation={orientation}
    >
      <TabList>
        {guilds.map((guild: Guild) => (
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

        {guilds.map((guild: Guild) => (
          <TabPanel key={guild._id} px={0}>
            <Box
              borderRadius="md"
              borderTopRadius="0"
              bg="white"
              _dark={{ bg: "gray.800" }}
              boxShadow="md"
              maxH="60vh"
              overflowY="auto"
            >
              <Box p={4}>
                <Text fontSize="xs" color="gray.500">
                  {membersByGuild[guild._id]?.length || 0} / 20 membres
                </Text>
              </Box>
              <VStack spacing={4} align="stretch">
                {membersByGuild[guild._id]?.length > 0 ? (
                  sortMembers(membersByGuild[guild._id]).map((member: User) => (
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
                          <UserDisplay user={member} roleBadge/>
                      </VStack>
                      {editable && (
                        <Stack direction={{ base: "column", md: "row" }} spacing={2} w={{ base: "100%", md: "auto" }}>
                          <Select
                            size="sm"
                            value={member.role}
                            width="auto"
                            onChange={e => handleRoleChange(member, e.target.value as Role)}
                          >
                            <option value="membre">Membre</option>
                            <option value="sous-chef">Sous-Chef</option>
                            <option value="chef">Chef</option>
                          </Select>
                          <HStack spacing={2} justify={{ base: "space-between", md: "flex-start" }}>
                            <IconButton
                              aria-label="Supprimer"
                              icon={<span>🗑️</span>}
                              size="sm"
                              bg="red.500"
                              color="white"
                              _hover={{ bg: "red.600" }}
                              onClick={() => handleRemoveMember(member, guild._id)}
                            />
                            <Select
                              size="sm"
                              value={guild._id}
                              onChange={e => handleMoveMember(guild._id, member, e.target.value)}
                              width="auto"
                              flex={1}
                            >
                              <option value={guild._id}>Rester</option>
                              {guilds
                                .filter((g: Guild) => g._id !== guild._id && (membersByGuild[g._id]?.length ?? 0) < 20)
                                .map((g: Guild) => (
                                  <option key={g._id} value={g._id}>
                                    → {g.name}
                                  </option>
                                ))}
                            </Select>
                          </HStack>
                        </Stack>
                      )}
                    </Stack>
                  ))
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
              Êtes-vous sûr de vouloir supprimer le membre "{memberToDelete?.name}" ? Cette action est irréversible.
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
              <Button 
                colorScheme="red" 
                onClick={confirmDeleteMember} 
                ml={3}
              >
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Tabs>
  );
}

export { GuildTabsList };