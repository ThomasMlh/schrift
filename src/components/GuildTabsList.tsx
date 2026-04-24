import {
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Box,
  VStack,
  Text,
  HStack,
  Stack,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useBreakpointValue,
  useColorModeValue
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { CustomSelect } from "./ui/CustomSelect";
import type { Role, IGuild, IUser } from "../interfaces";
import { UserDisplay } from "./ui/UserDisplay";
import { useGuilds } from "@/hooks/useAPI";
import { useAPIMutations } from "@/hooks/useAPIMutations";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "react-i18next";

interface GuildTabsListProps {
  editable?: boolean;
  refreshTrigger?: number;
}

const GuildTabsList: React.FC<GuildTabsListProps> = ({
  editable = false,
  refreshTrigger = 0
}) => {
  const { getAuthHeaders } = useAuth();
  const { t } = useTranslation();
  const { updateUserRole, moveUserToGuild, removeGuildMember } = useAPIMutations();
  // Utiliser useSWR pour les guildes (cache automatique + déduplication)
  const { guilds: allGuilds, mutate: mutateGuilds } = useGuilds(true, editable);
  // En mode éditable (admin), afficher toutes les guildes ; sinon filtrer les désactivées
  const guilds = editable ? allGuilds : allGuilds.filter(g => !g.disabled);
  
  // États
  const [membersByGuild, setMembersByGuild] = useState<Record<string, IUser[]>>(
    {}
  );
  const [isDeleteMemberOpen, setIsDeleteMemberOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string;
    name: string;
    guildId: string;
  } | null>(null);
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const orientation =
    useBreakpointValue<"vertical" | "horizontal">({
      base: "vertical",
      md: "horizontal"
    }) || "horizontal";

  // API URL depuis les variables d'environnement
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const shadowColor = useColorModeValue("lg", "dark-lg");

  // Charger les membres quand les guildes changent
  useEffect(() => {
    if (!apiUrl || guilds.length === 0) return;

    guilds.forEach((guild) => {
      fetch(`${apiUrl}/api/guildes/${guild._id}/membres`, {
        headers: getAuthHeaders()
      })
        .then((res) => res.json())
        .then((data) => {
          // L'API retourne { success: true, membres: [...], count: number } ou { success: true, data: [...], count: number }
          const membersList = data.data || data;
          const members = Array.isArray(membersList) ? membersList : [];

          setMembersByGuild((prev) => {
            const updated = {
              ...prev,
              [guild._id]: members
            };
            return updated;
          });
        })
        .catch((error) => {
          setMembersByGuild((prev) => ({ ...prev, [guild._id]: [] }));
          toast({
            title: t("common.error"),
            description:
              error.message ||
              `Impossible de recharger les membres de la guilde ${guild.name}`,
            status: "error",
            duration: 3000
          });
        });
    });
  }, [apiUrl, guilds, toast, getAuthHeaders]);

  // Réagir aux changements externes (quand une guilde est modifiée depuis AdminPage)
  useEffect(() => {
    if (refreshTrigger > 0) {
      // Recharger les guildes avec mutate
      mutateGuilds();
    }
  }, [refreshTrigger, mutateGuilds]);

  // Fonction pour recharger les membres
  const loadMembers = () => {
    if (!apiUrl || guilds.length === 0) return;

    guilds.forEach((guild) => {
      fetch(`${apiUrl}/api/guildes/${guild._id}/membres`, {
        headers: getAuthHeaders()
      })
        .then((res) => res.json())
        .then((data) => {
          // L'API retourne { success: true, membres: [...], count: number } ou { success: true, data: [...], count: number }
          const membersList = data.data || data;
          const members = Array.isArray(membersList) ? membersList : [];

          setMembersByGuild((prev) => ({
            ...prev,
            [guild._id]: members
          }));
        })
        .catch((error) => {
          setMembersByGuild((prev) => ({ ...prev, [guild._id]: [] }));
          toast({
            title: t("common.error"),
            description:
              error instanceof Error
                ? error.message
                : `Impossible de recharger les membres de la guilde ${guild.name}`,
            status: "error",
            duration: 3000
          });
        });
    });
  };

  // Ouvrir la popup de confirmation pour supprimer un membre
  const handleRemoveMember = (member: IUser, guildId: string) => {
    setMemberToDelete({
      id: member._id,
      name: member.global_name || member.username,
      guildId: guildId
    });
    setIsDeleteMemberOpen(true);
  };

  // Confirmer la suppression du membre
  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      await removeGuildMember(memberToDelete.guildId, memberToDelete.id);

      loadMembers();
      toast({
        title: t("components.guildTabsList.toastMemberRemovedTitle"),
        description: t("components.guildTabsList.toastMemberRemovedDesc"),
        status: "success",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("components.guildTabsList.toastDeleteError"),
        status: "error",
        duration: 3000
      });
    } finally {
      setIsDeleteMemberOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleRoleChange = async (member: IUser, newRole: Role) => {
    try {
      await updateUserRole(member._id, newRole);

      loadMembers();
      toast({
        title: t("components.guildTabsList.toastRoleChangedTitle"),
        description: `${member.username} ${t("components.guildTabsList.toastRoleChangedDesc")} ${
          newRole === "chef"
            ? t("components.guildTabsList.roleChef")
            : newRole === "sous-chef"
            ? t("components.guildTabsList.roleSousChef")
            : t("components.guildTabsList.roleMembre")
        }`,
        status: "success",
        duration: 2000
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("components.guildTabsList.toastRoleError");
      toast({
        title: t("common.error"),
        description: errorMessage,
        status: "error",
        duration: 3000
      });
    }
  };

  const handleMoveMember = async (
    fromGuildId: string,
    member: IUser,
    toGuildId: string
  ) => {
    if (fromGuildId === toGuildId || !apiUrl) return;

    const targetGuild = guilds.find((g) => g._id === toGuildId);

    try {
      await moveUserToGuild(member._id, toGuildId);

      loadMembers();
      toast({
        title: t("components.guildTabsList.toastMovedTitle"),
        description: `${member.username} ${t("components.guildTabsList.toastMovedDesc")} ${
          targetGuild?.name || t("components.guildTabsList.toastMovedFallback")
        }`,
        status: "success",
        duration: 2000
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("components.guildTabsList.toastMoveError");
      toast({
        title: t("common.error"),
        description: errorMessage,
        status: "error",
        duration: 3000
      });
    }
  };

  // Fonction pour trier les membres : chef > sous-chefs > membres, puis alphabétique
  const sortMembers = (members: IUser[]): IUser[] => {
    return [...members].sort((a, b) => {
      // Définir l'ordre de priorité des rôles
      const roleOrder = { chef: 1, "sous-chef": 2, membre: 3 };

      // Comparer d'abord par rôle
      const roleComparison = roleOrder[a.role] - roleOrder[b.role];
      if (roleComparison !== 0) {
        return roleComparison;
      }

      // Si même rôle, trier par ordre alphabétique
      return a.username.localeCompare(b.username, "fr", {
        sensitivity: "base"
      });
    });
  };

  if (guilds.length === 0 || !guilds) {
    return (
      <Text color="gray.500" textAlign="center" py={8}>
        {t("components.guildTabsList.noGuildAvailable")}
      </Text>
    );
  }

  return (
    <Tabs
      isFitted
      variant="enclosed"
      colorScheme="white"
      w="100%"
      borderWidth="1px"
      borderTopLeftRadius="md"
      borderTopRightRadius="md"
      borderBottomLeftRadius="0"
      borderBottomRightRadius="0"
      orientation={orientation}
      boxShadow={shadowColor}
    >
      <TabList>
        {guilds.map((guild: IGuild) => (
          <Tab
            key={guild._id}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            opacity={guild.disabled ? 0.5 : 1}
          >
            Ṣčhrīft {guild.name} {guild.disabled ? `(${t("components.guildTabsList.guildDisabled")})` : ""}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {guilds.map((guild: IGuild) => (
          <TabPanel key={guild._id} px={0}>
            <Box
              borderRadius="md"
              borderTopRadius="0"
              bg="white"
              _dark={{ bg: "gray.800" }}
              maxH="60vh"
              overflowY="auto"
              p={3}
            >
              <Box p={4}>
                <Text fontSize="xs" color="gray.500">
                  {membersByGuild[guild._id]?.length || 0} / 20 {t("components.guildTabsList.membersCount")}
                </Text>
              </Box>
              <VStack spacing={4} align="stretch">
                {membersByGuild[guild._id]?.length > 0 ? (
                  sortMembers(membersByGuild[guild._id]).map(
                    (member: IUser) => (
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
                          <UserDisplay user={member} roleBadge />
                        </VStack>
                        {editable && (
                          <Stack
                            direction={{ base: "column", md: "row" }}
                            spacing={2}
                            w={{ base: "100%", md: "auto" }}
                          >
                            <CustomSelect
                              size="sm"
                              value={member.role}
                              w="auto"
                              onChange={(val) =>
                                handleRoleChange(member, val as Role)
                              }
                              options={[
                                { value: "membre", label: t("components.guildTabsList.roleMembre") },
                                { value: "sous-chef", label: t("components.guildTabsList.roleSousChef") },
                                { value: "chef", label: t("components.guildTabsList.roleChef") },
                              ]}
                              allowDeselect={false}
                            />
                            <HStack
                              spacing={2}
                              justify={{
                                base: "space-between",
                                md: "flex-start"
                              }}
                            >
                              <IconButton
                                aria-label={t("components.guildTabsList.ariaDeleteMember")}
                                icon={<span>🗑️</span>}
                                size="sm"
                                bg="red.500"
                                color="white"
                                _hover={{ bg: "red.600" }}
                                onClick={() =>
                                  handleRemoveMember(member, guild._id)
                                }
                              />
                              <CustomSelect
                                size="sm"
                                value={guild._id}
                                onChange={(val) =>
                                  handleMoveMember(
                                    guild._id,
                                    member,
                                    val
                                  )
                                }
                                w="auto"
                                flex={1}
                                options={[
                                  { value: guild._id, label: t("components.guildTabsList.moveStay") },
                                  ...guilds
                                    .filter(
                                      (g: IGuild) =>
                                        g._id !== guild._id &&
                                        (membersByGuild[g._id]?.length ?? 0) < 20
                                    )
                                    .map((g: IGuild) => ({
                                      value: g._id,
                                      label: `→ ${g.name}`,
                                    })),
                                ]}
                                allowDeselect={false}
                              />
                            </HStack>
                          </Stack>
                        )}
                      </Stack>
                    )
                  )
                ) : (
                  <Text color="gray.500" textAlign="center" py={8}>
                    {t("components.guildTabsList.noMemberInGuild")}
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
            <AlertDialogHeader>{t("components.guildTabsList.dialogDeleteTitle")}</AlertDialogHeader>
            <AlertDialogBody>
              {t("components.guildTabsList.dialogDeleteBody", { name: memberToDelete?.name })}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  setIsDeleteMemberOpen(false);
                  setMemberToDelete(null);
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteMember} ml={3}>
                {t("common.delete")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Tabs>
  );
};

export { GuildTabsList };
