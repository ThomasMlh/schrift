import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, Container, Flex, Heading, Text, useColorModeValue, useToast } from "@chakra-ui/react";
import { GuildTabsList } from "./GuildTabsList";
import AdminFormsSection from "./AdminFormsSection";
import { useEffect, useRef, useState } from "react";
import type { Guild } from "../interfaces";

const GuildsAdminSection = () => {
  const [deleteGuildId, setDeleteGuildId] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [renameGuildId, setRenameGuildId] = useState("");
  const [renameGuildName, setRenameGuildName] = useState("");
  const [isRenameConfirmOpen, setIsRenameConfirmOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const deleteButtonBg = useColorModeValue('red.500', 'red.600');
  const deleteButtonHoverBg = useColorModeValue('red.600', 'red.700');
  
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
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

  const refreshData = () => {
    fetch(`${apiUrl}/api/guildes`)
      .then(res => res.json())
      .then(data => {
        setGuilds(Array.isArray(data) ? data : []);
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

  const handleRenameGuild = (guildId: string, newName: string) => {
    if (!newName.trim()) return;

    authenticatedFetch(`${apiUrl}/api/guildes/${guildId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() })
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || "Erreur lors du renommage");
        refreshData();
        toast({ title: data.message || "Guilde renommée", status: "success" });
      })
      .catch((error) => {
        toast({ title: error.message || "Erreur lors du renommage", status: "error" });
      });
  };

  const openDeleteConfirm = (guildId: string) => {
    setDeleteGuildId(guildId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteGuildId) {
      handleDeleteGuild(deleteGuildId);
    }
    setIsDeleteConfirmOpen(false);
    setDeleteGuildId("");
  };

  const openRenameConfirm = (guildId: string, currentName: string) => {
    setRenameGuildId(guildId);
    setRenameGuildName(currentName);
    setIsRenameConfirmOpen(true);
  };

  const confirmRename = () => {
    if (renameGuildId && renameGuildName.trim()) {
      handleRenameGuild(renameGuildId, renameGuildName);
    }
    setIsRenameConfirmOpen(false);
    setRenameGuildId("");
    setRenameGuildName("");
  };

  // Charger les guildes au montage
  useEffect(() => {
    fetch(`${apiUrl}/api/guildes`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setGuilds(data) : setGuilds([]))
      .catch(() => setGuilds([]));
  }, [apiUrl]);

  return (
    <Container maxW="100vw" w="100%" px={0} py={8}>
      <Heading mb={8} textAlign="center">Administration des Guildes</Heading>
      
      {/* Formulaires d'administration */}
      <Flex justify="center" w="100%" px={4}>
        <AdminFormsSection
          guilds={guilds}
          apiUrl={apiUrl}
          authenticatedFetch={authenticatedFetch}
          onDataChange={refreshData}
          onDeleteRequest={openDeleteConfirm}
          onRenameRequest={openRenameConfirm}
        />
      </Flex>

      {/* Affichage des guildes avec possibilité d'édition */}
      <Flex align="center" justify="center">
        <GuildTabsList 
          editable={true} 
          refreshTrigger={refreshTrigger}
        />
      </Flex>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        isOpen={isDeleteConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Confirmer la suppression</AlertDialogHeader>
            <AlertDialogBody>
              Êtes-vous sûr de vouloir supprimer cette guilde ? Cette action est irréversible.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteConfirmOpen(false)}>
                Annuler
              </Button>
              <Button
                bg={deleteButtonBg}
                color="white"
                _hover={{ bg: deleteButtonHoverBg }}
                onClick={confirmDelete}
                ml={3}
              >
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Dialog de confirmation de renommage */}
      <AlertDialog
        isOpen={isRenameConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsRenameConfirmOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Renommer la guilde</AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={3}>Nouveau nom pour la guilde :</Text>
              <input
                type="text"
                value={renameGuildName}
                onChange={(e) => setRenameGuildName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsRenameConfirmOpen(false)}>
                Annuler
              </Button>
              <Button colorScheme="blue" onClick={confirmRename} ml={3}>
                Renommer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}

export default GuildsAdminSection;