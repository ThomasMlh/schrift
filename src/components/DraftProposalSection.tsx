import {
  Box, VStack, HStack, Text, Button, ButtonGroup, Grid, GridItem, Flex, Image, Input,
  Avatar, Badge, Divider, Alert, AlertIcon, useColorModeValue, useToast,
  NumberInput, NumberInputField, IconButton, Tooltip,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { RepeatIcon, TimeIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { useCycles, useGuilds, usePodiumSettings } from "@/hooks/useAPI";
import { useAuth } from "@/providers/AuthProvider";
import { useSettingsMutations } from "@/hooks/useAPIMutations";
import { apiUrl } from "@/hooks/api/shared";
import { bucketUrl } from "@/utils/apiRequest";
import { CycleSelect } from "@/components/ui/CycleSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { getUserAvatarUrl } from "@/utils/discord";
import { getGuildColor } from "@/components/DraftSection";

type RankingType = "average" | "total";

interface DraftProposalPlayer {
  bbs_id: string;
  bbs_name?: string;
  global_name?: string;
  discord_id?: string;
  avatar?: string;
  averageScore: number;
  totalScore: number;
  totalScores: number;
  overallRank: number | null; // null pour les membres d'une guilde figée
  currentGuildName: string | null;
  isPinned?: boolean;
}

interface DraftProposalGuild {
  guild_name: string;
  players: DraftProposalPlayer[];
  // Guilde figée : membres actuels inchangés, hors répartition
  locked?: boolean;
  member_count?: number;
}

interface DraftProposalResponse {
  guilds: DraftProposalGuild[];
  leftover: DraftProposalPlayer[];
  meta: {
    totalCandidates: number;
    minScoresRequired?: number;
  };
}

interface HistoryEntry {
  _id: string;
  created_at: string;
  created_by?: string;
  cycle_name: string;
  ranking_type: RankingType;
  guild_order: string[];
  locked_guild_names?: string[];
  total_candidates: number;
}

interface HistoryEntryFull extends HistoryEntry {
  guilds: DraftProposalGuild[];
  leftover: DraftProposalPlayer[];
}

const DEFAULT_GUILD_ORDER = ["A", "C", "B", "E", "D"];

// Outil admin en lecture seule : simule une répartition des 5 guildes sur un cycle donné, en
// classant tous leurs membres actuels par score et en les répartissant par paquets de 20 dans
// l'ordre de guildes choisi. Ne modifie rien — juste une proposition à appliquer à la main via
// l'onglet Draft si elle est validée.
const DraftProposalSection = () => {
  const { token, isAdmin } = useAuth();
  const toast = useToast();
  const { cycles } = useCycles({ authenticated: true });
  const { guilds } = useGuilds(true);
  const { minScoresForRanking: savedMinScores, mutate: mutatePodiumSettings } = usePodiumSettings();
  const { updatePodiumMinScores } = useSettingsMutations();

  const [minScoresInput, setMinScoresInput] = useState(0);
  const [isSavingThreshold, setIsSavingThreshold] = useState(false);

  useEffect(() => {
    setMinScoresInput(savedMinScores);
  }, [savedMinScores]);

  const handleSaveThreshold = async () => {
    setIsSavingThreshold(true);
    try {
      await updatePodiumMinScores(minScoresInput);
      await mutatePodiumSettings();
      toast({ title: "Seuil du podium mis à jour", status: "success" });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Erreur lors de la mise à jour", status: "error" });
    } finally {
      setIsSavingThreshold(false);
    }
  };

  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [rankingType, setRankingType] = useState<RankingType>("average");
  const [guildOrder, setGuildOrder] = useState<string[]>(DEFAULT_GUILD_ORDER);
  // Guildes figées : elles gardent leurs membres actuels et sont sautées dans la répartition
  const [lockedGuilds, setLockedGuilds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<DraftProposalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistoryId, setLoadingHistoryId] = useState<string | null>(null);
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);

  // "Et si" : bbs_id -> nom affiché, pour retrouver qui exclure/épingler même une fois que sa
  // ligne a disparu du tableau après une régénération.
  const [excluded, setExcluded] = useState<Map<string, string>>(new Map());
  const [pinned, setPinned] = useState<Map<string, string>>(new Map());

  const toggleExcluded = (p: DraftProposalPlayer) => {
    setExcluded((prev) => {
      const next = new Map(prev);
      if (next.has(p.bbs_id)) next.delete(p.bbs_id);
      else next.set(p.bbs_id, p.bbs_name || p.global_name || p.bbs_id);
      return next;
    });
    setPinned((prev) => { if (!prev.has(p.bbs_id)) return prev; const next = new Map(prev); next.delete(p.bbs_id); return next; });
  };

  const togglePinned = (p: DraftProposalPlayer) => {
    setPinned((prev) => {
      const next = new Map(prev);
      if (next.has(p.bbs_id)) next.delete(p.bbs_id);
      else next.set(p.bbs_id, p.bbs_name || p.global_name || p.bbs_id);
      return next;
    });
    setExcluded((prev) => { if (!prev.has(p.bbs_id)) return prev; const next = new Map(prev); next.delete(p.bbs_id); return next; });
  };

  const authHeaders = useMemo(() => ({ Authorization: token ? `Bearer ${token}` : "" }), [token]);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/podium/draft-proposal/history`, { headers: authHeaders });
      const data = await response.json();
      if (response.ok && data.success) setHistory(data.entries);
    } catch {
      // silencieux : l'historique est un bonus, pas une fonctionnalité critique
    }
  }, [authHeaders]);

  useEffect(() => {
    if (isAdmin) fetchHistory();
  }, [isAdmin, fetchHistory]);

  const handleLoadHistoryEntry = async (id: string) => {
    setLoadingHistoryId(id);
    try {
      const response = await fetch(`${apiUrl}/api/podium/draft-proposal/history/${id}`, { headers: authHeaders });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Erreur lors du chargement");
      const entry = data.entry as HistoryEntryFull;
      setRankingType(entry.ranking_type);
      setGuildOrder(entry.guild_order);
      setLockedGuilds(new Set(entry.locked_guild_names ?? []));
      setResult({
        guilds: entry.guilds,
        leftover: entry.leftover,
        meta: { totalCandidates: entry.total_candidates },
      });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Erreur inconnue", status: "error" });
    } finally {
      setLoadingHistoryId(null);
    }
  };

  const handleDeleteHistoryEntry = async (id: string) => {
    setDeletingHistoryId(id);
    try {
      await fetch(`${apiUrl}/api/podium/draft-proposal/history/${id}`, { method: "DELETE", headers: authHeaders });
      setHistory((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Erreur lors de la suppression", status: "error" });
    } finally {
      setDeletingHistoryId(null);
    }
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headerBg = useColorModeValue("gray.50", "gray.900");
  const rowAltBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const hoverBg = useColorModeValue("orange.50", "orange.900");
  const matchBg = useColorModeValue("yellow.100", "yellow.700");

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const isMatch = (p: DraftProposalPlayer) =>
    !!normalizedSearch &&
    ((p.bbs_name && p.bbs_name.toLowerCase().includes(normalizedSearch)) ||
      (p.global_name && p.global_name.toLowerCase().includes(normalizedSearch)));

  const selectedCycle = cycles.find((c) => c._id === selectedCycleId);
  const guildOptions = guilds.map((g) => ({ value: g.name, label: g.name }));

  // Même code couleur par guilde que l'onglet Draft juste en dessous (indexé dans le même
  // ordre, celui de useGuilds), plutôt qu'une palette propre à ce tableau.
  const guildColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    guilds.forEach((g, i) => { map[g.name] = getGuildColor(i); });
    return map;
  }, [guilds]);

  const handleGuildOrderChange = (index: number, value: string) => {
    setGuildOrder((prev) => prev.map((g, i) => (i === index ? value : g)));
  };

  const toggleLockedGuild = (name: string) => {
    setLockedGuilds((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };
  const activeLockedGuilds = guildOrder.filter((g) => lockedGuilds.has(g));

  const handleGenerate = async () => {
    if (!selectedCycle) return;
    setIsLoading(true);
    setResult(null);
    try {
      const params = new URLSearchParams({
        cycle_name: selectedCycle.name,
        year: String(selectedCycle.year),
        ranking_type: rankingType,
        guild_names: guildOrder.join(","),
      });
      if (activeLockedGuilds.length > 0) params.set("locked_guild_names", activeLockedGuilds.join(","));
      if (excluded.size > 0) params.set("excluded_bbs_ids", [...excluded.keys()].join(","));
      if (pinned.size > 0) params.set("pinned_bbs_ids", [...pinned.keys()].join(","));
      const response = await fetch(`${apiUrl}/api/podium/draft-proposal?${params}`, {
        headers: authHeaders,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Erreur lors de la génération de la proposition");
      }
      setResult(data);
      fetchHistory();
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur inconnue",
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box borderWidth="1px" borderColor={borderColor} borderRadius="lg" p={5} bg={cardBg}>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontWeight="bold" fontSize="lg">🧮 Proposition de draft automatique</Text>
          <Text fontSize="sm" color={mutedText}>
            Simulation en lecture seule : classe les membres actuels des guildes sélectionnées par score sur un
            cycle, et propose une répartition par paquets de 20 (les meilleurs dans la 1ère guilde, etc.). Rien
            n'est appliqué — à toi de faire les mouvements dans l'onglet Draft si tu valides la proposition.
          </Text>
        </Box>

        <HStack spacing={3} flexWrap="wrap" align="flex-end">
          <Box>
            <Text fontSize="xs" color={mutedText} mb={1}>Cycle</Text>
            <CycleSelect
              cycles={cycles}
              value={selectedCycleId}
              onChange={setSelectedCycleId}
              placeholder="Choisir un cycle"
              valueKey="_id"
              allowDeselect={false}
              size="md"
              w="220px"
            />
          </Box>

          <Box>
            <Text fontSize="xs" color={mutedText} mb={1}>Classement</Text>
            <ButtonGroup size="sm" isAttached variant="outline">
              <Button
                colorScheme={rankingType === "average" ? "blue" : undefined}
                variant={rankingType === "average" ? "solid" : "outline"}
                onClick={() => setRankingType("average")}
              >
                Moyenne
              </Button>
              <Button
                colorScheme={rankingType === "total" ? "blue" : undefined}
                variant={rankingType === "total" ? "solid" : "outline"}
                onClick={() => setRankingType("total")}
              >
                Total
              </Button>
            </ButtonGroup>
          </Box>

          <Button
            leftIcon={<RepeatIcon />}
            colorScheme="purple"
            onClick={handleGenerate}
            isLoading={isLoading}
            isDisabled={!selectedCycle}
          >
            Générer
          </Button>
        </HStack>

        <Box>
          <Text fontSize="xs" color={mutedText} mb={1}>
            Ordre des guildes (1er paquet de 20 → 1ère guilde, etc.). 🔒 fige une guilde : elle garde ses
            membres actuels et n'entre pas dans la répartition.
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            {guildOrder.map((g, i) => {
              const isLocked = lockedGuilds.has(g);
              return (
                <HStack key={i} spacing={1.5} opacity={isLocked ? 0.6 : 1}>
                  {i > 0 && <Text color={mutedText} fontSize="sm">›</Text>}
                  <Box w="10px" h="10px" borderRadius="sm" bg={`${guildColorMap[g] || "gray"}.500`} flexShrink={0} />
                  <CustomSelect
                    value={g}
                    onChange={(value) => handleGuildOrderChange(i, value)}
                    options={guildOptions}
                    allowDeselect={false}
                    size="sm"
                    w="90px"
                  />
                  <Tooltip label={isLocked ? `Libérer la guilde ${g}` : `Figer la guilde ${g} (membres inchangés)`} hasArrow>
                    <IconButton
                      aria-label={isLocked ? `Libérer la guilde ${g}` : `Figer la guilde ${g}`}
                      aria-pressed={isLocked}
                      icon={<Text fontSize="0.8rem">{isLocked ? "🔒" : "🔓"}</Text>}
                      size="xs"
                      variant={isLocked ? "solid" : "ghost"}
                      colorScheme={isLocked ? "orange" : undefined}
                      onClick={() => toggleLockedGuild(g)}
                    />
                  </Tooltip>
                </HStack>
              );
            })}
          </HStack>
          {activeLockedGuilds.length > 0 && (
            <Text fontSize="xs" color={mutedText} mt={1}>
              Guilde(s) figée(s) : {activeLockedGuilds.join(", ")} · les paquets de 20 sont répartis entre les autres guildes.
            </Text>
          )}
        </Box>

        {isAdmin && (
          <Box>
            <Text fontSize="xs" color={mutedText} mb={1}>
              Seuil podium — scores minimum sur le cycle pour être classé (0 = désactivé)
            </Text>
            <HStack spacing={2}>
              <NumberInput
                value={minScoresInput}
                onChange={(_, valueAsNumber) => setMinScoresInput(isNaN(valueAsNumber) ? 0 : valueAsNumber)}
                min={0}
                size="sm"
                w="100px"
              >
                <NumberInputField />
              </NumberInput>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveThreshold}
                isLoading={isSavingThreshold}
                isDisabled={minScoresInput === savedMinScores}
              >
                Enregistrer
              </Button>
            </HStack>
          </Box>
        )}

        {(excluded.size > 0 || pinned.size > 0) && (
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs" color={mutedText}>
                Simulation "et si" — ces choix s'appliquent à la prochaine génération
              </Text>
              <Button
                size="xs"
                variant="link"
                onClick={() => { setExcluded(new Map()); setPinned(new Map()); }}
              >
                Réinitialiser
              </Button>
            </HStack>
            <HStack spacing={1.5} flexWrap="wrap">
              {[...pinned.entries()].map(([id, name]) => (
                <Badge key={id} colorScheme="blue" borderRadius="full" px={2} py={0.5} fontSize="0.7rem">
                  📌 {name}
                  <Text as="span" ml={1.5} cursor="pointer" onClick={() => setPinned((prev) => { const n = new Map(prev); n.delete(id); return n; })}>✕</Text>
                </Badge>
              ))}
              {[...excluded.entries()].map(([id, name]) => (
                <Badge key={id} colorScheme="red" borderRadius="full" px={2} py={0.5} fontSize="0.7rem">
                  exclu · {name}
                  <Text as="span" ml={1.5} cursor="pointer" onClick={() => setExcluded((prev) => { const n = new Map(prev); n.delete(id); return n; })}>✕</Text>
                </Badge>
              ))}
            </HStack>
          </Box>
        )}

        {isAdmin && history.length > 0 && (
          <Box>
            <HStack mb={1}>
              <TimeIcon boxSize={3} color={mutedText} />
              <Text fontSize="xs" color={mutedText}>Propositions générées récemment</Text>
            </HStack>
            <VStack align="stretch" spacing={1} maxH="180px" overflowY="auto">
              {history.map((entry) => (
                <HStack
                  key={entry._id}
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="md"
                  bg={rowAltBg}
                  spacing={2}
                >
                  <Text color={mutedText} whiteSpace="nowrap">
                    {new Date(entry.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </Text>
                  <Text isTruncated flex={1}>
                    {entry.cycle_name} · {entry.ranking_type === "average" ? "Moyenne" : "Total"} · {entry.guild_order.join(">")}
                    {entry.created_by ? ` · ${entry.created_by}` : ""}
                  </Text>
                  <Text color={mutedText} whiteSpace="nowrap">{entry.total_candidates} joueurs</Text>
                  <IconButton
                    aria-label="Voir cette proposition"
                    icon={<ViewIcon />}
                    size="xs"
                    variant="ghost"
                    isLoading={loadingHistoryId === entry._id}
                    onClick={() => handleLoadHistoryEntry(entry._id)}
                  />
                  <IconButton
                    aria-label="Supprimer cette entrée"
                    icon={<DeleteIcon />}
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    isLoading={deletingHistoryId === entry._id}
                    onClick={() => handleDeleteHistoryEntry(entry._id)}
                  />
                </HStack>
              ))}
            </VStack>
          </Box>
        )}

        {result && (
          <>
            <Divider />
            {result.meta.minScoresRequired !== undefined && (
              <Alert status="info" fontSize="sm" borderRadius="md">
                <AlertIcon />
                Seuls les joueurs avec au moins {result.meta.minScoresRequired} scores sur le cycle sont classés
                ({result.meta.totalCandidates} joueur(s) éligible(s) au total).
              </Alert>
            )}

            <HStack spacing={3}>
              <Input
                placeholder="Rechercher un joueur…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="sm"
                maxW="260px"
              />
              {normalizedSearch && (
                <Text fontSize="xs" color={mutedText}>
                  {result.guilds.reduce((sum, g) => sum + g.players.filter(isMatch).length, 0)} résultat(s)
                </Text>
              )}
            </HStack>

            <Box borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflowX="auto">
              <Grid
                templateColumns={{
                  base: `repeat(${result.guilds.length}, minmax(350px, 1fr))`,
                  md: `repeat(${result.guilds.length}, minmax(450px, 1fr))`,
                }}
                minW={{ base: `${result.guilds.length * 350}px`, md: `${result.guilds.length * 450}px` }}
              >
                {result.guilds.map((g, colIndex) => {
                  const color = guildColorMap[g.guild_name] || "gray";
                  return (
                    <GridItem
                      key={g.guild_name}
                      borderRightWidth={colIndex < result.guilds.length - 1 ? "1px" : 0}
                      borderColor={borderColor}
                    >
                      <HStack spacing={2} px={3} py={2.5} borderBottomWidth="2px" borderColor={borderColor} bg={headerBg}>
                        {!imageErrors[g.guild_name] ? (
                          <Image
                            src={`${bucketUrl}/guilds/${g.guild_name}.png`}
                            alt={g.guild_name}
                            w="40px"
                            h="40px"
                            objectFit="contain"
                            flexShrink={0}
                            onError={() => setImageErrors((prev) => ({ ...prev, [g.guild_name]: true }))}
                          />
                        ) : (
                          <Flex w="34px" h="34px" borderRadius="md" bg={`${color}.500`} align="center" justify="center" flexShrink={0}>
                            <Text color="white" fontWeight="800" fontSize="lg">{g.guild_name}</Text>
                          </Flex>
                        )}
                        <Box minW={0}>
                          <HStack spacing={1.5}>
                            <Text fontWeight="bold" fontSize="sm" isTruncated>Guilde {g.guild_name}</Text>
                            {g.locked && <Badge colorScheme="orange" fontSize="0.6rem">🔒 Inchangée</Badge>}
                          </HStack>
                          <Text fontSize="xs" fontFamily="mono" color={mutedText}>
                            {g.locked
                              ? `${g.member_count ?? g.players.length} membre(s) actuel(s)${(g.member_count ?? 0) > g.players.length ? ` · ${(g.member_count ?? 0) - g.players.length} sans score ce cycle` : ""}`
                              : `${g.players.length}/20 joueurs`}
                          </Text>
                        </Box>
                      </HStack>

                      <VStack align="stretch" spacing={0}>
                        {g.players.map((p, i) => (
                          <HStack
                            key={p.bbs_id}
                            spacing={2}
                            px={3}
                            py={1.5}
                            bg={isMatch(p) ? matchBg : (i % 2 === 1 ? rowAltBg : undefined)}
                            opacity={normalizedSearch && !isMatch(p) ? 0.4 : 1}
                            _hover={{ bg: hoverBg }}
                            fontSize="sm"
                          >
                            <Text w="20px" fontFamily="mono" fontSize="xs" color={mutedText} textAlign="right">{p.overallRank ?? "—"}</Text>
                            <Avatar
                              size="2xs"
                              src={getUserAvatarUrl({ discord_id: p.discord_id, avatar: p.avatar }) || undefined}
                              name={p.bbs_name}
                            />
                            <HStack flex={1} minW={0} spacing={1.5}>
                              <Text isTruncated>{p.bbs_name || p.global_name}</Text>
                              {p.isPinned && (
                                <Text fontSize="0.7rem" flexShrink={0} title="Épinglé dans sa guilde actuelle">📌</Text>
                              )}
                              {p.currentGuildName && p.currentGuildName !== g.guild_name && (
                                <Badge
                                  colorScheme={guildColorMap[p.currentGuildName] || "orange"}
                                  fontSize="0.6rem" px={1.5} borderRadius="sm" fontFamily="mono" flexShrink={0}
                                >
                                  ◦ {p.currentGuildName}
                                </Badge>
                              )}
                            </HStack>
                            <Text fontFamily="mono" fontSize="xs" color={mutedText} whiteSpace="nowrap">
                              {(rankingType === "average" ? p.averageScore : p.totalScore).toLocaleString("fr-FR")}
                            </Text>
                            {!g.locked && (
                            <HStack spacing={0.5} flexShrink={0}>
                              <IconButton
                                aria-label="Épingler dans la guilde actuelle"
                                icon={<Text fontSize="0.7rem">📌</Text>}
                                size="xs"
                                variant={pinned.has(p.bbs_id) ? "solid" : "ghost"}
                                colorScheme={pinned.has(p.bbs_id) ? "blue" : undefined}
                                onClick={() => togglePinned(p)}
                              />
                              <IconButton
                                aria-label="Exclure de la simulation"
                                icon={<Text fontSize="0.7rem">✕</Text>}
                                size="xs"
                                variant={excluded.has(p.bbs_id) ? "solid" : "ghost"}
                                colorScheme={excluded.has(p.bbs_id) ? "red" : undefined}
                                onClick={() => toggleExcluded(p)}
                              />
                            </HStack>
                            )}
                          </HStack>
                        ))}
                        {g.players.length === 0 && (
                          <Text fontSize="sm" color={mutedText} px={3} py={2}>Aucun joueur éligible.</Text>
                        )}
                      </VStack>
                    </GridItem>
                  );
                })}
              </Grid>
            </Box>

            {result.leftover.length > 0 && (
              <Box borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
                <Text fontWeight="bold" mb={2}>
                  Hors répartition ({result.leftover.length})
                </Text>
                <Text fontSize="sm" color={mutedText}>
                  Plus de candidats que de places (5 guildes × 20) : ces joueurs ne rentrent dans aucun paquet.
                </Text>
              </Box>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
};

export default DraftProposalSection;
