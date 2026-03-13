import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Select,
  IconButton,
  useToast,
  Badge,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { DeleteIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { IGuild, IUser } from "../interfaces";
import { useGuilds, useAllGuildsMemberCounts } from "@/hooks/useAPI";
import { useAPIMutations } from "@/hooks/useAPIMutations";
import { UserDisplay } from "./ui/UserDisplay";

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
  const { membersByGuild, isLoading: membersLoading } = useAllGuildsMemberCounts(guilds, true);
  const { executeDraft } = useAPIMutations();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Draft state
  const [draftMoves, setDraftMoves] = useState<DraftMove[]>([]);
  const [selectedSourceGuild, setSelectedSourceGuild] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedTargetGuild, setSelectedTargetGuild] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);

  // Colors
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerBg = useColorModeValue("orange.50", "orange.900");
  const moveBg = useColorModeValue("gray.50", "gray.600");

  // All members flat list
  const allMembers = useMemo(() => {
    const members: (IUser & { guildId: string })[] = [];
    for (const [guildId, guildMembers] of Object.entries(membersByGuild)) {
      for (const member of guildMembers) {
        members.push({ ...member, guildId });
      }
    }
    return members;
  }, [membersByGuild]);

  // Available users for the selected source guild (excluding already drafted users)
  const availableUsers = useMemo(() => {
    if (!selectedSourceGuild) return [];
    const draftedUserIds = new Set(draftMoves.map((m) => m.user._id));
    return (membersByGuild[selectedSourceGuild] || []).filter(
      (member) => !draftedUserIds.has(member._id)
    );
  }, [selectedSourceGuild, membersByGuild, draftMoves]);

  // Calculate projected member counts per guild after all moves
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

  // Reset user selection when source guild changes
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
    const fromGuild = user.guildId ? guildMap[user.guildId] || null : null;
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

    const move: DraftMove = {
      id: `${user._id}-${Date.now()}`,
      user,
      fromGuild,
      toGuild,
    };

    setDraftMoves((prev) => [...prev, move]);
    setSelectedUser("");
    setSelectedTargetGuild("");
  }, [selectedUser, selectedTargetGuild, allMembers, guildMap, toast]);

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
        <Text mt={2} color="gray.500">
          Chargement des données...
        </Text>
      </Box>
    );
  }

  return (
    <Box
      w="100%"
      maxW="900px"
      mx="auto"
      p={6}
      bg={cardBg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack spacing={6} align="stretch">
        <Box bg={headerBg} p={4} borderRadius="md">
          <Heading size="md" mb={1}>
            🔄 Draft de Guildes
          </Heading>
          <Text fontSize="sm" >
            Sélectionnez des joueurs et assignez-les à de nouvelles guildes.
            Les changements seront appliqués en une seule opération.
          </Text>
        </Box>

        {/* Formulaire d'ajout */}
        <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
          <Text fontWeight="bold" mb={3}>
            Ajouter un mouvement
          </Text>
          <VStack spacing={3} align="stretch">
            {/* Guilde source */}
            <HStack spacing={3} flexWrap={{ base: "wrap", md: "nowrap" }}>
              <Box flex={1} minW={{ base: "100%", md: "auto" }}>
                <Text fontSize="sm" mb={1} color="gray.500">
                  Guilde source
                </Text>
                <Select
                  placeholder="Choisir une guilde source"
                  value={selectedSourceGuild}
                  onChange={(e) => setSelectedSourceGuild(e.target.value)}
                  size="sm"
                >
                  {guilds.map((guild) => (
                    <option key={guild._id} value={guild._id}>
                      {guild.name} ({membersByGuild[guild._id]?.length || 0}{" "}
                      membres)
                    </option>
                  ))}
                </Select>
              </Box>

              {/* Joueur */}
              <Box flex={1} minW={{ base: "100%", md: "auto" }}>
                <Text fontSize="sm" mb={1} color="gray.500">
                  Joueur
                </Text>
                <Select
                  placeholder="Choisir un joueur"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  size="sm"
                  isDisabled={!selectedSourceGuild}
                >
                  {availableUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.bbs_name || user.global_name || user.username}
                    </option>
                  ))}
                </Select>
              </Box>

              {/* Guilde cible */}
              <Box flex={1} minW={{ base: "100%", md: "auto" }}>
                <Text fontSize="sm" mb={1} color="gray.500">
                  Guilde cible
                </Text>
                <Select
                  placeholder="Choisir une guilde cible"
                  value={selectedTargetGuild}
                  onChange={(e) => setSelectedTargetGuild(e.target.value)}
                  size="sm"
                  isDisabled={!selectedUser}
                >
                  <option value="__none__">🚫 Aucune guilde (retirer)</option>
                  {guilds
                    .filter((g) => g._id !== selectedSourceGuild)
                    .map((guild) => (
                      <option
                        key={guild._id}
                        value={guild._id}
                      >
                        {guild.name} ({projectedCounts[guild._id] || 0}/20)
                        {(projectedCounts[guild._id] || 0) >= 20
                          ? " ⚠️ Pleine"
                          : ""}
                      </option>
                    ))}
                </Select>
              </Box>
            </HStack>

            <Button
              colorScheme="orange"
              size="sm"
              onClick={addMove}
              isDisabled={!selectedUser || !selectedTargetGuild}
              w={{ base: "100%", md: "auto" }}
              alignSelf={{ md: "flex-end" }}
            >
              + Ajouter au draft
            </Button>
          </VStack>
        </Box>

        {/* Liste des mouvements */}
        {draftMoves.length > 0 && (
          <Box>
            <HStack justify="space-between" mb={3}>
              <Text fontWeight="bold">
                Mouvements prévus ({draftMoves.length})
              </Text>
              <Button size="xs" variant="ghost" colorScheme="red" onClick={clearDraft}>
                Tout effacer
              </Button>
            </HStack>

            <VStack spacing={2} align="stretch">
              {draftMoves.map((move: DraftMove) => (
                <HStack
                  key={move.id}
                  p={3}
                  bg={moveBg}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                  justify="space-between"
                  flexWrap={{ base: "wrap", md: "nowrap" }}
                  spacing={3}
                >
                  <HStack spacing={3} flex={1} minW={0}>
                    <UserDisplay user={move.user} avatarSize="xs" asLink={false} />
                  </HStack>

                  <HStack spacing={2} flexShrink={0}>
                    <Badge colorScheme="red" fontSize="xs">
                      {move.fromGuild?.name || "Sans guilde"}
                    </Badge>
                    <ArrowForwardIcon color="orange.500" />
                    <Badge colorScheme={move.toGuild ? "green" : "gray"} fontSize="xs">
                      {move.toGuild?.name || "Aucune guilde"}
                    </Badge>
                  </HStack>

                  <IconButton
                    aria-label="Retirer"
                    icon={<DeleteIcon />}
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => removeMove(move.id)}
                  />
                </HStack>
              ))}
            </VStack>

            {/* Résumé par guilde */}
            <Box mt={4} p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
              <Text fontSize="sm" fontWeight="bold" mb={2}>
                Effectifs après draft
              </Text>
              <Flex gap={3} flexWrap="wrap">
                {guilds.map((guild) => {
                  const current = membersByGuild[guild._id]?.length || 0;
                  const projected = projectedCounts[guild._id] || 0;
                  const diff = projected - current;
                  return (
                    <Badge
                      key={guild._id}
                      p={2}
                      borderRadius="md"
                      colorScheme={
                        projected > 20 ? "red" : diff !== 0 ? "orange" : "gray"
                      }
                      fontSize="xs"
                    >
                      {guild.name}: {current} → {projected}/20
                      {diff !== 0 && (
                        <Text as="span" ml={1}>
                          ({diff > 0 ? `+${diff}` : diff})
                        </Text>
                      )}
                    </Badge>
                  );
                })}
              </Flex>
              {guilds.some((g) => (projectedCounts[g._id] || 0) > 20) && (
                <Alert status="error" mt={3} borderRadius="md" py={2}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    Une ou plusieurs guildes dépassent la limite de 20 membres.
                    Déplacez ou retirez des joueurs avant de valider.
                  </Text>
                </Alert>
              )}
            </Box>

            <Divider my={4} />

            {/* Actions */}
            <HStack justify="flex-end" spacing={3}>
              <Button variant="outline" onClick={clearDraft} size="sm">
                Annuler
              </Button>
              <Button
                colorScheme="green"
                onClick={onOpen}
                size="sm"
                isDisabled={guilds.some(
                  (g) => (projectedCounts[g._id] || 0) > 20
                )}
                title={
                  guilds.some((g) => (projectedCounts[g._id] || 0) > 20)
                    ? "Une ou plusieurs guildes dépassent 20 membres"
                    : undefined
                }
              >
                ✅ Valider le draft ({draftMoves.length} mouvement
                {draftMoves.length > 1 ? "s" : ""})
              </Button>
            </HStack>
          </Box>
        )}

        {draftMoves.length === 0 && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            Aucun mouvement prévu. Utilisez le formulaire ci-dessus pour ajouter
            des joueurs au draft.
          </Alert>
        )}
      </VStack>

      {/* Modal de confirmation */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmer le draft</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" mb={4} borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                Les joueurs seront d'abord retirés de leur guilde actuelle, puis
                réassignés. Cette opération est irréversible.
              </Text>
            </Alert>

            <Text fontWeight="bold" mb={3}>
              Récapitulatif des {draftMoves.length} mouvement
              {draftMoves.length > 1 ? "s" : ""} :
            </Text>

            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Joueur</Th>
                  <Th>Depuis</Th>
                  <Th></Th>
                  <Th>Vers</Th>
                </Tr>
              </Thead>
              <Tbody>
                {draftMoves.map((move) => (
                  <Tr key={move.id}>
                    <Td>
                      <Text fontSize="sm" fontWeight="medium">
                        {move.user.bbs_name ||
                          move.user.global_name ||
                          move.user.username}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="red" fontSize="xs">
                        {move.fromGuild?.name || "Sans guilde"}
                      </Badge>
                    </Td>
                    <Td>
                      <ArrowForwardIcon color="orange.500" />
                    </Td>
                    <Td>
                      <Badge colorScheme={move.toGuild ? "green" : "gray"} fontSize="xs">
                        {move.toGuild?.name || "Aucune guilde"}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {/* Résumé effectifs */}
            <Box mt={4} p={3} bg={moveBg} borderRadius="md">
              <Text fontSize="sm" fontWeight="bold" mb={2}>
                Impact sur les effectifs :
              </Text>
              {guilds
                .filter((guild) => {
                  const current = membersByGuild[guild._id]?.length || 0;
                  const projected = projectedCounts[guild._id] || 0;
                  return current !== projected;
                })
                .map((guild) => {
                  const current = membersByGuild[guild._id]?.length || 0;
                  const projected = projectedCounts[guild._id] || 0;
                  const diff = projected - current;
                  return (
                    <Text key={guild._id} fontSize="sm">
                      {guild.name}: {current} → {projected} membres (
                      {diff > 0 ? `+${diff}` : diff})
                    </Text>
                  );
                })}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button
              colorScheme="green"
              onClick={handleExecuteDraft}
              isLoading={isExecuting}
              loadingText="Exécution..."
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
