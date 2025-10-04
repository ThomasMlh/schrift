import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Container, Flex, FormControl, FormLabel, Heading, Input, Select, Stack, Text, useColorModeValue, useToast, VStack } from "@chakra-ui/react";
import { GuildTabsList, type Guild, type Member } from "../components/ui/GuildTabsList";
import { useEffect, useRef, useState } from "react";
import type { Role } from "@/interfaces";

const ADMIN_PASSWORD = "schrift2025";

export default function AdminPage() {
  // Création guilde UI state
  const [newGuildName, setNewGuildName] = useState("");
  // Suppression guilde UI state
  const [deleteGuildId, setDeleteGuildId] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  // Supprimer une guilde (avec vérification)
  const handleDeleteGuild = (guildId: string) => {
    const members = membersByGuild[guildId] || [];
    if (members.length > 0) {
      toast({ title: "Impossible de supprimer une guilde non vide.", status: "error" });
      return;
    }
    fetch(`${apiUrl}/api/guildes/${guildId}`, {
      method: "DELETE"
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de la suppression");
        return res.json();
      })
      .then(() => {
        // Recharge la liste des guildes
        fetch(`${apiUrl}/api/guildes`)
          .then(res => res.json())
          .then(data => {
            setGuilds(Array.isArray(data) ? data : []);
            toast({ title: "Guilde supprimée", status: "success" });
          });
      })
      .catch(() => {
        toast({ title: "Erreur lors de la suppression", status: "error" });
      });
  };
  // TOUS les hooks en haut, aucun return avant
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<Role>("membre");
  const [selectedGuildId, setSelectedGuildId] = useState("A");
  const [renameGuildId, setRenameGuildId] = useState("");
  const [renameGuildName, setRenameGuildName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isRenameConfirmOpen, setIsRenameConfirmOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  // TOUS les useColorModeValue ici
  const bgColor = useColorModeValue('white', 'gray.800');
  const boxShadow = useColorModeValue('md', 'md');
  // Ajoute d'autres useColorModeValue si besoin
  const [membersByGuild, setMembersByGuild] = useState<Record<string, Member[]>>({});

  const apiUrl = import.meta.env.VITE_API_BASE_URL;


  useEffect(() => {
    fetch(`${apiUrl}/api/guildes`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setGuilds(data) : setGuilds([]))
      .catch(() => setGuilds([]));
  }, []);

  // Fetch des membres pour chaque guilde après chargement des guildes
  useEffect(() => {
    if (guilds.length > 0) {
      guilds.forEach(guild => {
        fetch(`${apiUrl}/api/guildes/${guild._id}/membres`)
          .then(res => res.json())
          .then(data => {
            setMembersByGuild(prev => ({ ...prev, [guild._id]: Array.isArray(data) ? data : [] }));
          })
          .catch(() => {
            setMembersByGuild(prev => ({ ...prev, [guild._id]: [] }));
          });
      });
    }
  }, [guilds]);

  // --- returns conditionnels APRÈS les hooks ---
  if (!isAdmin) {
    return (
      <Flex mx="2rem" align="center" justify="center" alignSelf={"center"}>
        <Box p={8} borderWidth={1} borderRadius="lg" boxShadow={boxShadow} bg={bgColor}
          minW="320px">
          <Heading mb={4} size="md" textAlign="center">Connexion Admin</Heading>
          <form onSubmit={e => {
            e.preventDefault();
            if (passwordInput === ADMIN_PASSWORD) {
              setIsAdmin(true);
              setPasswordInput("");
              toast({ title: "Mode admin activé", status: "success" });
            } else {
              toast({ title: "Mot de passe incorrect", status: "error" });
            }
          }}>
            <FormControl>
              <FormLabel>Mot de passe admin</FormLabel>
              <Input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                autoFocus
              />
            </FormControl>
            <Button mt={4} colorScheme="blue" type="submit" w="full">Se connecter</Button>
          </form>
        </Box>
      </Flex>
    );
  }

  if (!Array.isArray(guilds)) {
    return (
  <Flex w="100%" h="100%" align="center" justify="center">
        <Box p={8} borderWidth={1} borderRadius="lg" boxShadow={boxShadow} bg={bgColor}>
          <Heading mb={4} size="md" textAlign="center">Erreur de chargement des guildes</Heading>
          <Text color="red.500">Impossible de charger les guildes depuis le serveur.</Text>
        </Box>
      </Flex>
    );
  }

  // Renommer une guilde
  const handleRenameGuild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameGuildName.trim()) return;
    setIsRenameConfirmOpen(true);
  };
  const confirmRenameGuild = () => {
  fetch(`${apiUrl}/api/guildes/${renameGuildId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameGuildName.trim() })
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors du renommage");
        return res.json();
      })
      .then(() => {
        // Recharge la liste des guildes
  fetch(`${apiUrl}/api/guildes`)
          .then(res => res.json())
          .then(data => {
            setGuilds(Array.isArray(data) ? data : []);
            setRenameGuildId("");
            setRenameGuildName("");
            setIsRenameConfirmOpen(false);
            toast({ title: "Guilde renommée", status: "success", duration: 1500 });
          });
      })
      .catch(() => {
        toast({ title: "Erreur lors du renommage", status: "error" });
      });
  };

  // Supprimer un membre d'une guilde
  const handleRemoveMember = (guildId: string, memberId: string) => {
    setMembersByGuild(prev => ({
      ...prev,
      [guildId]: (prev[guildId] || []).filter((m: Member) => m._id !== memberId)
    }));
    toast({ title: "Membre supprimé", status: "info", duration: 1500 });
  };

  // Déplacer un membre vers une autre guilde
  const handleMoveMember = (
    fromGuildId: string,
    member: Member,
    toGuildId: string
  ) => {
    if (fromGuildId === toGuildId) return;
    setMembersByGuild(prev => {
      const fromMembers = (prev[fromGuildId] || []).filter((m: Member) => m._id !== member._id);
      const toMembers = prev[toGuildId] ? [...prev[toGuildId]] : [];
      if (toMembers.length >= 20) return prev;
      toMembers.push(member);
      return {
        ...prev,
        [fromGuildId]: fromMembers,
        [toGuildId]: toMembers
      };
    });
    toast({
      title: `Membre déplacé vers ${guilds.find((g: Guild) => g._id === toGuildId)?.name || toGuildId}`,
      status: "success",
      duration: 1500,
    });
  };

  // Ajouter un membre à une guilde
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const members = membersByGuild[selectedGuildId] || [];
    if (members.length >= 20) return;
    const chefCount = members.filter(m => m.role === "chef").length;
    const sousChefCount = members.filter(m => m.role === "sous-chef").length;
    if (newMemberRole === "chef" && chefCount >= 1) {
      toast({ title: "Il y a déjà un chef dans cette guilde.", status: "error" });
      return;
    }
    if (newMemberRole === "sous-chef" && sousChefCount >= 2) {
      toast({ title: "Il y a déjà 2 sous-chefs dans cette guilde.", status: "error" });
      return;
    }
  fetch(`${apiUrl}/api/guildes/${selectedGuildId}/membres`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newMemberName.trim(),
        role: newMemberRole
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de l'ajout");
        return res.json();
      })
      .then(() => {
        // Recharge les membres de la guilde
  fetch(`${apiUrl}/api/guildes/${selectedGuildId}/membres`)
          .then(res => res.json())
          .then(data => {
            setMembersByGuild(prev => ({ ...prev, [selectedGuildId]: Array.isArray(data) ? data : [] }));
            setNewMemberName("");
            setNewMemberRole("membre");
            toast({ title: "Membre ajouté", status: "success" });
          });
      })
      .catch(() => {
        toast({ title: "Erreur lors de l'ajout du membre", status: "error" });
      });
  };

  const sortedGuilds = [...guilds].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
  return (
      <Flex w="100%" h="100%" align="center" justify="center">
        <Container
          w="100%"
          h="100%"
          maxWidth={"100%"}
          px={0}
          py={8}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="flex-start"
          bg={bgColor}
          boxShadow="none"
          m="0"
        >
          <Heading mb={8} textAlign="center">Admin - Gestion des Guildes Ṣčhrīft</Heading>
        <Stack direction={{ base: "column", md: "row" }} spacing={8} mb={8}>
        {/* Bloc création guilde */}
        <Box as="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (!newGuildName.trim()) {
            toast({ title: "Le nom de la guilde est requis.", status: "error" });
            return;
          }
          fetch(`${apiUrl}/api/guildes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newGuildName.trim() })
          })
            .then(res => {
              if (!res.ok) throw new Error("Erreur lors de la création");
              return res.json();
            })
            .then(() => {
              fetch(`${apiUrl}/api/guildes`)
                .then(res => res.json())
                .then(data => {
                  setGuilds(Array.isArray(data) ? data : []);
                  setNewGuildName("");
                  toast({ title: "Guilde créée", status: "success" });
                });
            })
            .catch(() => {
              toast({ title: "Erreur lors de la création de la guilde", status: "error" });
            });
        }} p={4} borderWidth={1} borderRadius="lg" boxShadow={boxShadow} bg={bgColor}>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Créer une guilde</FormLabel>
              <Input
                placeholder="Nom de la nouvelle guilde"
                value={newGuildName}
                onChange={e => setNewGuildName(e.target.value)}
              />
            </FormControl>
            <Button colorScheme="green" type="submit">
              Créer
            </Button>
          </VStack>
        </Box>
            <Box as="form" onSubmit={handleAddMember} p={4} borderWidth={1} borderRadius="lg" boxShadow={boxShadow} bg={bgColor}>
              <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Ajouter un membre</FormLabel>
                <Input
                  placeholder="Nom du membre"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Rôle</FormLabel>
                <Select value={newMemberRole} onChange={e => setNewMemberRole((e.target as HTMLSelectElement).value as Role)}>
                  <option value="membre">Membre</option>
                  <option value="sous-chef">Sous-Chef</option>
                  <option value="chef">Chef</option>
                </Select>
              </FormControl>
              <FormControl>
                <Select value={selectedGuildId} onChange={e => setSelectedGuildId((e.target as HTMLSelectElement).value)}>
                  {sortedGuilds.map((g: Guild) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </Select>
              </FormControl>
              <Button colorScheme="blue" type="submit">
                Ajouter membre
              </Button>
            </VStack>
          </Box>
          {/* Bloc suppression guilde */}
          <Box as="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); if (deleteGuildId) setIsDeleteConfirmOpen(true); }} p={4} borderWidth={1} borderRadius="lg" boxShadow={boxShadow} bg={bgColor}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Supprimer une guilde</FormLabel>
                <Select value={deleteGuildId} onChange={e => setDeleteGuildId((e.target as HTMLSelectElement).value)}>
                  <option value="">Sélectionner une guilde</option>
                  {sortedGuilds.map((g: Guild) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </Select>
              </FormControl>
              <Button colorScheme="red" type="submit" isDisabled={!deleteGuildId}>
                Supprimer
              </Button>
            </VStack>
          </Box>
          <Box as="form" onSubmit={handleRenameGuild} p={4} borderWidth={1} borderRadius="lg" boxShadow={boxShadow} bg={bgColor}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Renommer une guilde</FormLabel>
                <Select value={renameGuildId} onChange={e => setRenameGuildId((e.target as HTMLSelectElement).value)}>
                  <option value="">Sélectionner une guilde</option>
                  {sortedGuilds.map((g: Guild) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <Input
                  placeholder="Nouveau nom"
                  value={renameGuildName}
                  onChange={e => setRenameGuildName(e.target.value)}
                />
              </FormControl>
              <Button colorScheme="orange" type="submit">
                Renommer
              </Button>
            </VStack>
          </Box>
        </Stack>
        {guilds && guilds.length === 0 && (<Text>Aucune guilde disponible.</Text>)}

        {/* Popup confirmation suppression */}
        <AlertDialog
          isOpen={isDeleteConfirmOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteConfirmOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader>Confirmer la suppression</AlertDialogHeader>
              <AlertDialogBody>
                Supprimer la guilde « {guilds.find(g => g._id === deleteGuildId)?.name} » ? Cette action est irréversible.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsDeleteConfirmOpen(false)}>
                  Annuler
                </Button>
                <Button colorScheme="red" ml={3} onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  if (deleteGuildId) handleDeleteGuild(deleteGuildId);
                  setDeleteGuildId("");
                }}>
                  Confirmer
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        {guilds && <GuildTabsList
          guilds={sortedGuilds}
          membersByGuild={membersByGuild}
          editable={true}
          onRoleChange={(guildId, member, newRole) => {
            const members = membersByGuild[guildId] || [];
            const chefCount = members.filter((m: Member) => m.role === "chef").length;
            const sousChefCount = members.filter((m: Member) => m.role === "sous-chef").length;
            if (newRole === "chef" && chefCount >= 1 && member.role !== "chef") {
              toast({ title: "Il y a déjà un chef dans cette guilde.", status: "error" });
              return;
            }
            if (newRole === "sous-chef" && sousChefCount >= 2 && member.role !== "sous-chef") {
              toast({ title: "Il y a déjà 2 sous-chefs dans cette guilde.", status: "error" });
              return;
            }
            setMembersByGuild(prev => ({
              ...prev,
              [guildId]: members.map((m: Member) =>
                m._id === member._id ? { ...m, role: newRole } : m
              )
            }));
          }}
          onRemoveMember={handleRemoveMember}
          onMoveMember={handleMoveMember}
          allGuildsForMove={sortedGuilds}
        />}
        <AlertDialog
          isOpen={isRenameConfirmOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsRenameConfirmOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader>Confirmer le renommage</AlertDialogHeader>
              <AlertDialogBody>
                Renommer la guilde "{guilds.find(g => g._id === renameGuildId)?.name}" en "{renameGuildName}" ?
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsRenameConfirmOpen(false)}>
                  Annuler
                </Button>
                <Button colorScheme="orange" onClick={confirmRenameGuild} ml={3}>
                  Confirmer
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Flex>
  );
}
