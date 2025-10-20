import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Container, Flex, FormControl, FormLabel, Heading, Input, Select, Stack, Text, useColorModeValue, useToast, VStack } from "@chakra-ui/react";
import { GuildTabsList, type Guild } from "../components/GuildTabsList";
import { useEffect, useRef, useState } from "react";
import type { Role } from "@/interfaces";
import { jwtDecode } from "jwt-decode";

export default function AdminPage() {
  // === TOUS LES HOOKS EN PREMIER ===
  const [newGuildName, setNewGuildName] = useState("");
  const [deleteGuildId, setDeleteGuildId] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<Role>("membre");
  const [selectedGuildId, setSelectedGuildId] = useState("A");
  const [renameGuildId, setRenameGuildId] = useState("");
  const [renameGuildName, setRenameGuildName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRenameConfirmOpen, setIsRenameConfirmOpen] = useState(false);
  
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const boxShadow = useColorModeValue('md', 'md');
  const deleteButtonBg = useColorModeValue('red.500', 'red.600');
  const deleteButtonHoverBg = useColorModeValue('red.600', 'red.700');
  
  // === VARIABLES ET CONSTANTES ===
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // === FONCTIONS UTILITAIRES ===
  // Fonction utilitaire pour vérifier la validité du token
  const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Temps actuel en secondes

      // Vérifier si le token a une date d'expiration et s'il n'est pas expiré
      if (decoded.exp && decoded.exp < currentTime) {
        return false; // Token expiré
      }

      return true; // Token valide
    } catch (error) {
      // Erreur de décodage, token invalide
      return false;
    }
  };

  // Fonction pour faire des requêtes authentifiées avec gestion de l'expiration
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('adminToken');

    if (!isTokenValid(token)) {
      // Token manquant, invalide ou expiré
      localStorage.removeItem('adminToken');
      setIsAdmin(false);
      toast({
        title: "Session expirée",
        description: "Veuillez vous reconnecter",
        status: "warning",
        duration: 3000,
      });
      throw new Error('Token invalide ou expiré');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });

    // Vérifier si le serveur retourne 401 (au cas où)
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      setIsAdmin(false);
      toast({
        title: "Session expirée",
        description: "Veuillez vous reconnecter",
        status: "warning",
        duration: 3000,
      });
      throw new Error('Token rejeté par le serveur');
    }

    return response;
  };

  const handleDeleteGuild = (guildId: string) => {
    authenticatedFetch(`${apiUrl}/api/guildes/${guildId}`, {
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

  // === USE EFFECTS ===
  useEffect(() => {
    fetch(`${apiUrl}/api/guildes`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setGuilds(data) : setGuilds([]))
      .catch(() => setGuilds([]));
  }, []);

  // Vérifier et valider le token admin au chargement
  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    if (isTokenValid(token)) {
      setIsAdmin(true);
    } else if (token) {
      // Token existe mais est invalide/expiré
      localStorage.removeItem('adminToken');
      toast({
        title: "Session expirée",
        description: "Veuillez vous reconnecter",
        status: "warning",
        duration: 3000,
      });
    }
  }, [toast]);



  // Vérifier le token quand l'utilisateur revient sur la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAdmin) {
        // La page est redevenue visible, vérifier le token côté client
        const token = localStorage.getItem('adminToken');
        if (!isTokenValid(token)) {
          localStorage.removeItem('adminToken');
          setIsAdmin(false);
          toast({
            title: "Session expirée",
            description: "Veuillez vous reconnecter",
            status: "warning",
            duration: 3000,
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAdmin, toast]);

  // === RENDER CONDITIONNEL ===
  if (!isAdmin) {
    return (
      <Flex mx="2rem" align="center" justify="center" alignSelf={"center"}>
        <Box p={8} borderWidth={1} borderRadius="lg" boxShadow={boxShadow} bg={bgColor}
          minW="320px">
          <Heading mb={4} size="md" textAlign="center">Connexion Admin</Heading>
          <form onSubmit={async e => {
            e.preventDefault();
            setIsAuthenticating(true);
            try {
              // 1. L'utilisateur saisit son mot de passe
              const userPassword = passwordInput;

              // 3. Envoi au serveur
              const response = await fetch(`${apiUrl}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: userPassword })
              });

              if (response.ok) {
                const { token } = await response.json();
                // Stocker le token
                localStorage.setItem('adminToken', token);
                setIsAdmin(true);
                setPasswordInput("");
                toast({ title: "Mode admin activé", status: "success" });
              } else {
                toast({ title: "Mot de passe incorrect", status: "error" });
              }
            } catch (error) {
              toast({ title: "Erreur de connexion", status: "error" });
            } finally {
              setIsAuthenticating(false);
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
            <Button
              mt={4}
              colorScheme="blue"
              type="submit"
              w="full"
              isLoading={isAuthenticating}
              loadingText="Connexion..."
            >
              Se connecter
            </Button>
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
    authenticatedFetch(`${apiUrl}/api/guildes/${renameGuildId}`, {
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



  // Ajouter un membre à une guilde
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    authenticatedFetch(`${apiUrl}/api/guildes/${selectedGuildId}/membres`, {
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
        setNewMemberName("");
        setNewMemberRole("membre");
        toast({ title: "Membre ajouté", status: "success" });
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

        {/* Bouton de déconnexion */}
        <Button
          mb={4}
          size="sm"
          variant="outline"
          onClick={() => {
            localStorage.removeItem('adminToken');
            setIsAdmin(false);
            toast({ title: "Déconnexion réussie", status: "info" });
          }}
        >
          Se déconnecter
        </Button>

        <Stack direction={{ base: "column", md: "row" }} spacing={8} mb={8}>
          {/* Bloc création guilde */}
          <Box as="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!newGuildName.trim()) {
              toast({ title: "Le nom de la guilde est requis.", status: "error" });
              return;
            }
            authenticatedFetch(`${apiUrl}/api/guildes`, {
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
              <Button
                bg={deleteButtonBg}
                color="white"
                _hover={{
                  bg: deleteButtonHoverBg
                }}
                type="submit"
                isDisabled={!deleteGuildId}
              >
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
                <Button
                  bg={deleteButtonBg}
                  color="white"
                  _hover={{
                    bg: deleteButtonHoverBg
                  }}
                  ml={3}
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    if (deleteGuildId) handleDeleteGuild(deleteGuildId);
                    setDeleteGuildId("");
                  }}
                >
                  Confirmer
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <GuildTabsList
          editable={true}
        />
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
