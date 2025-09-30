import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  IconButton,
  FormControl,
  FormLabel,
  Select,
  Stack,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  useToast,
  useColorModeValue,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from "@chakra-ui/react";
import { useState, useRef } from "react";

type Role = "chef" | "sous-chef" | "membre";
type Member = {
  id: string;
  name: string;
  role: Role;
};

type Guild = {
  id: string;
  name: string;
  members: Member[];
};

const initialGuilds: Guild[] = [
  { id: "A", name: "A", members: [] },
  { id: "B", name: "B", members: [] },
  { id: "C", name: "C", members: [] },
  { id: "D", name: "D", members: [] },
];

const ADMIN_PASSWORD = "schrift2025";

export default function AdminPage() {
  const [guilds, setGuilds] = useState<Guild[]>(initialGuilds);
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

  // Authentification admin
  if (!isAdmin) {
    return (
      <Flex mx="2rem" align="center" justify="center" alignSelf={"center"}>
        <Box  p={8} borderWidth={1} borderRadius="lg" boxShadow="md" bg={useColorModeValue('white', 'gray.800')}
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

  // Ajouter un membre à une guilde
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const guild = guilds.find(g => g.id === selectedGuildId);
    if (!guild || guild.members.length >= 20) return;
    const chefCount = guild.members.filter(m => m.role === "chef").length;
    const sousChefCount = guild.members.filter(m => m.role === "sous-chef").length;
    if (newMemberRole === "chef" && chefCount >= 1) {
      toast({ title: "Il y a déjà un chef dans cette guilde.", status: "error" });
      return;
    }
    if (newMemberRole === "sous-chef" && sousChefCount >= 2) {
      toast({ title: "Il y a déjà 2 sous-chefs dans cette guilde.", status: "error" });
      return;
    }
    setGuilds((guilds: Guild[]) =>
      guilds.map((g: Guild) =>
        g.id === selectedGuildId
          ? {
            ...g,
            members: [
              ...g.members,
              { id: Date.now().toString(), name: newMemberName.trim(), role: newMemberRole },
            ],
          }
          : g
      )
    );
    setNewMemberName("");
    setNewMemberRole("membre");
  };

  // Renommer une guilde
  const handleRenameGuild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameGuildName.trim()) return;
    setIsRenameConfirmOpen(true);
  };
  const confirmRenameGuild = () => {
    setGuilds((guilds: Guild[]) =>
      guilds.map((guild: Guild) =>
        guild.id === renameGuildId
          ? { ...guild, name: renameGuildName.trim() }
          : guild
      )
    );
    setRenameGuildId("");
    setRenameGuildName("");
    setIsRenameConfirmOpen(false);
    toast({ title: "Guilde renommée", status: "success", duration: 1500 });
  };

  // Supprimer un membre d'une guilde
  const handleRemoveMember = (guildId: string, memberId: string) => {
    setGuilds((guilds: Guild[]) =>
      guilds.map((guild: Guild) =>
        guild.id === guildId
          ? { ...guild, members: guild.members.filter((m: Member) => m.id !== memberId) }
          : guild
      )
    );
    toast({ title: "Membre supprimé", status: "info", duration: 1500 });
  };

  // Déplacer un membre vers une autre guilde
  const handleMoveMember = (
    fromGuildId: string,
    member: Member,
    toGuildId: string
  ) => {
    if (fromGuildId === toGuildId) return;
    setGuilds((guilds: Guild[]) =>
      guilds.map((guild: Guild) => {
        if (guild.id === fromGuildId) {
          return {
            ...guild,
            members: guild.members.filter((m: Member) => m.id !== member.id),
          };
        }
        if (guild.id === toGuildId && guild.members.length < 20) {
          return { ...guild, members: [...guild.members, member] };
        }
        return guild;
      })
    );
    toast({
      title: `Membre déplacé vers ${guilds.find((g: Guild) => g.id === toGuildId)?.name || toGuildId
        }`,
      status: "success",
      duration: 1500,
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
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow="none"
        m="0"
      >
        <Heading mb={8} textAlign="center">Admin - Gestion des Guildes Schrift</Heading>
        <Stack direction={{ base: "column", md: "row" }} spacing={8} mb={8}>
          <Box as="form" onSubmit={handleAddMember} p={4} borderWidth={1} borderRadius="lg" boxShadow="md" bg={useColorModeValue('white', 'gray.800')}>
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
                  {guilds.map((g: Guild) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </Select>
              </FormControl>
              <Button colorScheme="blue" type="submit">
                Ajouter membre
              </Button>
            </VStack>
          </Box>
          <Box as="form" onSubmit={handleRenameGuild} p={4} borderWidth={1} borderRadius="lg" boxShadow="md" bg={useColorModeValue('white', 'gray.800')}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Renommer une guilde</FormLabel>
                <Select value={renameGuildId} onChange={e => setRenameGuildId((e.target as HTMLSelectElement).value)}>
                  <option value="">Sélectionner une guilde</option>
                  {guilds.map((g: Guild) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
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
        <Tabs variant="enclosed" colorScheme="blue" isFitted w="80%">
          <TabList>
            {guilds.map((guild: Guild) => (
              <Tab key={guild.id}>Ṣčhrīft {guild.name}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {guilds.map((guild: Guild) => (
              <TabPanel key={guild.id} px={0}>
                <Box
                  borderWidth={1}
                  borderRadius="lg"
                  boxShadow="md"
                  p={4}
                  minW="260px"
                  bg={useColorModeValue('white', 'gray.800')}
                >
                  <VStack align="stretch" spacing={2}>
                    {guild.members.length === 0 ? (
                      <Text color="gray.400" fontSize="sm">
                        Aucun membre
                        <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                          ({guild.members.length}/20)
                        </Text>
                      </Text>
                    ) : (
                      <>
                        <Text as="span" fontSize="sm" color="gray.500" mb={2}>
                          {guild.members.length} membre{guild.members.length > 1 ? 's' : ''} / 20
                        </Text>
                        {[...guild.members]
                          .sort((a, b) => {
                            const roleOrder: Record<Role, number> = { chef: 0, "sous-chef": 1, membre: 2 };
                            if (roleOrder[a.role] !== roleOrder[b.role]) {
                              return roleOrder[a.role] - roleOrder[b.role];
                            }
                            return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
                          })
                          .map((member: Member) => (
                            <HStack key={member.id} spacing={2}>
                              <Text flex={1}>
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
                              <Select
                                size="sm"
                                value={member.role}
                                width="auto"
                                onChange={e => {
                                  const newRole = (e.target as HTMLSelectElement).value as Role;
                                  const g = guilds.find(g => g.id === guild.id);
                                  if (!g) return;
                                  const chefCount = g.members.filter(m => m.role === "chef").length;
                                  const sousChefCount = g.members.filter(m => m.role === "sous-chef").length;
                                  if (newRole === "chef" && chefCount >= 1 && member.role !== "chef") {
                                    toast({ title: "Il y a déjà un chef dans cette guilde.", status: "error" });
                                    return;
                                  }
                                  if (newRole === "sous-chef" && sousChefCount >= 2 && member.role !== "sous-chef") {
                                    toast({ title: "Il y a déjà 2 sous-chefs dans cette guilde.", status: "error" });
                                    return;
                                  }
                                  setGuilds((guilds: Guild[]) =>
                                    guilds.map((g: Guild) =>
                                      g.id === guild.id
                                        ? {
                                          ...g,
                                          members: g.members.map(m =>
                                            m.id === member.id ? { ...m, role: newRole } : m
                                          ),
                                        }
                                        : g
                                    )
                                  );
                                }}
                              >
                                <option value="membre">Membre</option>
                                <option value="sous-chef">Sous-Chef</option>
                                <option value="chef">Chef</option>
                              </Select>
                              <IconButton
                                aria-label="Supprimer"
                                icon={<span>🗑️</span>}
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleRemoveMember(guild.id, member.id)}
                              />
                              <Select
                                size="sm"
                                value={guild.id}
                                onChange={e => handleMoveMember(guild.id, member, (e.target as HTMLSelectElement).value)}
                                width="auto"
                              >
                                <option value={guild.id}>Rester</option>
                                {guilds
                                  .filter((g: Guild) => g.id !== guild.id && g.members.length < 20)
                                  .map((g2: Guild) => (
                                    <option key={g2.id} value={g2.id}>
                                      {g2.name}
                                    </option>
                                  ))}
                              </Select>
                            </HStack>
                          ))}
                      </>
                    )}
                  </VStack>
                </Box>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
        <AlertDialog
          isOpen={isRenameConfirmOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsRenameConfirmOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader>Confirmer le renommage</AlertDialogHeader>
              <AlertDialogBody>
                Renommer la guilde "{guilds.find(g => g.id === renameGuildId)?.name}" en "{renameGuildName}" ?
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
