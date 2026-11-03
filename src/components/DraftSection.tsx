import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Text,
  VStack,
  useBreakpointValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { Role } from "../interfaces";
import { useGuilds, useAllGuildsMembers, useGuildlessUsers } from "@/hooks/useAPI";
import { useAPIMutations } from "@/hooks/useAPIMutations";
import { PageLoader } from "./ui/PageLoader";
import { getGuildColor } from "./draft/guildColors";
import { DraftPlayerChip, GuildTag, RoleIcon } from "./draft/DraftPlayerChip";
import { DraftActionsPopover, DraftActionsSheet, type DraftActionsProps } from "./draft/DraftPlayerActions";
import { DraftSearchBar } from "./draft/DraftSearchBar";
import {
  columnEntries,
  finalState,
  isRoleChange,
  isTransfer,
  setChange,
  toDraftAccount,
  type DraftAccount,
  type DraftChanges,
} from "@/utils/draftBoard";

const MAX_MEMBERS = 20;
const NONE = "__none__";

interface DraftSectionProps {
  onDraftComplete: () => void;
}

const matches = (account: DraftAccount, term: string) =>
  [account.name, account.user.global_name, account.user.username].some((name) => name?.toLowerCase().includes(term));

// Guild draft board: one column per guild plus the guildless accounts (tabs on mobile), a search bar
// to move someone in two clicks, and the pending transfers and role changes validated in one go.
const DraftSection = ({ onDraftComplete }: DraftSectionProps) => {
  const { guilds } = useGuilds(true);
  const { membersByGuild, isLoading: membersLoading } = useAllGuildsMembers(guilds, true);
  const { executeDraft } = useAPIMutations();
  const toast = useToast();
  const confirm = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;

  const [changes, setChanges] = useState<DraftChanges>({});
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [poolFilter, setPoolFilter] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");
  const [sheetAccount, setSheetAccount] = useState<DraftAccount | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const { users: guildless, totalCount: guildlessCount } = useGuildlessUsers(true);
  const { users: guildlessFound, isLoading: searching } = useGuildlessUsers(!!debouncedSearch.trim(), debouncedSearch);

  // Drafts work on bbs accounts: an account without bbs_id cannot be sent to the API
  const membersOf = useMemo(() => {
    const byGuild: Record<string, DraftAccount[]> = {};
    for (const guild of guilds) {
      byGuild[guild._id] = (membersByGuild[guild._id] ?? []).filter((u) => u.bbs_id).map((u) => toDraftAccount(u, guild._id));
    }
    byGuild[NONE] = guildless.filter((u) => u.bbs_id).map((u) => toDraftAccount(u, null));
    return byGuild;
  }, [guilds, membersByGuild, guildless]);

  const guildColor = useMemo(() => {
    const map = new Map(guilds.map((g, i) => [g._id, getGuildColor(i)]));
    return (guildId: string | null) => (guildId ? map.get(guildId) ?? "gray" : "gray");
  }, [guilds]);
  const guildInfo = (guildId: string | null) =>
    guildId ? { name: guilds.find((g) => g._id === guildId)?.name ?? "?", color: guildColor(guildId) } : null;

  const columns = useMemo(() => [...guilds.map((g) => ({ id: g._id as string | null, key: g._id, name: g.name })), { id: null, key: NONE, name: "Sans guilde" }], [guilds]);
  const entries = useMemo(
    () => Object.fromEntries(columns.map((col) => [col.key, columnEntries(col.id, membersOf[col.key] ?? [], changes)])),
    [columns, membersOf, changes],
  );
  const counts = useMemo(
    () => Object.fromEntries(guilds.map((g) => [g._id, entries[g._id].staying.length + entries[g._id].incoming.length])),
    [guilds, entries],
  );

  const changeList = Object.values(changes);
  const transfers = changeList.filter(isTransfer);
  const roleChanges = changeList.filter(isRoleChange);
  const overflow = guilds.filter((g) => counts[g._id] > MAX_MEMBERS);

  const searchResults = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return [];
    const inGuilds = guilds.flatMap((g) => membersOf[g._id]).filter((a) => matches(a, term));
    return [...inGuilds, ...guildlessFound.filter((u) => u.bbs_id).map((u) => toDraftAccount(u, null))];
  }, [debouncedSearch, guilds, membersOf, guildlessFound]);

  const move = (account: DraftAccount, toGuildId: string | null) => setChanges((prev) => setChange(prev, account, { toGuildId }));
  const changeRole = (account: DraftAccount, role: Role) => setChanges((prev) => setChange(prev, account, { role }));
  const reset = (account: DraftAccount) => setChanges((prev) => {
    const next = { ...prev };
    delete next[account.bbsId];
    return next;
  });

  const actionsFor = (account: DraftAccount): DraftActionsProps => {
    const final = finalState(account, changes);
    return {
      account,
      finalGuildId: final.guildId,
      finalRole: final.role,
      isChanged: !!changes[account.bbsId],
      guilds,
      guildColor,
      counts,
      onMove: (to) => move(account, to),
      onRole: (role) => changeRole(account, role),
      onReset: () => reset(account),
    };
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await executeDraft(changeList.map((c) => ({
        userId: c.account.user._id,
        bbsId: c.account.bbsId,
        toGuildId: c.toGuildId,
        ...(c.role ? { role: c.role } : {}),
      })));
      toast({ title: "Draft exécuté", description: `${transfers.length} transfert(s), ${roleChanges.length} rôle(s)`, status: "success", duration: 3000 });
      setChanges({});
      confirm.onClose();
      onDraftComplete();
    } catch (error) {
      toast({ title: "Erreur", description: error instanceof Error ? error.message : "Erreur lors de l'exécution", status: "error", duration: 5000 });
    } finally {
      setIsExecuting(false);
    }
  };

  if (membersLoading) return <PageLoader color="purple.400" height="200px" />;

  const renderChip = (account: DraftAccount, state: "stay" | "in" | "out") => {
    const final = finalState(account, changes);
    const change = changes[account.bbsId];
    const chip = (
      <DraftPlayerChip
        account={account}
        finalRole={final.role}
        state={state}
        otherGuild={state === "in" ? guildInfo(account.guildId) : state === "out" ? guildInfo(final.guildId) : undefined}
        roleChanged={!!change && isRoleChange(change)}
        onClick={isMobile ? () => setSheetAccount(account) : undefined}
      />
    );
    return (
      <Box key={account.bbsId}>
        {isMobile ? chip : <DraftActionsPopover {...actionsFor(account)} trigger={chip} />}
      </Box>
    );
  };

  const renderColumn = (col: (typeof columns)[number]) => {
    const { incoming, outgoing, staying } = entries[col.key];
    const isPool = col.id === null;
    const count = isPool ? guildlessCount - outgoing.length + incoming.length : counts[col.key];
    const filter = poolFilter.trim().toLowerCase();
    const shownStaying = isPool && filter ? staying.filter((a) => matches(a, filter)) : staying;
    const color = guildColor(col.id);
    const isOver = !isPool && count > MAX_MEMBERS;

    return (
      <Box
        key={col.key}
        bg="bg.card"
        borderWidth="1px"
        borderColor="border.subtle"
        borderTopWidth="3px"
        borderTopColor={`${color}.400`}
        borderRadius="xl"
        p={3}
        minW={0}
        display="flex"
        flexDirection="column"
      >
        <Flex justify="space-between" align="baseline" mb={1}>
          <Text fontWeight="extrabold" fontSize="lg" color={`${color}.300`} noOfLines={1}>{col.name}</Text>
          <Text fontWeight="extrabold" fontSize="lg" color={isOver ? "red.400" : count === MAX_MEMBERS ? "green.300" : "text.strong"}>
            {count}
            {!isPool && <Text as="span" fontSize="xs" color="text.muted">/{MAX_MEMBERS}</Text>}
          </Text>
        </Flex>
        {!isPool && <Progress value={Math.min((count / MAX_MEMBERS) * 100, 100)} size="xs" borderRadius="full" colorScheme={isOver ? "red" : color} mb={1.5} />}
        <HStack spacing={2} fontSize="xs" fontWeight="bold" mb={2} minH="18px">
          {incoming.length > 0 && <Text color="green.300">+{incoming.length}</Text>}
          {outgoing.length > 0 && <Text color="red.300">−{outgoing.length}</Text>}
        </HStack>
        {isPool && (
          <Input size="sm" mb={2} placeholder="Filtrer…" aria-label="Filtrer les joueurs sans guilde" value={poolFilter} onChange={(e) => setPoolFilter(e.target.value)} />
        )}
        {/* On desktop the guildless list takes no height of its own: it scrolls within the guild columns' height */}
        <VStack
          align="stretch"
          spacing={1}
          {...(isPool && !isMobile ? { flex: "1 1 0", minH: "240px", overflowY: "auto", pr: 1 } : {})}
        >
          {incoming.map((a) => renderChip(a, "in"))}
          {outgoing.map((a) => renderChip(a, "out"))}
          {shownStaying.map((a) => renderChip(a, "stay"))}
        </VStack>
      </Box>
    );
  };

  const currentTab = columns.find((c) => c.key === activeTab) ?? columns[0];

  return (
    <Box w="100%" maxW="1400px" mx="auto">
      <VStack align="stretch" spacing={4}>
        <Text fontSize="xl" fontWeight="bold">Draft de Guildes</Text>

        <DraftSearchBar
          value={search}
          onChange={setSearch}
          results={searchResults}
          isLoading={searching}
          guilds={guilds}
          guildColor={guildColor}
          finalGuildId={(account) => finalState(account, changes).guildId}
          onMove={move}
        />

        {overflow.length > 0 && (
          <Alert status="error" borderRadius="lg" py={2} fontSize="sm">
            <AlertIcon />
            {overflow.map((g) => g.name).join(", ")} dépasse{overflow.length > 1 ? "nt" : ""} {MAX_MEMBERS} membres : corrigez avant de valider.
          </Alert>
        )}

        {isMobile ? (
          <>
            <HStack spacing={2} overflowX="auto" pb={1} position="sticky" top={0} zIndex="sticky" bg="bg.page" py={2}>
              {columns.map((col) => {
                const { incoming, outgoing } = entries[col.key];
                const isActive = col.key === currentTab.key;
                const color = guildColor(col.id);
                return (
                  <Button
                    key={col.key}
                    onClick={() => setActiveTab(col.key)}
                    variant="outline"
                    flexShrink={0}
                    h="auto"
                    py={1.5}
                    px={3}
                    flexDirection="column"
                    alignItems="flex-start"
                    borderColor={isActive ? `${color}.400` : "border.subtle"}
                    bg={isActive ? "bg.subtle" : "bg.card"}
                    aria-pressed={isActive}
                  >
                    <Text fontWeight="extrabold" color={`${color}.300`}>{col.id ? col.name : "Sans"}</Text>
                    <Text fontSize="xs" fontWeight="normal">
                      {col.id ? `${counts[col.key]}/${MAX_MEMBERS}` : guildlessCount}
                      {(incoming.length > 0 || outgoing.length > 0) && ` · +${incoming.length} −${outgoing.length}`}
                    </Text>
                  </Button>
                );
              })}
            </HStack>
            {renderColumn(currentTab)}
          </>
        ) : (
          <Grid templateColumns={`repeat(${columns.length}, minmax(0, 1fr))`} gap={3} alignItems="stretch">
            {columns.map(renderColumn)}
          </Grid>
        )}

        {changeList.length > 0 && (
          <Flex
            position="sticky"
            bottom={3}
            zIndex="sticky"
            align="center"
            gap={3}
            px={4}
            py={2.5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border.default"
            bg="bg.elevated"
            boxShadow="lg"
          >
            <Text fontSize="sm" mr="auto">
              <Text as="b">{transfers.length}</Text> transfert{transfers.length > 1 ? "s" : ""} · <Text as="b">{roleChanges.length}</Text> rôle{roleChanges.length > 1 ? "s" : ""}
            </Text>
            <Button size="sm" variant="ghost" onClick={() => setChanges({})}>Tout annuler</Button>
            <Button size="sm" colorScheme="purple" leftIcon={<CheckIcon boxSize={3} />} onClick={confirm.onOpen} isDisabled={overflow.length > 0}>
              Valider le draft
            </Button>
          </Flex>
        )}
      </VStack>

      {sheetAccount && (
        <DraftActionsSheet {...actionsFor(sheetAccount)} isOpen onClose={() => setSheetAccount(null)} />
      )}

      <Modal isOpen={confirm.isOpen} onClose={confirm.onClose} size="xl" isCentered scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" bg="bg.card" mx={4}>
          <ModalHeader pb={2}>Confirmer le draft</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" mb={4} borderRadius="lg" fontSize="sm">
              <AlertIcon />
              Les transferts et les rôles seront appliqués immédiatement.
            </Alert>
            <VStack align="stretch" spacing={4}>
              {[...guilds.map((g) => g._id as string | null), null].map((guildId) => {
                const arriving = changeList.filter((c) => c.toGuildId === guildId && (isTransfer(c) || isRoleChange(c)));
                if (arriving.length === 0) return null;
                const guild = guildInfo(guildId);
                return (
                  <Box key={guildId ?? NONE}>
                    <HStack mb={1.5}>
                      <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color="text.muted">Vers</Text>
                      <GuildTag guild={guild} />
                      {guildId && <Badge variant="subtle">{counts[guildId]}/{MAX_MEMBERS}</Badge>}
                    </HStack>
                    <VStack align="stretch" spacing={1}>
                      {arriving.map((c) => (
                        <HStack key={c.account.bbsId} fontSize="sm" spacing={2}>
                          <Text fontWeight="semibold" noOfLines={1}>{c.account.name}</Text>
                          {isTransfer(c) ? (
                            <HStack spacing={1}><Text color="text.muted">depuis</Text><GuildTag guild={guildInfo(c.account.guildId)} /></HStack>
                          ) : (
                            <Text color="text.muted">{c.account.role ?? "membre"} →</Text>
                          )}
                          {c.role && c.role !== "membre" && <HStack spacing={1}><RoleIcon role={c.role} /><Text>{c.role}</Text></HStack>}
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                );
              })}
            </VStack>
          </ModalBody>
          <ModalFooter pt={2}>
            <Button variant="ghost" mr={3} onClick={confirm.onClose}>Annuler</Button>
            <Button colorScheme="purple" onClick={handleExecute} isLoading={isExecuting} loadingText="Exécution…" leftIcon={<CheckIcon />}>
              Confirmer et exécuter
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DraftSection;
