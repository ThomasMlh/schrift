import { useMemo, useState } from "react";
import {
  Badge, Box, Button, Flex, HStack, Icon, IconButton, Input, InputGroup, InputLeftElement, Menu, MenuButton,
  MenuDivider, MenuGroup, MenuItem, MenuList, Progress, Skeleton, Text, VStack, useDisclosure, useToast,
} from "@chakra-ui/react";
import { FiEdit2, FiMoreHorizontal, FiPause, FiPlay, FiPlus, FiSearch, FiTrash2, FiUserMinus, FiUserPlus } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import type { IGuild, IUser, Role } from "@/interfaces";
import { useAllGuildsMembers, useGuilds } from "@/hooks/useAPI";
import { useAPIMutations } from "@/hooks/useAPIMutations";
import { CustomSelect } from "./ui/CustomSelect";
import { UserDisplay } from "./ui/UserDisplay";
import { GuildLogo } from "./guild/GuildLogo";
import { AddMemberModal, ConfirmDialog, GuildNameModal } from "./admin/guilds/GuildAdminDialogs";

// Maximum number of members per guild
const GUILD_CAPACITY = 20;

const ROLE_ORDER: Record<Role, number> = { chef: 1, "sous-chef": 2, membre: 3 };

const memberName = (member: IUser) => member.bbs_name || member.global_name || member.username || "";

// Leader, then officers, then members; alphabetical within each role
const sortMembers = (members: IUser[]) =>
  [...members].sort((a, b) =>
    (ROLE_ORDER[a.role] - ROLE_ORDER[b.role])
    || memberName(a).localeCompare(memberName(b), "fr", { sensitivity: "base" })
  );

const errorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

type PendingConfirm =
  | { kind: "delete-guild"; guild: IGuild }
  | { kind: "toggle-guild"; guild: IGuild }
  | { kind: "remove-member"; guild: IGuild; member: IUser };

