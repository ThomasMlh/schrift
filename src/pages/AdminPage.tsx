import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Container, Flex, FormControl, FormLabel, Heading, Input, Text, useColorModeValue, useToast } from "@chakra-ui/react";
import { GuildTabsList, type Guild } from "../components/GuildTabsList";
import { AdminFormsSection } from "../components/AdminFormsSection";
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef, useState } from "react";

export default function AdminPage() {
  // === TOUS LES HOOKS EN PREMIER ===
  const [deleteGuildId, setDeleteGuildId] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [renameGuildId, setRenameGuildId] = useState("");
  const [renameGuildName, setRenameGuildName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRenameConfirmOpen, setIsRenameConfirmOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const boxShadow = useColorModeValue('md', 'md');
  const deleteButtonBg = useColorModeValue('red.500', 'red.600');
  const deleteButtonHoverBg = useColorModeValue('red.600', 'red.700');
  
  // === VARIABLES ET CONSTANTES ===
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // === FONCTIONS UTILITAIRES ===

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

  // Fonction helper pour rafraîchir les données après modification
  const refreshData = () => {
    // Recharger les guildes
    fetch(`${apiUrl}/api/guildes`)
      .then(res => res.json())
      .then(data => {
        setGuilds(Array.isArray(data) ? data : []);
        // Déclencher le refresh du composant GuildTabsList
        setRefreshTrigger(prev => prev + 1);
      })
      .catch(() => setGuilds([]));
  };

  const handleDeleteGuild = (guildId: string) => {
    authenticatedFetch(`${apiUrl}/api/guildes/${guildId}`, {
      method: "DELETE"
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || "Erreur lors de la suppression");
        refreshData();
        toast({ title: data.message || "Guilde supprimée", status: "success" });
      })
      .catch((error) => {
        toast({ title: error.message || "Erreur lors de la suppression", status: "error" });
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

  const confirmRenameGuild = () => {
    authenticatedFetch(`${apiUrl}/api/guildes/${renameGuildId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameGuildName.trim() })
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || "Erreur lors du renommage");
        refreshData();
        setRenameGuildId("");
        setRenameGuildName("");
        setIsRenameConfirmOpen(false);
        toast({ title: data.message || "Guilde renommée", status: "success", duration: 1500 });
      })
      .catch((error) => {
        setIsRenameConfirmOpen(false);
        setRenameGuildId("");
        setRenameGuildName("");
        toast({ title: error.message || "Erreur lors du renommage", status: "error" });
      });
  };

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
          p={2}
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

        <AdminFormsSection
          guilds={guilds}
          apiUrl={apiUrl}
          authenticatedFetch={authenticatedFetch}
          onDataChange={refreshData}
          onDeleteRequest={(guildId) => {
            setDeleteGuildId(guildId);
            setIsDeleteConfirmOpen(true);
          }}
          onRenameRequest={(guildId, newName) => {
            setRenameGuildId(guildId);
            setRenameGuildName(newName);
            setIsRenameConfirmOpen(true);
          }}
        />
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
          refreshTrigger={refreshTrigger}
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
