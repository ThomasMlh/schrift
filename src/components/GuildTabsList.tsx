import {
  Tabs, TabList, TabPanels, TabPanel, Tab,
  Box, VStack, Text, HStack, Select, IconButton,
  useToast, AlertDialog, AlertDialogBody, AlertDialogContent, 
  AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

type Role = "chef" | "sous-chef" | "membre";

interface GuildTabsListProps {
  editable?: boolean;
}

export type Guild = {
  _id: string;
  name: string;
};

export type Member = {
  _id: string;
  name: string;
  role: Role;
  guilde_id: string;
};

export function GuildTabsList({
  editable = false
}: GuildTabsListProps) {
  // Seulement les hooks essentiels
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [membersByGuild, setMembersByGuild] = useState<Record<string, Member[]>>({});
  const [isDeleteMemberOpen, setIsDeleteMemberOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // API URL depuis les variables d'environnement
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Charger les guildes au montage du composant
  useEffect(() => {
    if (!apiUrl) return;

    fetch(`${apiUrl}/api/guildes`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGuilds(data);
        }
      })
      .catch(() => {
        setGuilds([]);
        toast({
          title: "Erreur",
          description: "Impossible de charger les guildes",
          status: "error",
          duration: 3000,
        });
      });
  }, [apiUrl, toast]);

  // Charger les membres quand les guildes changent
  useEffect(() => {
    if (!apiUrl || guilds.length === 0) return;

    guilds.forEach(guild => {
      fetch(`${apiUrl}/api/guildes/${guild._id}/membres`)
        .then(res => res.json())
        .then(data => {
          setMembersByGuild(prev => ({
            ...prev,
            [guild._id]: Array.isArray(data) ? data : []
          }));
        })
        .catch(() => {
          setMembersByGuild(prev => ({ ...prev, [guild._id]: [] }));
          toast({
            title: "Erreur",
            description: `Impossible de charger les membres de ${guild.name}`,
            status: "error",
            duration: 3000,
          });
        });
    });
  }, [apiUrl, guilds, toast]);

  // Fonction pour recharger les membres
  const loadMembers = () => {
    if (!apiUrl || guilds.length === 0) return;

    guilds.forEach(guild => {
      fetch(`${apiUrl}/api/guildes/${guild._id}/membres`)
        .then(res => res.json())
        .then(data => {
          setMembersByGuild(prev => ({
            ...prev,
            [guild._id]: Array.isArray(data) ? data : []
          }));
        })
        .catch(() => {
          setMembersByGuild(prev => ({ ...prev, [guild._id]: [] }));
          toast({
            title: "Erreur",
            description: `Impossible de recharger les membres de la guilde ${guild.name}`,
            status: "error",
            duration: 3000,
          });
        });
    });
  };

  // Ouvrir la popup de confirmation pour supprimer un membre
  const handleRemoveMember = (member: Member) => {
    setMemberToDelete({ id: member._id, name: member.name });
    setIsDeleteMemberOpen(true);
  };

  // Confirmer la suppression du membre
  const confirmDeleteMember = async () => {
    if (!apiUrl || !memberToDelete) return;

    try {
      const response = await fetch(`${apiUrl}/api/membres/${memberToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        loadMembers();
        toast({
          title: "Membre supprimé",
          description: data.message || "Le membre a été supprimé avec succès",
          status: "success",
          duration: 2000,
        });
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de supprimer le membre",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du membre",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsDeleteMemberOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleRoleChange = async (member: Member, newRole: Role) => {
    if (!apiUrl) return;

    try {
      const response: any = await fetch(`${apiUrl}/api/membres/${member._id}/role`, {
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
          description: data.message || `${member.name} est maintenant ${newRole === "chef" ? "Chef" : newRole === "sous-chef" ? "Sous-Chef" : "Membre"}`,
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

  const handleMoveMember = async (fromGuildId: string, member: Member, toGuildId: string) => {
    if (fromGuildId === toGuildId || !apiUrl) return;

    const targetGuild = guilds.find(g => g._id === toGuildId);

    try {
      const response = await fetch(`${apiUrl}/api/membres/${member._id}/guilde`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guilde_id: toGuildId }),
      });

      const data = await response.json();

      if (response.ok) {
        loadMembers();
        toast({
          title: "Membre déplacé",
          description: data.message || `${member.name} a été déplacé vers ${targetGuild?.name || 'la nouvelle guilde'}`,
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
  const sortMembers = (members: Member[]): Member[] => {
    return [...members].sort((a, b) => {
      // Définir l'ordre de priorité des rôles
      const roleOrder = { chef: 1, "sous-chef": 2, membre: 3 };
      
      // Comparer d'abord par rôle
      const roleComparison = roleOrder[a.role] - roleOrder[b.role];
      if (roleComparison !== 0) {
        return roleComparison;
      }
      
      // Si même rôle, trier par ordre alphabétique
      return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
    });
  };

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
                <Text>
                  {membersByGuild[guild._id]?.length || 0} / 20 membres
                </Text>
              </Box>
              <VStack spacing={4} align="stretch">
                {membersByGuild[guild._id]?.length > 0 ? (
                  sortMembers(membersByGuild[guild._id]).map((member: Member) => (
                    <HStack
                      key={member._id}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      justify="space-between"
                      align="center"
                      bg="gray.50"
                      _dark={{ bg: "gray.700" }}
                    >
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="medium" fontSize="md">
                          {member.name}
                          <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                            [
                            {member.role === "chef"
                              ? "Chef"
                              : member.role === "sous-chef"
                                ? "Sous-Chef"
                                : "Membre"}
                            ]
                          </Text>
                        </Text>
                      </VStack>
                      {editable && (
                        <HStack spacing={2}>
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
                          <IconButton
                            aria-label="Supprimer"
                            icon={<span>🗑️</span>}
                            size="sm"
                            bg="red.500"
                            color="white"
                            _hover={{ bg: "red.600" }}
                            onClick={() => handleRemoveMember(member)}
                          />
                          <Select
                            size="sm"
                            value={guild._id}
                            onChange={e => handleMoveMember(guild._id, member, e.target.value)}
                            width="auto"
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
                      )}
                    </HStack>
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