// Admin Guilds tab: pick a guild, then manage it (name, status, deletion) and its members
// (add, role, move, remove) in one place.
const GuildsAdminSection = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const {
    createGuild, updateGuild, deleteGuild, toggleGuildDisable,
    assignUserToGuild, removeGuildMember, updateUserRole, moveUserToGuild,
  } = useAPIMutations();

  const { guilds: rawGuilds, isLoading: guildsLoading, mutate: mutateGuilds } = useGuilds(true, true);
  const guilds = useMemo(
    () => [...rawGuilds].sort((a, b) => (a.name || "").localeCompare(b.name || "", "fr", { sensitivity: "base" })),
    [rawGuilds]
  );
  const { membersByGuild, isLoading: membersLoading, refresh: refreshMembers } = useAllGuildsMembers(guilds, true);

  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const createModal = useDisclosure();
  const renameModal = useDisclosure();
  const addMemberModal = useDisclosure();

  const selected = guilds.find((g) => g._id === selectedId) ?? guilds[0];
  const members = selected ? sortMembers(membersByGuild[selected._id] ?? []) : [];
  const visibleMembers = search.trim()
    ? members.filter((m) => memberName(m).toLowerCase().includes(search.trim().toLowerCase()))
    : members;
  const countOf = (guildId: string) => membersByGuild[guildId]?.length ?? 0;
  const leaders = members.filter((m) => m.role === "chef" || m.role === "sous-chef");

  const refreshAll = () => {
    mutateGuilds();
    refreshMembers();
  };

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    try {
      const data = await action() as { message?: string } | undefined;
      refreshAll();
      toast({ title: data?.message || success, status: "success", duration: 2500 });
    } catch (error) {
      toast({ title: errorMessage(error, failure), status: "error" });
      throw error;
    }
  };

  const handleCreate = async (name: string) => {
    await run(() => createGuild({ name }), "Guilde créée", "Erreur lors de la création de la guilde");
  };
  const handleRename = async (name: string) => {
    if (!selected) return;
    await run(() => updateGuild(selected._id, { name }), "Guilde renommée", "Erreur lors du renommage");
  };

  const handleAddMember = async (userId: string, role: Role) => {
    if (!selected) return;
    await run(async () => {
      await assignUserToGuild(selected._id, userId);
      if (role !== "membre") await updateUserRole(userId, role);
    }, "Membre ajouté", "Erreur lors de l'ajout du membre");
  };
  const handleRoleChange = (member: IUser, role: Role) =>
    run(() => updateUserRole(member._id, role), `${memberName(member)} est maintenant ${t(`components.guildTabsList.${role === "chef" ? "roleChef" : role === "sous-chef" ? "roleSousChef" : "roleMembre"}`)}`, "Erreur lors du changement de rôle")
      .catch(() => undefined);
  const handleMove = (member: IUser, target: IGuild) =>
    run(() => moveUserToGuild(member._id, target._id), `${memberName(member)} a rejoint Schrift ${target.name}`, "Erreur lors du déplacement")
      .catch(() => undefined);

  const confirmPending = async () => {
    if (!pending) return;
    if (pending.kind === "delete-guild") {
      await run(() => deleteGuild(pending.guild._id), "Guilde supprimée", "Erreur lors de la suppression");
      setSelectedId("");
    } else if (pending.kind === "toggle-guild") {
      await run(() => toggleGuildDisable(pending.guild._id), "Statut de la guilde modifié", "Erreur lors du changement de statut");
    } else {
      await run(() => removeGuildMember(pending.guild._id, pending.member._id), "Membre retiré de la guilde", "Erreur lors du retrait");
    }
  };

  return (
    <VStack align="stretch" spacing={5}>
      <Box overflowX="auto" mx={{ base: -3, md: -1 }} px={{ base: 3, md: 1 }} mt={-1} pt={1.5} pb={2}>
        <HStack spacing={3} minW="max-content" role="tablist" aria-label="Guildes">
          {guildsLoading && guilds.length === 0 && Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} w="170px" h="78px" borderRadius="xl" />
          ))}
          {guilds.map((guild) => {
            const isSelected = selected?._id === guild._id;
            const count = countOf(guild._id);
            const isFull = count >= GUILD_CAPACITY;
            return (
              <Box
                key={guild._id}
                as="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => { setSelectedId(guild._id); setSearch(""); }}
                w="170px"
                px={3}
                py={3}
                textAlign="left"
                borderRadius="xl"
                borderWidth="1px"
                borderColor={isSelected ? "purple.400" : "border.subtle"}
                bg={isSelected ? "rgba(159, 122, 234, 0.12)" : "bg.card"}
                boxShadow={isSelected ? "0 0 0 1px var(--chakra-colors-purple-400)" : undefined}
                opacity={guild.disabled ? 0.6 : 1}
                transition="border-color 0.15s, transform 0.15s"
                _hover={{ borderColor: "purple.400", transform: "translateY(-2px)" }}
              >
                <HStack spacing={2.5} mb={2}>
                  <GuildLogo guild={guild} size="28px" />
                  <Text fontWeight="bold" color={isSelected ? "purple.300" : "text.strong"} noOfLines={1} flex={1}>
                    {guild.name}
                  </Text>
                  {guild.disabled && <Icon as={FiPause} color="text.muted" boxSize={3.5} aria-label="Désactivée" />}
                </HStack>
                <Progress
                  value={(count / GUILD_CAPACITY) * 100}
                  size="xs"
                  borderRadius="full"
                  colorScheme={isFull ? "orange" : "purple"}
                  bg="bg.inset"
                />
                <Text fontSize="xs" color="text.muted" mt={1}>
                  {membersLoading ? "…" : `${count} / ${GUILD_CAPACITY}`}
                </Text>
              </Box>
            );
          })}
          <Button
            onClick={createModal.onOpen}
            variant="outline"
            borderStyle="dashed"
            h="78px"
            w="150px"
            borderRadius="xl"
            leftIcon={<Icon as={FiPlus} />}
            color="text.secondary"
          >
            Nouvelle guilde
          </Button>
        </HStack>
      </Box>

      {selected && (
        <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="2xl" overflow="hidden">
          <Flex
            px={{ base: 4, md: 6 }}
            py={5}
            gap={4}
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            borderBottomWidth="1px"
            borderColor="border.subtle"
          >
            <HStack spacing={4} minW={0}>
              <GuildLogo guild={selected} size="56px" />
              <Box minW={0}>
                <HStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="extrabold" letterSpacing="tight" color="text.strong">
                    Schrift {selected.name}
                  </Text>
                  {selected.disabled && <Badge colorScheme="gray" borderRadius="full" px={2}>Désactivée</Badge>}
                </HStack>
                <HStack spacing={3} mt={1} fontSize="sm" color="text.muted" flexWrap="wrap">
                  <Text>{countOf(selected._id)} / {GUILD_CAPACITY} membres</Text>
                  {leaders.length > 0 && (
                    <HStack spacing={1.5} minW={0}>
                      <Icon as={FaCrown} boxSize={3.5} color="purple.400" aria-hidden />
                      <Text noOfLines={1}>{leaders.map(memberName).join(" · ")}</Text>
                    </HStack>
                  )}
                </HStack>
              </Box>
            </HStack>

            <HStack spacing={2} flexShrink={0}>
              <Button
                colorScheme="purple"
                size="sm"
                leftIcon={<Icon as={FiUserPlus} />}
                onClick={addMemberModal.onOpen}
                isDisabled={countOf(selected._id) >= GUILD_CAPACITY}
                title={countOf(selected._id) >= GUILD_CAPACITY ? "Guilde complète" : undefined}
              >
                Ajouter un membre
              </Button>
              <Menu placement="bottom-end">
                <MenuButton as={IconButton} icon={<FiMoreHorizontal />} size="sm" variant="outline" aria-label="Actions sur la guilde" />
                <MenuList>
                  <MenuItem icon={<Icon as={FiEdit2} />} onClick={renameModal.onOpen}>Renommer</MenuItem>
                  <MenuItem
                    icon={<Icon as={selected.disabled ? FiPlay : FiPause} />}
                    onClick={() => setPending({ kind: "toggle-guild", guild: selected })}
                  >
                    {selected.disabled ? "Réactiver" : "Désactiver"}
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem
                    icon={<Icon as={FiTrash2} />}
                    color="red.400"
                    onClick={() => setPending({ kind: "delete-guild", guild: selected })}
                  >
                    Supprimer la guilde
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>

          <Box px={{ base: 3, md: 6 }} py={4}>
            <InputGroup size="sm" maxW={{ md: "320px" }} mb={3}>
              <InputLeftElement pointerEvents="none"><Icon as={FiSearch} color="text.muted" /></InputLeftElement>
              <Input placeholder="Rechercher un membre" value={search} onChange={(e) => setSearch(e.target.value)} borderRadius="lg" />
            </InputGroup>

            {membersLoading && members.length === 0 ? (
              <VStack align="stretch" spacing={2}>
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h="48px" borderRadius="lg" />)}
              </VStack>
            ) : visibleMembers.length === 0 ? (
              <Text color="text.muted" textAlign="center" py={8}>
                {members.length === 0 ? t("components.guildTabsList.noMemberInGuild") : "Aucun membre ne correspond à la recherche."}
              </Text>
            ) : (
              <VStack align="stretch" spacing={1}>
                {visibleMembers.map((member) => {
                  const targets = guilds.filter((g) => g._id !== selected._id && !g.disabled && countOf(g._id) < GUILD_CAPACITY);
                  return (
                    <Flex
                      key={member._id}
                      align="center"
                      gap={3}
                      px={3}
                      py={2}
                      borderRadius="lg"
                      _hover={{ bg: "bg.hover" }}
                    >
                      <Box flex={1} minW={0}>
                        <UserDisplay user={member} />
                      </Box>
                      <CustomSelect
                        size="sm"
                        value={member.role}
                        w="130px"
                        onChange={(val) => handleRoleChange(member, val as Role)}
                        options={[
                          { value: "chef", label: t("components.guildTabsList.roleChef") },
                          { value: "sous-chef", label: t("components.guildTabsList.roleSousChef") },
                          { value: "membre", label: t("components.guildTabsList.roleMembre") },
                        ]}
                        allowDeselect={false}
                      />
                      <Menu placement="bottom-end" isLazy>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreHorizontal />}
                          size="sm"
                          variant="ghost"
                          aria-label={`Actions pour ${memberName(member)}`}
                        />
                        <MenuList>
                          <MenuGroup title="Déplacer vers">
                            {targets.length === 0 ? (
                              <MenuItem isDisabled>Aucune guilde avec de la place</MenuItem>
                            ) : targets.map((target) => (
                              <MenuItem key={target._id} onClick={() => handleMove(member, target)}>
                                <HStack justify="space-between" w="100%" spacing={4}>
                                  <Text>Schrift {target.name}</Text>
                                  <Text fontSize="xs" color="text.muted">
                                    {GUILD_CAPACITY - countOf(target._id)} place{GUILD_CAPACITY - countOf(target._id) > 1 ? "s" : ""}
                                  </Text>
                                </HStack>
                              </MenuItem>
                            ))}
                          </MenuGroup>
                          <MenuDivider />
                          <MenuItem
                            icon={<Icon as={FiUserMinus} />}
                            color="red.400"
                            onClick={() => setPending({ kind: "remove-member", guild: selected, member })}
                          >
                            Retirer de la guilde
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Flex>
                  );
                })}
              </VStack>
            )}
          </Box>
        </Box>
      )}

      <GuildNameModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        title="Nouvelle guilde"
        submitLabel="Créer"
        onSubmit={handleCreate}
      />
      {selected && (
        <>
          <GuildNameModal
            isOpen={renameModal.isOpen}
            onClose={renameModal.onClose}
            title={`Renommer Schrift ${selected.name}`}
            submitLabel="Renommer"
            initialName={selected.name}
            onSubmit={handleRename}
          />
          <AddMemberModal
            isOpen={addMemberModal.isOpen}
            onClose={addMemberModal.onClose}
            guild={selected}
            guilds={guilds}
            onSubmit={handleAddMember}
          />
        </>
      )}
      <ConfirmDialog
        isOpen={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={confirmPending}
        colorScheme={pending?.kind === "toggle-guild" ? "orange" : "red"}
        title={
          pending?.kind === "delete-guild" ? "Supprimer la guilde"
            : pending?.kind === "toggle-guild" ? (pending.guild.disabled ? "Réactiver la guilde" : "Désactiver la guilde")
            : "Retirer le membre"
        }
        confirmLabel={
          pending?.kind === "delete-guild" ? "Supprimer"
            : pending?.kind === "toggle-guild" ? (pending.guild.disabled ? "Réactiver" : "Désactiver")
            : "Retirer"
        }
        body={
          pending?.kind === "delete-guild"
            ? `Supprimer définitivement Schrift ${pending.guild.name} ? Cette action est irréversible.`
            : pending?.kind === "toggle-guild"
            ? (pending.guild.disabled
              ? `Schrift ${pending.guild.name} réapparaîtra sur le site, sans membres : il faudra les y ajouter de nouveau.`
              : `Schrift ${pending.guild.name} sera masquée du site et tous ses membres (${countOf(pending.guild._id)}) en seront retirés. Ses scores passés sont conservés.`)
            : pending?.kind === "remove-member"
            ? `Retirer ${memberName(pending.member)} de Schrift ${pending.guild.name} ?`
            : ""
        }
      />
    </VStack>
  );
};

export default GuildsAdminSection;
