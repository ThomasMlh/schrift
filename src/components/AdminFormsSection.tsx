import {
  Box, Button, VStack, FormControl, FormLabel, Input, Stack, Text,
  useBreakpointValue, useColorMode, useToast
} from "@chakra-ui/react";
import { useState } from "react";
import { CustomSelect } from "./ui/CustomSelect";
import type { IGuild, Role } from "../interfaces";
import { UserSearchSelect } from "./ui/UserSearchSelect";
import { useUsers } from "@/hooks/useAPI";
import { useAPIMutations } from "@/hooks/useAPIMutations";

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
    <VStack spacing={3} align="stretch" w="100%">
      <Button
        colorScheme={colorScheme}
        onClick={() => toggleForm(formName)}
        size="md"
        variant={isOpen ? "solid" : "ghost"}
        borderRadius="full"
        justifyContent="space-between"
        rightIcon={<Text as="span" fontSize="xs">{isOpen ? "▲" : "▼"}</Text>}
      >
        {title}
      </Button>
      {isOpen && (
        <Box p={4} borderRadius="xl" boxShadow={boxShadow} bg={bgColor} borderWidth="1px" borderColor="whiteAlpha.100">
          {children}
        </Box>
      )}
    </VStack>
  );
};

interface AdminFormsSectionProps {
  guilds: IGuild[];
  onDataChange: () => void;
  onDeleteRequest: (guildId: string) => void;
  onRenameRequest: (guildId: string, newName: string) => void;
  onDisableRequest: (guildId: string, guildName: string, isCurrentlyDisabled: boolean) => void;
}

