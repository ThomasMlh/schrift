import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
  Alert,
  AlertIcon,
  Flex,
  Tag,
  TagLabel,
  Progress,
  Tooltip,
  Grid,
  GridItem,
  Avatar,
  Divider,
} from "@chakra-ui/react";
import { AddIcon, ArrowForwardIcon, CheckIcon } from "@chakra-ui/icons";
import { DraftMoveRow } from "./draft/DraftMoveRow";
import { useState, useMemo, useCallback } from "react";
import type { IGuild, IUser } from "../interfaces";
import {
  useGuilds,
  useAllGuildsMembers,
  useGuildlessUsers
} from "@/hooks/useAPI";
import { useAPIMutations } from "@/hooks/useAPIMutations";
import { CustomSelect } from "./ui/CustomSelect";
import { PageLoader } from "./ui/PageLoader";
import { getGuildColor, type GuildColor } from "./draft/guildColors";

interface DraftMove {
  id: string;
  user: IUser;
  bbsId: string;
  fromGuild: IGuild | null;
  toGuild: IGuild | null;
}

interface DraftSectionProps {
  onDraftComplete: () => void;
}

const DraftSection: React.FC<DraftSectionProps> = ({ onDraftComplete }) => {
  const { guilds } = useGuilds(true);
  const { membersByGuild, isLoading: membersLoading } =
    useAllGuildsMembers(guilds, true);
  const { executeDraft } = useAPIMutations();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [draftMoves, setDraftMoves] = useState<DraftMove[]>([]);
  const [selectedBbsId, setSelectedBbsId] = useState<string>("");
  const [selectedTargetGuild, setSelectedTargetGuild] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);

  // Unified pool (the source guild is inferred from the selected player), always loaded
  const { users: guildlessUsers, isLoading: guildlessLoading } = useGuildlessUsers(true);

  const cardBg = "bg.card";
  const sidebarBg     = useColorModeValue("gray.50", "gray.850");
  const borderColor   = useColorModeValue("gray.200", "gray.700");
  const mutedText     = useColorModeValue("gray.500", "gray.400");
  const progressBg = "border.default";
  const rowHoverBg    = useColorModeValue("gray.50", "gray.700");
  const modalBg = "bg.card";
  const emptyBg = "bg.muted";
  const guildCardBg = "bg.elevated";

  // Drafts work on bbs accounts, not users: an account without bbs_id (guild/role assigned before
  // the game account was linked) cannot be sent to the API, so it is left out of the pool.
  const allMembers = useMemo(() => {
    const members: (IUser & { guildId: string })[] = [];
    for (const [guildId, guildMembers] of Object.entries(membersByGuild)) {
      for (const member of guildMembers) {
        if (member.bbs_id) members.push({ ...member, guildId });
      }
    }
    for (const user of guildlessUsers) {
      if (user.bbs_id) members.push({ ...user, guildId: "" });
    }
    return members;
  }, [membersByGuild, guildlessUsers]);

  // Players offered in the select (all members and guildless accounts), minus those already
  // in the current draft.
  const availableUsers = useMemo(() => {
    const draftedBbsIds = new Set(draftMoves.map((m) => m.bbsId));
    return allMembers.filter((member) => !draftedBbsIds.has(member.bbs_id!));
  }, [allMembers, draftMoves]);

  const projectedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const guild of guilds) {
      counts[guild._id] = membersByGuild[guild._id]?.length || 0;
    }
    for (const move of draftMoves) {
      if (move.fromGuild) counts[move.fromGuild._id] = (counts[move.fromGuild._id] || 0) - 1;
      if (move.toGuild)   counts[move.toGuild._id]   = (counts[move.toGuild._id]   || 0) + 1;
    }
    return counts;
  }, [guilds, membersByGuild, draftMoves]);

  const hasOverflow = useMemo(
    () => guilds.some((g) => (projectedCounts[g._id] || 0) > 20),
    [guilds, projectedCounts]
  );

  const guildMap = useMemo(() => {
    const map: Record<string, IGuild> = {};
    guilds.forEach((g) => (map[g._id] = g));
    return map;
  }, [guilds]);

  const guildColorMap = useMemo(() => {
    const map: Record<string, GuildColor> = {};
    guilds.forEach((g, i) => (map[g._id] = getGuildColor(i)));
    return map;
  }, [guilds]);

  // Selected account, identified by bbs_id rather than user._id since a user can appear once per account.
  const selectedUserData = useMemo(
    () => availableUsers.find((u) => u.bbs_id === selectedBbsId) ?? null,
    [availableUsers, selectedBbsId]
  );

  const addMove = useCallback(() => {
    if (!selectedBbsId || !selectedTargetGuild) return;
    const user = allMembers.find((m) => m.bbs_id === selectedBbsId);
    if (!user) return;

    const isRemoval = selectedTargetGuild === "__none__";
    const fromGuild = user.guildId ? guildMap[user.guildId] || null : null;
    const toGuild    = isRemoval ? null : guildMap[selectedTargetGuild] || null;

    if (!isRemoval && !toGuild) return;
    if (!isRemoval && fromGuild && fromGuild._id === toGuild!._id) {
      toast({ title: "Même guilde", description: "Le joueur est déjà dans cette guilde", status: "warning", duration: 2000 });
      return;
    }
    if (isRemoval && !fromGuild) {
      toast({ title: "Action inutile", description: "Ce joueur n'a déjà pas de guilde", status: "warning", duration: 2000 });
      return;
    }

    setDraftMoves((prev) => [...prev, { id: `${user.bbs_id}-${Date.now()}`, user, bbsId: user.bbs_id!, fromGuild, toGuild }]);
    setSelectedBbsId("");
    setSelectedTargetGuild("");
  }, [selectedBbsId, selectedTargetGuild, allMembers, guildMap, toast]);

  const removeMove  = (moveId: string) => setDraftMoves((prev) => prev.filter((m) => m.id !== moveId));

  const updateMoveTarget = useCallback((moveId: string, newToGuildId: string | null) => {
    setDraftMoves((prev) => {
      const move = prev.find((m) => m.id === moveId);
      if (!move) return prev;
      if (newToGuildId && move.fromGuild && move.fromGuild._id === newToGuildId) {
        toast({ title: "Même guilde", description: "Le joueur est déjà dans cette guilde", status: "warning", duration: 2000 });
        return prev;
      }
      if (!newToGuildId && !move.fromGuild) {
        toast({ title: "Action inutile", description: "Ce joueur n'a déjà pas de guilde", status: "warning", duration: 2000 });
        return prev;
      }
      const newToGuild = newToGuildId ? guildMap[newToGuildId] || null : null;
      return prev.map((m) => (m.id === moveId ? { ...m, toGuild: newToGuild } : m));
    });
  }, [guildMap, toast]);

  const getTargetOptionsForMove = useCallback((move: DraftMove) => [
    ...(move.fromGuild ? [{ value: "__none__", label: "✕ Retirer de la guilde" }] : []),
    ...guilds
      .filter((g) => g._id !== move.fromGuild?._id)
      .map((g) => {
        const count = projectedCounts[g._id] || 0;
        return {
          value: g._id,
          label: `${g.name} (${count}/20)${count >= 20 ? " — pleine" : ""}`
        };
      })
  ], [guilds, projectedCounts]);

  const clearDraft  = () => {
    setDraftMoves([]);
    setSelectedBbsId("");
    setSelectedTargetGuild("");
  };

  const handleExecuteDraft = async () => {
    setIsExecuting(true);
    try {
      await executeDraft(draftMoves.map((m) => ({ userId: m.user._id, bbsId: m.bbsId, toGuildId: m.toGuild?._id || null })));
      toast({ title: "Draft exécuté", description: `${draftMoves.length} joueur(s) déplacé(s)`, status: "success", duration: 3000 });
      clearDraft();
      onClose();
      onDraftComplete();
    } catch (error) {
      toast({ title: "Erreur", description: error instanceof Error ? error.message : "Erreur lors de l'exécution", status: "error", duration: 5000 });
    } finally {
      setIsExecuting(false);
    }
  };

  const getAvatarUrl = (user: IUser) =>
    user.avatar && user.discord_id
      ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.webp?size=64`
      : undefined;

  // Player select option: avatar, guild and role
  const renderPlayerOption = (user: IUser & { guildId: string }) => {
    const guild = user.guildId ? guildMap[user.guildId] : null;
    const color = user.guildId ? guildColorMap[user.guildId] : "gray";
    return (
      <HStack spacing={2} overflow="hidden">
        <Avatar
          size="2xs"
          src={getAvatarUrl(user)}
          name={user.bbs_name || user.global_name}
          flexShrink={0}
        />
        <Text fontWeight="medium" isTruncated>
          {user.bbs_name || user.global_name || user.username}
        </Text>
        <Badge colorScheme={color} fontSize="2xs" borderRadius="full" flexShrink={0}>
          {guild ? guild.name : "Sans guilde"}
        </Badge>
        {(user.role === "chef" || user.role === "sous-chef") && (
          <Badge
            colorScheme={user.role === "chef" ? "red" : "orange"}
            fontSize="2xs"
            borderRadius="full"
            flexShrink={0}
          >
            {user.role === "chef" ? "👑" : "🥈"}
          </Badge>
        )}
      </HStack>
    );
  };

  if (membersLoading) {
    return <PageLoader color="orange.500" height="200px" />;
  }

  return (
    <Box w="100%" maxW="1100px" mx="auto">
      <Grid
        templateColumns={{ base: "1fr", lg: "280px 1fr" }}
        gap={5}
        alignItems="start"
      >
        <GridItem>
          <Box
            bg={sidebarBg}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            overflow="hidden"
            position={{ lg: "sticky" }}
            top={{ lg: "20px" }}
          >
            <Box px={4} py={3} borderBottomWidth="1px" borderColor={borderColor}>
              <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedText}>
                Effectifs
                {draftMoves.length > 0 && (
                  <Text as="span" color="orange.400" ml={2}>après draft</Text>
                )}
              </Text>
            </Box>

            <VStack spacing={0} align="stretch" p={3}>
              {guilds.map((guild) => {
                const color     = guildColorMap[guild._id];
                const current   = membersByGuild[guild._id]?.length || 0;
                const projected = projectedCounts[guild._id] || 0;
                const diff      = projected - current;
                const pct       = Math.min((projected / 20) * 100, 100);
                const isOver    = projected > 20;
                const barColor  = isOver ? "red" : projected >= 18 ? "orange" : color;

                return (
                  <Box
                    key={guild._id}
                    bg={guildCardBg}
                    borderRadius="xl"
                    p={3}
                    mb={2}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderLeftWidth="3px"
                    borderLeftColor={`${color}.400`}
                  >
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{guild.name}</Text>
                      <HStack spacing={1}>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color={isOver ? "red.400" : `${color}.400`}
                        >
                          {projected}
                        </Text>
                        <Text fontSize="xs" color={mutedText}>/20</Text>
                        {diff !== 0 && (
                          <Badge
                            colorScheme={diff > 0 ? (isOver ? "red" : "orange") : "green"}
                            fontSize="2xs"
                            borderRadius="full"
                            px={1.5}
                          >
                            {diff > 0 ? `+${diff}` : diff}
                          </Badge>
                        )}
                      </HStack>
                    </Flex>
                    <Progress
                      value={pct}
                      size="xs"
                      borderRadius="full"
                      colorScheme={barColor}
                      bg={progressBg}
                    />
                  </Box>
                );
              })}

              <Box
                bg={guildCardBg}
                borderRadius="xl"
                p={3}
                borderWidth="1px"
                borderColor={borderColor}
                borderLeftWidth="3px"
                borderLeftColor="gray.400"
              >
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" fontWeight="semibold" color={mutedText}>Sans guilde</Text>
                  <Text fontSize="sm" fontWeight="bold" color={mutedText}>
                    {guildlessUsers.length}
                  </Text>
                </Flex>
              </Box>
            </VStack>
          </Box>
        </GridItem>

        <GridItem>
          <VStack spacing={4} align="stretch">

            <Flex align="center" justify="space-between">
              <HStack spacing={3}>
                <Text fontSize="xl" fontWeight="bold">Draft de Guildes</Text>
                {draftMoves.length > 0 && (
                  <Badge colorScheme="orange" borderRadius="full" px={2.5} fontSize="xs">
                    {draftMoves.length}
                  </Badge>
                )}
              </HStack>
              {draftMoves.length > 0 && (
                <Button size="xs" variant="ghost" colorScheme="red" onClick={clearDraft}>
                  Tout effacer
                </Button>
              )}
            </Flex>

            <Box
              bg={cardBg}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
              p={5}
            >
              <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedText} mb={4}>
                Nouveau transfert
              </Text>

              <Grid
                templateColumns={{ base: "1fr", md: "1fr auto 1fr auto" }}
                gap={3}
                alignItems="end"
              >
                <Box>
                  <Text fontSize="xs" fontWeight="medium" mb={1.5} color={mutedText}>
                    Joueur
                  </Text>
                  <CustomSelect
                    placeholder="Rechercher un joueur"
                    value={selectedBbsId}
                    onChange={setSelectedBbsId}
                    size="sm"
                    allowDeselect={false}
                    enableSearch
                    accentColor="orange.400"
                    isLoading={guildlessLoading}
                    renderSelected={(option) => option.content}
                    options={availableUsers.map((u) => ({
                      value: u.bbs_id!,
                      label: u.bbs_name || u.global_name || u.username,
                      content: renderPlayerOption(u)
                    }))}
                  />
                </Box>

                <Box display={{ base: "none", md: "flex" }} alignItems="center" pb={1}>
                  <ArrowForwardIcon color={selectedBbsId ? "orange.400" : "gray.300"} boxSize={4} />
                </Box>

                <Box>
                  <Text fontSize="xs" fontWeight="medium" mb={1.5} color={mutedText}>Vers</Text>
                  <CustomSelect
                    placeholder="Guilde cible"
                    value={selectedTargetGuild}
                    onChange={setSelectedTargetGuild}
                    size="sm"
                    allowDeselect={false}
                    accentColor="orange.400"
                    isDisabled={!selectedBbsId}
                    options={[
                      ...(selectedUserData?.guildId
                        ? [{ value: "__none__", label: "✕ Retirer de la guilde" }]
                        : []),
                      ...guilds
                        .filter((g) => g._id !== selectedUserData?.guildId)
                        .map((g) => {
                          const count = projectedCounts[g._id] || 0;
                          return {
                            value: g._id,
                            label: `${g.name} (${count}/20)${count >= 20 ? " — pleine" : ""}`
                          };
                        })
                    ]}
                  />
                </Box>

                <Tooltip label={!selectedBbsId || !selectedTargetGuild ? "Remplissez tous les champs" : "Ajouter ce transfert"} hasArrow>
                  <Button
                    leftIcon={<AddIcon boxSize={3} />}
                    colorScheme="orange"
                    size="sm"
                    borderRadius="lg"
                    onClick={addMove}
                    isDisabled={!selectedBbsId || !selectedTargetGuild}
                    px={4}
                    alignSelf="flex-end"
                    mb={{ base: 0, md: 0 }}
                  >
                    Ajouter
                  </Button>
                </Tooltip>
              </Grid>
            </Box>

            {draftMoves.length > 0 ? (
              <Box
                bg={cardBg}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                overflow="hidden"
              >
                <Box px={5} pt={4} pb={3}>
                  <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedText}>
                    Transferts planifiés
                  </Text>
                </Box>

                <Divider borderColor={borderColor} />

                <VStack spacing={0} align="stretch">
                  {draftMoves.map((move, index) => (
                    <DraftMoveRow
                      key={move.id}
                      move={move}
                      fromColor={move.fromGuild ? guildColorMap[move.fromGuild._id] : "gray"}
                      toColor={move.toGuild ? guildColorMap[move.toGuild._id] : "gray"}
                      borderColor={borderColor}
                      isLast={index === draftMoves.length - 1}
                      getAvatarUrl={getAvatarUrl}
                      onRemove={removeMove}
                      onChangeTarget={updateMoveTarget}
                      targetOptions={getTargetOptionsForMove(move)}
                      hoverBg={rowHoverBg}
                      mutedText={mutedText}
                    />
                  ))}
                </VStack>

                {hasOverflow && (
                  <Box px={5} pb={3} pt={2}>
                    <Alert status="error" borderRadius="lg" py={2} fontSize="sm">
                      <AlertIcon />
                      Des guildes dépassent 20 membres — corrigez avant de valider.
                    </Alert>
                  </Box>
                )}

                <Flex justify="flex-end" gap={3} px={5} pb={5} pt={2}>
                  <Button variant="ghost" size="sm" borderRadius="lg" onClick={clearDraft}>
                    Annuler
                  </Button>
                  <Button
                    colorScheme="orange"
                    size="sm"
                    borderRadius="lg"
                    leftIcon={<CheckIcon boxSize={3} />}
                    onClick={onOpen}
                    isDisabled={hasOverflow}
                  >
                    Valider ({draftMoves.length})
                  </Button>
                </Flex>
              </Box>
            ) : (
              <Box
                bg={emptyBg}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                borderStyle="dashed"
                p={10}
                textAlign="center"
              >
                <Text fontSize="2xl" mb={2}>🏟️</Text>
                <Text color={mutedText} fontSize="sm">
                  Aucun transfert planifié
                </Text>
                <Text color={mutedText} fontSize="xs" mt={1}>
                  Utilisez le formulaire ci-dessus pour commencer.
                </Text>
              </Box>
            )}
          </VStack>
        </GridItem>
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" bg={modalBg} mx={4}>
          <Box h="3px" bgGradient="linear(to-r, orange.400, pink.400)" borderTopRadius="xl" />
          <ModalHeader pb={2}>Confirmer le draft</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" mb={5} borderRadius="lg" fontSize="sm">
              <AlertIcon />
              Les joueurs seront retirés de leur guilde puis réassignés. Opération irréversible.
            </Alert>

            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedText} mb={3}>
              {draftMoves.length} transfert{draftMoves.length > 1 ? "s" : ""}
            </Text>

            <VStack spacing={0} align="stretch" borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
              {draftMoves.map((move, index) => (
                <DraftMoveRow
                  key={move.id}
                  move={move}
                  fromColor={move.fromGuild ? guildColorMap[move.fromGuild._id] : "gray"}
                  toColor={move.toGuild ? guildColorMap[move.toGuild._id] : "gray"}
                  borderColor={borderColor}
                  isLast={index === draftMoves.length - 1}
                  getAvatarUrl={getAvatarUrl}
                  compact
                />
              ))}
            </VStack>

            {guilds.some((g) => (membersByGuild[g._id]?.length || 0) !== (projectedCounts[g._id] || 0)) && (
              <Box mt={4}>
                <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedText} mb={2}>
                  Impact
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {guilds
                    .filter((g) => (membersByGuild[g._id]?.length || 0) !== (projectedCounts[g._id] || 0))
                    .map((guild) => {
                      const current   = membersByGuild[guild._id]?.length || 0;
                      const projected = projectedCounts[guild._id] || 0;
                      const diff      = projected - current;
                      const color     = guildColorMap[guild._id];
                      return (
                        <Tag key={guild._id} size="sm" borderRadius="full" colorScheme={color} variant="outline">
                          <TagLabel>
                            {guild.name} {current}→{projected}{" "}
                            <Text as="span" fontWeight="bold" color={diff > 0 ? "orange.400" : "green.400"}>
                              ({diff > 0 ? `+${diff}` : diff})
                            </Text>
                          </TagLabel>
                        </Tag>
                      );
                    })}
                </Flex>
              </Box>
            )}
          </ModalBody>

          <ModalFooter pt={2}>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="lg">Annuler</Button>
            <Button
              colorScheme="orange"
              onClick={handleExecuteDraft}
              isLoading={isExecuting}
              loadingText="Exécution…"
              borderRadius="lg"
              leftIcon={<CheckIcon />}
            >
              Confirmer et exécuter
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DraftSection;
