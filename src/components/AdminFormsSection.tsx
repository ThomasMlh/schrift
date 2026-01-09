import {
  Box, Button, VStack, FormControl, FormLabel, Input, Select, Stack, Text,
  useBreakpointValue, useColorModeValue, useToast
} from "@chakra-ui/react";
import { useState } from "react";
import type { IGuild, Role } from "../interfaces";
import { UserSearchSelect } from "./ui/UserSearchSelect";
import { useUsers } from "@/hooks/useAPI";

// Composant wrapper pour les formulaires mobiles (défini en dehors pour éviter les re-créations)

interface MobileFormWrapperProps {
  title: string;
  formName: string;
  children: React.ReactNode;
  colorScheme?: string; 
  isMobile?: boolean;
  openForm: string | null;
  toggleForm: (formName: string) => void;
  bgColor: string;
  boxShadow: string;
}

const MobileFormWrapper: React.FC<MobileFormWrapperProps> = ({
  title,
  formName,
  children,
  colorScheme = "blue",
  isMobile,
  openForm,
  toggleForm,
  bgColor,
  boxShadow
}) => {
  if (!isMobile) {
    return <>{children}</>;
  }

  const isOpen = openForm === formName;

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Button
        colorScheme={colorScheme}
        onClick={() => toggleForm(formName)}
        size="lg"
        variant={isOpen ? "solid" : "outline"}
      >
        {title} {isOpen ? "▲" : "▼"}
      </Button>
      {isOpen && (
        <Box p={4} borderWidth={1} borderRadius="lg" boxShadow={boxShadow} bg={bgColor}>
          {children}
        </Box>
      )}
    </VStack>
  );
};

interface AdminFormsSectionProps {
  guilds: IGuild[];
  apiUrl: string;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onDataChange: () => void;
  onDeleteRequest: (guildId: string) => void;
  onRenameRequest: (guildId: string, newName: string) => void;
}