const AdminFormsSection: React.FC<AdminFormsSectionProps> = ({
  guilds,
  onDataChange,
  onDeleteRequest,
  onRenameRequest,
  onDisableRequest
}) => {
  const { createGuild, assignUserToGuild } = useAPIMutations();
  // Utiliser useSWR pour les utilisateurs (cache automatique)
  const { users } = useUsers({ authenticated: true });
  
  // États pour les formulaires
  const [newGuildName, setNewGuildName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<Role>("membre");
  const [selectedGuildId, setSelectedGuildId] = useState("A");
  const [deleteGuildId, setDeleteGuildId] = useState("");
  const [renameGuildId, setRenameGuildId] = useState("");
  const [renameGuildName, setRenameGuildName] = useState("");
  const [disableGuildId, setDisableGuildId] = useState("");

  // États pour la gestion des utilisateurs
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [openForm, setOpenForm] = useState<string | null>(null);

  // Hooks UI
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const bgColor = isDark ? 'gray.800' : 'white';
  const boxShadow = isDark ? '0 2px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)';
  const borderColor = isDark ? 'whiteAlpha.100' : 'gray.200';

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
      await createGuild({ name: newGuildName.trim() });
      onDataChange();
      setNewGuildName("");
      if (isMobile) setOpenForm(null);
      toast({ title: "Guilde créée avec succès", status: "success" });
    } catch (error) {
      const err = error as Error;
      toast({ title: err.message || "Erreur lors de la création de la guilde", status: "error" });
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast({ title: "Veuillez sélectionner un utilisateur", status: "error" });
      return;
    }

    try {
      await assignUserToGuild(selectedGuildId, selectedUserId);
      onDataChange();
      setSelectedUserId("");
      setUserSearchQuery("");
      setNewMemberRole("membre");
      if (isMobile) setOpenForm(null);
      toast({ title: "Membre ajouté avec succès", status: "success" });
    } catch (error) {
      const err = error as Error;
      toast({ title: err.message || "Erreur lors de l'ajout du membre", status: "error" });
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

  const handleDisableGuild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableGuildId) return;
    const guild = guilds.find(g => g._id === disableGuildId);
    if (guild) {
      onDisableRequest(guild._id, guild.name, !!guild.disabled);
    }
  };

  // Helper: styled form card
  const FormCard = ({
    children,
    accentColor,
    label,
    formName,
    mobileColorScheme = "purple",
  }: {
    children: React.ReactNode;
    accentColor: string;
    label: string;
    formName: string;
    mobileColorScheme?: string;
  }) => (
    <MobileFormWrapper
      title={label}
      formName={formName}
      colorScheme={mobileColorScheme}
      isMobile={isMobile}
      openForm={openForm}
      toggleForm={toggleForm}
      bgColor={bgColor}
      boxShadow={boxShadow}
    >
      <Box
        p={5}
        borderRadius="xl"
        bg={bgColor}
        boxShadow={boxShadow}
        borderWidth="1px"
        borderColor={borderColor}
        borderLeftWidth="3px"
        borderLeftColor={accentColor}
        minW={{ md: "220px" }}
        maxW={{ md: "280px" }}
        w="100%"
        transition="box-shadow 0.2s"
        _hover={{ boxShadow: isDark ? '0 4px 24px rgba(124,58,237,0.18)' : '0 4px 16px rgba(0,0,0,0.1)' }}
      >
        <Text
          fontSize="2xs"
          fontWeight="semibold"
          letterSpacing="widest"
          textTransform="uppercase"
          color={accentColor}
          mb={4}
        >
          {label}
        </Text>
        {children}
      </Box>
    </MobileFormWrapper>
  );

  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      spacing={4}
      mb={8}
      justify="center"
      w="100%"
      wrap="wrap"
    >
      {/* Créer une guilde */}
      <FormCard label="Créer une guilde" accentColor="green.400" formName="create" mobileColorScheme="green">
        <Box as="form" onSubmit={handleCreateGuild}>
          <VStack spacing={3} align="stretch">
            <FormControl>
              <Input
                placeholder="Nom de la nouvelle guilde"
                value={newGuildName}
                onChange={e => setNewGuildName(e.target.value)}
                borderRadius="lg"
              />
            </FormControl>
            <Button colorScheme="green" type="submit" borderRadius="lg" size="sm">
              Créer
            </Button>
          </VStack>
        </Box>
      </FormCard>

      {/* Ajouter un membre */}
      <FormCard label="Ajouter un membre" accentColor="purple.400" formName="addMember" mobileColorScheme="purple">
        <Box as="form" onSubmit={handleAddMember}>
          <VStack spacing={3} align="stretch">
            <FormControl>
              <FormLabel fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} mb={1}>
                Utilisateur
              </FormLabel>
              <UserSearchSelect
                users={users}
                guilds={guilds}
                selectedUserId={selectedUserId}
                onUserSelect={setSelectedUserId}
                searchQuery={userSearchQuery}
                onSearchChange={setUserSearchQuery}
                placeholder="Choisir un utilisateur"
              />
              <Text fontSize="2xs" color="gray.500" mt={1}>
                {users.length} utilisateurs chargés
              </Text>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} mb={1}>
                Rôle
              </FormLabel>
              <CustomSelect value={newMemberRole} onChange={(val) => setNewMemberRole(val as Role)} options={[
                { value: "membre", label: "Membre" },
                { value: "sous-chef", label: "Sous-Chef" },
                { value: "chef", label: "Chef" },
              ]} allowDeselect={false} />
            </FormControl>
            <FormControl>
              <CustomSelect value={selectedGuildId} onChange={(val) => setSelectedGuildId(val)} placeholder="Sélectionner une guilde" options={sortedGuilds.map((g: IGuild) => ({
                value: g._id,
                label: g.name,
              }))} />
            </FormControl>
            <Button colorScheme="purple" type="submit" borderRadius="lg" size="sm">
              Ajouter membre
            </Button>
          </VStack>
        </Box>
      </FormCard>

      {/* Supprimer une guilde */}
      <FormCard label="Supprimer une guilde" accentColor="red.400" formName="delete" mobileColorScheme="red">
        <Box as="form" onSubmit={handleDeleteGuild}>
          <VStack spacing={3} align="stretch">
            <FormControl>
              <CustomSelect value={deleteGuildId} onChange={(val) => setDeleteGuildId(val)} placeholder="Sélectionner une guilde" options={sortedGuilds.map((g: IGuild) => ({
                value: g._id,
                label: g.name,
              }))} />
            </FormControl>
            <Button
              colorScheme="red"
              type="submit"
              isDisabled={!deleteGuildId}
              borderRadius="lg"
              size="sm"
            >
              Supprimer
            </Button>
          </VStack>
        </Box>
      </FormCard>

      {/* Renommer une guilde */}
      <FormCard label="Renommer une guilde" accentColor="orange.400" formName="rename" mobileColorScheme="orange">
        <Box as="form" onSubmit={handleRenameGuild}>
          <VStack spacing={3} align="stretch">
            <FormControl>
              <CustomSelect value={renameGuildId} onChange={(val) => setRenameGuildId(val)} placeholder="Sélectionner une guilde" options={sortedGuilds.map((g: IGuild) => ({
                value: g._id,
                label: g.name,
              }))} />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Nouveau nom"
                value={renameGuildName}
                onChange={e => setRenameGuildName(e.target.value)}
                borderRadius="lg"
              />
            </FormControl>
            <Button colorScheme="orange" type="submit" borderRadius="lg" size="sm">
              Renommer
            </Button>
          </VStack>
        </Box>
      </FormCard>

      {/* Désactiver / Réactiver */}
      <FormCard label="Désactiver / Réactiver" accentColor="yellow.400" formName="disable" mobileColorScheme="yellow">
        <Box as="form" onSubmit={handleDisableGuild}>
          <VStack spacing={3} align="stretch">
            <FormControl>
              <CustomSelect value={disableGuildId} onChange={(val) => setDisableGuildId(val)} placeholder="Sélectionner une guilde" options={sortedGuilds.map((g: IGuild) => ({
                value: g._id,
                label: `${g.name} ${g.disabled ? "(❌ désactivée)" : "(✅ active)"}`,
              }))} />
            </FormControl>
            <Button
              colorScheme={guilds.find(g => g._id === disableGuildId)?.disabled ? "green" : "yellow"}
              type="submit"
              isDisabled={!disableGuildId}
              borderRadius="lg"
              size="sm"
            >
              {guilds.find(g => g._id === disableGuildId)?.disabled ? "Réactiver" : "Désactiver"}
            </Button>
          </VStack>
        </Box>
      </FormCard>
    </Stack>
  );
}

export default AdminFormsSection;