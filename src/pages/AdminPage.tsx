import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Container, Flex, Heading, Text, useColorModeValue, useToast } from "@chakra-ui/react";
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{username: string, avatar?: string} | null>(null);
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
    const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken'); // Support des deux pour migration

    if (!isTokenValid(token)) {
      // Token manquant, invalide ou expiré
      localStorage.removeItem('userToken');
      localStorage.removeItem('adminToken');
      setIsAdmin(false);
      setIsLoggedIn(false);
      setUserInfo(null);
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
      localStorage.removeItem('userToken');
      localStorage.removeItem('adminToken');
      setIsAdmin(false);
      setIsLoggedIn(false);
      setUserInfo(null);
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

  // Vérifier et valider le token au chargement
  useEffect(() => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken'); // Migration

    if (token && isTokenValid(token)) {
      // Décoder le token pour récupérer les infos utilisateur
      try {
        const decoded = jwtDecode(token) as any;
        setIsLoggedIn(true);
        setIsAdmin(decoded.isAdmin || false);
        setUserInfo({
          username: decoded.username || decoded.name || 'Utilisateur',
          avatar: decoded.avatar
        });
        
        // Migrer l'ancien token admin vers userToken
        if (localStorage.getItem('adminToken')) {
          localStorage.setItem('userToken', token);
          localStorage.removeItem('adminToken');
        }
      } catch (error) {
        console.error('Erreur décodage token:', error);
        localStorage.removeItem('userToken');
        localStorage.removeItem('adminToken');
      }
    } else if (token) {
      // Token existe mais est invalide/expiré
      localStorage.removeItem('userToken');
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
      if (!document.hidden && isLoggedIn) {
        // La page est redevenue visible, vérifier le token côté client
        const token = localStorage.getItem('userToken');
        if (!isTokenValid(token)) {
          localStorage.removeItem('userToken');
          setIsAdmin(false);
          setIsLoggedIn(false);
          setUserInfo(null);
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
  }, [isLoggedIn, toast]);

  // === RENDER CONDITIONNEL ===
  // La page admin est maintenant accessible depuis le header
  // L'authentification est gérée au niveau global
  
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
        <Heading mb={8} textAlign="center">
          {isAdmin ? "Admin - Gestion des Guildes Ṣčhrīft" : "Guildes Ṣčhrīft"}
        </Heading>

        {/* Informations utilisateur et bouton de déconnexion */}
        <Flex align="center" gap={4} mb={4}>
          {userInfo && (
            <Text fontSize="sm" color="gray.600">
              Connecté en tant que <strong>{userInfo.username}</strong>
              {isAdmin && <Text as="span" color="orange.500" ml={2}>(Admin)</Text>}
            </Text>
          )}
        </Flex>

        {/* Section admin (visible seulement pour les admins) */}
        {isAdmin && (
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
        )}
        
        {guilds && guilds.length === 0 && (
          <Text>Aucune guilde disponible.</Text>
        )}

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