const AdminFormsSection: React.FC<AdminFormsSectionProps> = ({
  guilds,
  apiUrl,
  authenticatedFetch,
  onDataChange,
  onDeleteRequest,
  onRenameRequest
}) => {
  // Utiliser useSWR pour les utilisateurs (cache automatique)
  const { users } = useUsers(true);
  
  // États pour les formulaires
  const [newGuildName, setNewGuildName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<Role>("membre");
  const [selectedGuildId, setSelectedGuildId] = useState("A");
  const [deleteGuildId, setDeleteGuildId] = useState("");
  const [renameGuildId, setRenameGuildId] = useState("");
  const [renameGuildName, setRenameGuildName] = useState("");

  // États pour la gestion des utilisateurs
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [openForm, setOpenForm] = useState<string | null>(null);

  // Hooks UI
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('white', 'gray.800');
  const boxShadow = useColorModeValue('md', 'md');
  const deleteButtonBg = useColorModeValue('red.500', 'red.600');
  const deleteButtonHoverBg = useColorModeValue('red.600', 'red.700');

  // Guildes triées
  const sortedGuilds = [...guilds].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

  // Fonction pour toggle les formulaires en mobile
  const toggleForm = (formName: string) => {
    setOpenForm(openForm === formName ? null : formName);
  };

  // Handlers
  const handleCreateGuild = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newGuildName.trim()) {
      toast({ title: "Le nom de la guilde est requis.", status: "error" });
      return;
    }

    try {
      const res = await authenticatedFetch(`${apiUrl}/api/guildes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGuildName.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la création");

      onDataChange();
      setNewGuildName("");
      if (isMobile) setOpenForm(null);
      toast({ title: data.message || "Guilde créée", status: "success" });
    } catch (error: any) {
      toast({ title: error.message || "Erreur lors de la création de la guilde", status: "error" });
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast({ title: "Veuillez sélectionner un utilisateur", status: "error" });
      return;
    }

    const selectedUser = users.find(user => user._id === selectedUserId);
    if (!selectedUser) {
      toast({ title: "Utilisateur introuvable", status: "error" });
      return;
    }

    try {
      const res = await authenticatedFetch(`${apiUrl}/api/guildes/${selectedGuildId}/assign-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedUser.username,
          role: newMemberRole,
          userId: selectedUserId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'ajout");

      onDataChange();
      setSelectedUserId("");
      setUserSearchQuery("");
      setNewMemberRole("membre");
      if (isMobile) setOpenForm(null);
      toast({ title: data.message || "Membre ajouté", status: "success" });
    } catch (error: any) {
      toast({ title: error.message || "Erreur lors de l'ajout du membre", status: "error" });
    }
  };

  const handleDeleteGuild = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (deleteGuildId) {
      onDeleteRequest(deleteGuildId);
    }
  };

  const handleRenameGuild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameGuildName.trim()) return;
    onRenameRequest(renameGuildId, renameGuildName.trim());
  };

  return (
    <Stack 
      direction={{ base: "column", md: "row" }} 
      spacing={8} 
      mb={8}
      justify="center"
      w="100%"
    >
      {/* Formulaire création guilde */}
      <MobileFormWrapper
        title="Créer une guilde"
        formName="create"
        colorScheme="green"
        isMobile={isMobile}
        openForm={openForm}
        toggleForm={toggleForm}
        bgColor={bgColor}
        boxShadow={boxShadow}
      >
        <Box
          as="form"
          onSubmit={handleCreateGuild}
          p={isMobile ? 0 : 4}
          borderWidth={isMobile ? 0 : 1}
          borderRadius="lg"
          boxShadow={isMobile ? "none" : boxShadow}
          bg={isMobile ? "transparent" : bgColor}
        >
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
      </MobileFormWrapper>

      {/* Formulaire ajout membre */}
      <MobileFormWrapper
        title="Ajouter un membre"
        formName="addMember"
        colorScheme="blue"
        isMobile={isMobile}
        openForm={openForm}
        toggleForm={toggleForm}
        bgColor={bgColor}
        boxShadow={boxShadow}
      >
        <Box
          as="form"
          onSubmit={handleAddMember}
          p={isMobile ? 0 : 4}
          borderWidth={isMobile ? 0 : 1}
          borderRadius="lg"
          boxShadow={isMobile ? "none" : boxShadow}
          bg={isMobile ? "transparent" : bgColor}
        >
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Rechercher et sélectionner un utilisateur</FormLabel>
              <UserSearchSelect
                users={users}
                selectedUserId={selectedUserId}
                onUserSelect={setSelectedUserId}
                searchQuery={userSearchQuery}
                onSearchChange={setUserSearchQuery}
                placeholder="Choisir un utilisateur"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {users.length} utilisateurs chargés
              </Text>
            </FormControl>
            <FormControl>
              <FormLabel>Rôle</FormLabel>
              <Select value={newMemberRole} onChange={e => setNewMemberRole(e.target.value as Role)}>
                <option value="membre">Membre</option>
                <option value="sous-chef">Sous-Chef</option>
                <option value="chef">Chef</option>
              </Select>
            </FormControl>
            <FormControl>
              <Select value={selectedGuildId} onChange={e => setSelectedGuildId(e.target.value)}>
                <option value="">Sélectionner une guilde</option>
                {sortedGuilds.map((g: IGuild) => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </Select>
            </FormControl>
            <Button colorScheme="blue" type="submit">
              Ajouter membre
            </Button>
          </VStack>
        </Box>
      </MobileFormWrapper>

      {/* Formulaire suppression guilde */}
      <MobileFormWrapper
        title="Supprimer une guilde"
        formName="delete"
        colorScheme="red"
        isMobile={isMobile}
        openForm={openForm}
        toggleForm={toggleForm}
        bgColor={bgColor}
        boxShadow={boxShadow}
      >
        <Box
          as="form"
          onSubmit={handleDeleteGuild}
          p={isMobile ? 0 : 4}
          borderWidth={isMobile ? 0 : 1}
          borderRadius="lg"
          boxShadow={isMobile ? "none" : boxShadow}
          bg={isMobile ? "transparent" : bgColor}
        >
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Supprimer une guilde</FormLabel>
              <Select value={deleteGuildId} onChange={e => setDeleteGuildId(e.target.value)}>
                <option value="">Sélectionner une guilde</option>
                {sortedGuilds.map((g: IGuild) => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </Select>
            </FormControl>
            <Button
              bg={deleteButtonBg}
              color="white"
              _hover={{ bg: deleteButtonHoverBg }}
              type="submit"
              isDisabled={!deleteGuildId}
            >
              Supprimer
            </Button>
          </VStack>
        </Box>
      </MobileFormWrapper>

      {/* Formulaire renommage guilde */}
      <MobileFormWrapper
        title="Renommer une guilde"
        formName="rename"
        colorScheme="orange"
        isMobile={isMobile}
        openForm={openForm}
        toggleForm={toggleForm}
        bgColor={bgColor}
        boxShadow={boxShadow}
      >
        <Box
          as="form"
          onSubmit={handleRenameGuild}
          p={isMobile ? 0 : 4}
          borderWidth={isMobile ? 0 : 1}
          borderRadius="lg"
          boxShadow={isMobile ? "none" : boxShadow}
          bg={isMobile ? "transparent" : bgColor}
        >
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Renommer une guilde</FormLabel>
              <Select value={renameGuildId} onChange={e => setRenameGuildId(e.target.value)}>
                <option value="">Sélectionner une guilde</option>
                {sortedGuilds.map((g: IGuild) => (
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
      </MobileFormWrapper>
    </Stack>
  );
}

export default AdminFormsSection;