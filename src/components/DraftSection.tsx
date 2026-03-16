import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  IconButton,
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
  Spinner,
  Tag,
  TagLabel,
  Progress,
  Tooltip,
  SimpleGrid,
} from "@chakra-ui/react";
import { ArrowForwardIcon, AddIcon } from "@chakra-ui/icons";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { IGuild, IUser } from "../interfaces";
import { useGuilds, useAllGuildsMemberCounts, useGuildlessUsers } from "@/hooks/useAPI";
import { useAPIMutations } from "@/hooks/useAPIMutations";
import { UserDisplay } from "./ui/UserDisplay";
import { CustomSelect } from "./ui/CustomSelect";

interface DraftMove {
  id: string;
  user: IUser;
  fromGuild: IGuild | null;
  toGuild: IGuild | null;
}

interface DraftSectionProps {
  onDraftComplete: () => void;
}

const DraftSection: React.FC<DraftSectionProps> = ({ onDraftComplete }) => {
  const { guilds } = useGuilds(true);
  const { membersByGuild, isLoading: membersLoading } =
    useAllGuildsMemberCounts(guilds, true);
  const { executeDraft } = useAPIMutations();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [draftMoves, setDraftMoves] = useState<DraftMove[]>([]);
  const [selectedSourceGuild, setSelectedSourceGuild] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedTargetGuild, setSelectedTargetGuild] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);

  const { users: guildlessUsers, isLoading: guildlessLoading } =
    useGuildlessUsers(selectedSourceGuild === "__no_guild__");

  const cardBg = useColorModeValue("white", "gray.800");
  const subtleBg = useColorModeValue("gray.50", "gray.750");
  const selectBg = useColorModeValue("orange.50", "rgba(251, 146, 60, 0.06)");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const moveHoverBg = useColorModeValue("gray.50", "gray.650");
  const accentGradient = "linear(to-r, orange.400, pink.400)";
  const modalBg = useColorModeValue("white", "gray.800");
  const progressBg = useColorModeValue("gray.200", "gray.600");

  const allMembers = useMemo(() => {
    const members: (IUser & { guildId: string })[] = [];
    for (const [guildId, guildMembers] of Object.entries(membersByGuild)) {
      for (const member of guildMembers) {
        members.push({ ...member, guildId });
      }
    }
    // Include guildless users with empty guildId
    for (const user of guildlessUsers) {
      members.push({ ...user, guildId: "" });
    }
    return members;
  }, [membersByGuild, guildlessUsers]);

  const availableUsers = useMemo(() => {
    const draftedUserIds = new Set(draftMoves.map((m) => m.user._id));
    if (selectedSourceGuild === "__no_guild__") {
      return guildlessUsers.filter((u) => !draftedUserIds.has(u._id));
    }
    if (!selectedSourceGuild) return [];
    return (membersByGuild[selectedSourceGuild] || []).filter(
      (member) => !draftedUserIds.has(member._id)
    );
  }, [selectedSourceGuild, membersByGuild, guildlessUsers, draftMoves]);

  const projectedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const guild of guilds) {
      counts[guild._id] = membersByGuild[guild._id]?.length || 0;
    }
    for (const move of draftMoves) {
      if (move.fromGuild) {
        counts[move.fromGuild._id] = (counts[move.fromGuild._id] || 0) - 1;
      }
      if (move.toGuild) {
        counts[move.toGuild._id] = (counts[move.toGuild._id] || 0) + 1;
      }
    }
    return counts;
  }, [guilds, membersByGuild, draftMoves]);

  const hasOverflow = useMemo(
    () => guilds.some((g) => (projectedCounts[g._id] || 0) > 20),
    [guilds, projectedCounts]
  );

  useEffect(() => {
    setSelectedUser("");
  }, [selectedSourceGuild]);

  const guildMap = useMemo(() => {
    const map: Record<string, IGuild> = {};
    guilds.forEach((g) => (map[g._id] = g));
    return map;
  }, [guilds]);

  const addMove = useCallback(() => {
    if (!selectedUser || !selectedTargetGuild) return;

    const user = allMembers.find((m) => m._id === selectedUser);
    if (!user) return;

    const isRemoval = selectedTargetGuild === "__none__";
    const isFromNoGuild = selectedSourceGuild === "__no_guild__";
    const fromGuild = isFromNoGuild ? null : (user.guildId ? guildMap[user.guildId] || null : null);
    const toGuild = isRemoval ? null : guildMap[selectedTargetGuild] || null;

    if (!isRemoval && !toGuild) return;

    if (!isRemoval && fromGuild && fromGuild._id === toGuild!._id) {
      toast({
        title: "Même guilde",
        description: "Le joueur est déjà dans cette guilde",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    if (isRemoval && isFromNoGuild) {
      toast({
        title: "Action inutile",
        description: "Ce joueur n'a déjà pas de guilde",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    setDraftMoves((prev) => [
      ...prev,
      {
        id: `${user._id}-${Date.now()}`,
        user,
        fromGuild,
        toGuild,
      },
    ]);
    setSelectedUser("");
    setSelectedTargetGuild("");
  }, [selectedUser, selectedTargetGuild, selectedSourceGuild, allMembers, guildMap, toast]);

  const removeMove = (moveId: string) => {
    setDraftMoves((prev) => prev.filter((m) => m.id !== moveId));
  };

  const clearDraft = () => {
    setDraftMoves([]);
    setSelectedSourceGuild("");
    setSelectedUser("");
    setSelectedTargetGuild("");
  };

  const handleExecuteDraft = async () => {
    setIsExecuting(true);
    try {
      const moves = draftMoves.map((m) => ({
        userId: m.user._id,
        toGuildId: m.toGuild?._id || null,
      }));

      await executeDraft(moves);

      toast({
        title: "Draft exécuté",
        description: `${draftMoves.length} joueur(s) déplacé(s) avec succès`,
        status: "success",
        duration: 3000,
      });

      clearDraft();
      onClose();
      onDraftComplete();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'exécution du draft",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  if (membersLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="orange.500" />
        <Text mt={2} color={mutedText}>
          Chargement des données...
        </Text>
      </Box>
    );
  }

  return (
    <Box w="100%" maxW="960px" mx="auto">
      <VStack spacing={5} align="stretch">
        {/* Header with gradient accent */}
        <Box position="relative" overflow="hidden" borderRadius="xl" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <Box h="3px" bgGradient={accentGradient} />
          <Box p={5}>
            <HStack spacing={3} mb={1}>
              <Text fontSize="xl" fontWeight="bold">
                Draft de Guildes
              </Text>
              {draftMoves.length > 0 && (
                <Badge
                  colorScheme="orange"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="xs"
                >
                  {draftMoves.length}
                </Badge>
              )}
            </HStack>
            <Text fontSize="sm" color={mutedText}>
              Préparez vos transferts puis validez en une seule opération.
            </Text>
          </Box>
        </Box>

        {/* Form */}
        <Box bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={5}>
          <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedText} mb={4}>
            Nouveau transfert
          </Text>
          <Flex gap={3} direction={{ base: "column", md: "row" }} align={{ md: "flex-end" }}>
            <Box flex={1}>
              <Text fontSize="xs" fontWeight="medium" mb={1.5} color={mutedText}>
                Depuis
              </Text>
              <CustomSelect
                placeholder="Guilde source"
                value={selectedSourceGuild}
                onChange={(val) => setSelectedSourceGuild(val)}
                size="sm"
                bg={selectBg}
                allowDeselect={false}
                accentColor="orange.400"
                options={[
                  { value: "__no_guild__", label: "Sans guilde" },
                  ...guilds.map((guild) => ({
                    value: guild._id,
                    label: `${guild.name} (${membersByGuild[guild._id]?.length || 0})`,
                  })),
                ]}
              />
            </Box>

            <Box flex={1}>
              <Text fontSize="xs" fontWeight="medium" mb={1.5} color={mutedText}>
                Joueur
              </Text>
              <CustomSelect
                placeholder="Sélectionner"
                value={selectedUser}
                onChange={(val) => setSelectedUser(val)}
                size="sm"
                bg={selectBg}
                allowDeselect={false}
                enableSearch
                accentColor="orange.400"

                isDisabled={!selectedSourceGuild}
                isLoading={guildlessLoading}
                options={availableUsers.map((user) => ({
                  value: user._id,
                  label: user.bbs_name || user.global_name || user.username,
                }))}
              />
            </Box>

            <Box flex={1}>
              <Text fontSize="xs" fontWeight="medium" mb={1.5} color={mutedText}>
                Vers
              </Text>
              <CustomSelect
                placeholder="Guilde cible"
                value={selectedTargetGuild}
                onChange={(val) => setSelectedTargetGuild(val)}
                size="sm"
                bg={selectBg}
                allowDeselect={false}
                accentColor="orange.400"
                isDisabled={!selectedUser}
                options={[
                  ...(selectedSourceGuild !== "__no_guild__"
                    ? [{ value: "__none__", label: "✕ Retirer de la guilde" }]
                    : []),
                  ...guilds
                    .filter((g) => g._id !== selectedSourceGuild)
                    .map((guild) => {
                      const count = projectedCounts[guild._id] || 0;
                      return {
                        value: guild._id,
                        label: `${guild.name} (${count}/20)${count >= 20 ? " — pleine" : ""}`,
                      };
                    }),
                ]}
              />
            </Box>

            <Tooltip label={!selectedUser || !selectedTargetGuild ? "Remplissez tous les champs" : "Ajouter ce transfert"} hasArrow>
              <IconButton
                aria-label="Ajouter"
                icon={<AddIcon />}
                colorScheme="orange"
                size="sm"
                borderRadius="lg"
                onClick={addMove}
                isDisabled={!selectedUser || !selectedTargetGuild}
              />
            </Tooltip>
          </Flex>
        </Box>

        {/* Move list */}
        {draftMoves.length > 0 ? (
          <Box bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} overflow="hidden">
            <Flex justify="space-between" align="center" px={5} pt={4} pb={2}>
              <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedText}>
                Transferts
              </Text>
              <Button size="xs" variant="ghost" colorScheme="red" fontWeight="normal" onClick={clearDraft}>
                Tout effacer
              </Button>
            </Flex>

            <VStack spacing={0} align="stretch" px={3} pb={2}>
              {draftMoves.map((move, index) => (
                <Flex
                  key={move.id}
                  align="center"
                  gap={3}
                  px={3}
                  py={2.5}
                  borderRadius="lg"
                  transition="background 0.15s"
                  _hover={{ bg: moveHoverBg }}
                  borderBottomWidth={index < draftMoves.length - 1 ? "1px" : 0}
                  borderColor={borderColor}
                >
                  <Box flex={1} minW={0}>
                    <UserDisplay user={move.user} avatarSize="xs" textSize="sm" asLink={false} />
                  </Box>

                  <HStack spacing={2} flexShrink={0}>
                    <Tag size="sm" borderRadius="full" variant="subtle" colorScheme="red">
                      <TagLabel>{move.fromGuild?.name || "—"}</TagLabel>
                    </Tag>
                    <ArrowForwardIcon boxSize={3} color={mutedText} />
                    <Tag size="sm" borderRadius="full" variant="subtle" colorScheme={move.toGuild ? "green" : "gray"}>
                      <TagLabel>{move.toGuild?.name || "Retrait"}</TagLabel>
                    </Tag>
                  </HStack>

                  <IconButton
                    aria-label="Retirer"
                    icon={<Text fontSize="sm">✕</Text>}
                    size="xs"
                    variant="ghost"
                    borderRadius="full"
                    color={mutedText}
                    _hover={{ bg: "red.50", color: "red.500", _dark: { bg: "red.900", color: "red.300" } }}
                    onClick={() => removeMove(move.id)}
                  />
                </Flex>
              ))}
            </VStack>

            {/* Guild capacity overview */}
            <Box px={5} pb={4} pt={2}>
              <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedText} mb={3}>
                Effectifs après draft
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2, md: guilds.length }} spacing={3}>
                {guilds.map((guild) => {
                  const current = membersByGuild[guild._id]?.length || 0;
                  const projected = projectedCounts[guild._id] || 0;
                  const diff = projected - current;
                  const pct = (projected / 20) * 100;
                  const isOver = projected > 20;
                  const barScheme = isOver ? "red" : projected === 20 ? "orange" : "green";

                  return (
                    <Box key={guild._id} bg={subtleBg} borderRadius="lg" p={3}>
                      <Flex justify="space-between" mb={1.5}>
                        <Text fontSize="xs" fontWeight="bold">
                          {guild.name}
                        </Text>
                        <HStack spacing={1}>
                          <Text fontSize="xs" fontWeight="bold" color={isOver ? "red.400" : undefined}>
                            {projected}
                          </Text>
                          <Text fontSize="xs" color={mutedText}>/20</Text>
                          {diff !== 0 && (
                            <Text fontSize="xs" fontWeight="semibold" color={diff > 0 ? (isOver ? "red.400" : "orange.400") : "green.400"}>
                              {diff > 0 ? `+${diff}` : diff}
                            </Text>
                          )}
                        </HStack>
                      </Flex>
                      <Progress
                        value={Math.min(pct, 100)}
                        size="xs"
                        borderRadius="full"
                        colorScheme={barScheme}
                        bg={progressBg}
                      />
                    </Box>
                  );
                })}
              </SimpleGrid>

              {hasOverflow && (
                <Alert status="error" mt={3} borderRadius="lg" py={2} fontSize="sm">
                  <AlertIcon />
                  Des guildes dépassent 20 membres — déplacez ou retirez des joueurs avant de valider.
                </Alert>
              )}
            </Box>

            {/* Actions */}
            <Flex justify="flex-end" gap={3} px={5} pb={5}>
              <Button variant="ghost" onClick={clearDraft} size="sm" borderRadius="lg">
                Annuler
              </Button>
              <Button
                colorScheme="orange"
                size="sm"
                borderRadius="lg"
                onClick={onOpen}
                isDisabled={hasOverflow}
                title={hasOverflow ? "Des guildes dépassent la limite de 20 membres" : undefined}
                leftIcon={<Text fontSize="sm">✓</Text>}
              >
                Valider ({draftMoves.length})
              </Button>
            </Flex>
          </Box>
        ) : (
          <Box
            bg={cardBg}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            borderStyle="dashed"
            p={8}
            textAlign="center"
          >
            <Text color={mutedText} fontSize="sm">
              Aucun transfert prévu — utilisez le formulaire ci-dessus pour commencer.
            </Text>
          </Box>
        )}
      </VStack>

      {/* Confirmation modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" bg={modalBg} mx={4}>
          <Box h="3px" bgGradient={accentGradient} borderTopRadius="xl" />
          <ModalHeader pb={2}>Confirmer le draft</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" mb={5} borderRadius="lg" fontSize="sm">
              <AlertIcon />
              Les joueurs seront d'abord retirés de leur guilde, puis réassignés. 
              Cette opération est irréversible.
            </Alert>

            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedText} mb={3}>
              {draftMoves.length} transfert{draftMoves.length > 1 ? "s" : ""}
            </Text>

            <VStack spacing={0} align="stretch" borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
              {draftMoves.map((move, index) => (
                <Flex
                  key={move.id}
                  py={3}
                  px={4}
                  align="center"
                  gap={3}
                  borderBottomWidth={index < draftMoves.length - 1 ? "1px" : 0}
                  borderColor={borderColor}
                >
                  <Text fontSize="sm" fontWeight="medium" flex={1}>
                    {move.user.bbs_name || move.user.global_name || move.user.username}
                  </Text>
                  <HStack spacing={2}>
                    <Tag size="sm" borderRadius="full" variant="subtle" colorScheme="red">
                      <TagLabel>{move.fromGuild?.name || "—"}</TagLabel>
                    </Tag>
                    <ArrowForwardIcon boxSize={3} color={mutedText} />
                    <Tag size="sm" borderRadius="full" variant="subtle" colorScheme={move.toGuild ? "green" : "gray"}>
                      <TagLabel>{move.toGuild?.name || "Retrait"}</TagLabel>
                    </Tag>
                  </HStack>
                </Flex>
              ))}
            </VStack>

            {/* Impact summary - only guilds that change */}
            {guilds.some((g) => (membersByGuild[g._id]?.length || 0) !== (projectedCounts[g._id] || 0)) && (
              <Box mt={4}>
                <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color={mutedText} mb={2}>
                  Impact
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {guilds
                    .filter((g) => (membersByGuild[g._id]?.length || 0) !== (projectedCounts[g._id] || 0))
                    .map((guild) => {
                      const current = membersByGuild[guild._id]?.length || 0;
                      const projected = projectedCounts[guild._id] || 0;
                      const diff = projected - current;
                      return (
                        <Tag key={guild._id} size="sm" borderRadius="full" variant="outline">
                          <TagLabel>
                            {guild.name} {current}→{projected}{" "}
                            <Text as="span" color={diff > 0 ? "orange.400" : "green.400"} fontWeight="bold">
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
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="lg">
              Annuler
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleExecuteDraft}
              isLoading={isExecuting}
              loadingText="Exécution..."
              borderRadius="lg"
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
