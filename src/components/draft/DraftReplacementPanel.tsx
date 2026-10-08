import {
  Alert, AlertIcon, Avatar, Badge, Box, Button, Checkbox, Flex, HStack, NumberInput, NumberInputField, Skeleton, Text,
  Tooltip, VStack, useColorModeValue, useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/hooks/api/shared";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { getUserAvatarUrl } from "@/utils/discord";

type RankingType = "average" | "total";

interface ReplacementPlayer {
  bbs_id: string;
  bbs_name?: string;
  global_name?: string;
  discord_id?: string;
  avatar?: string;
  averageScore: number;
  totalScore: number;
  totalScores: number;
  currentGuildName?: string | null;
  delta?: number;
  deltaPercent?: number | null;
}

interface ReplacementResponse {
  roster: ReplacementPlayer[];
  replacements: {
    player: ReplacementPlayer;
    suggestions: ReplacementPlayer[];
    eligible_count: number;
    recommended_bbs_id: string | null;
  }[];
  meta: { higherGuilds: string[]; lowerGuilds: string[]; tolerance: number };
}

interface DraftReplacementPanelProps {
  cycleName: string;
  cycleYear: number;
  rankingType: RankingType;
  // Ordre des guildes = hiérarchie (la 1re est la meilleure)
  guildOrder: string[];
  authHeaders: HeadersInit;
  guildColorMap: Record<string, string>;
}

const formatScore = (n: number) => n.toLocaleString("fr-FR");

// Remplacement ciblé : on choisit des joueurs d'une guilde, et on obtient des remplaçants de score
// équivalent ou supérieur, pris seulement dans les guildes inférieures ou parmi les joueurs sans
// guilde. Simulation en lecture seule, comme la proposition automatique.
export const DraftReplacementPanel = ({ cycleName, cycleYear, rankingType, guildOrder, authHeaders, guildColorMap }: DraftReplacementPanelProps) => {
  const toast = useToast();
  const [targetGuild, setTargetGuild] = useState(guildOrder[1] ?? guildOrder[0] ?? "");
  const [tolerance, setTolerance] = useState(5);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [roster, setRoster] = useState<ReplacementPlayer[] | null>(null);
  const [result, setResult] = useState<ReplacementResponse | null>(null);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const cardBg = "bg.card";
  const border = "border.subtle";
  const mutedText = "text.muted";
  const recommendedBg = useColorModeValue("green.50", "rgba(72,187,120,0.12)");

  const scoreOf = (p: ReplacementPlayer) => (rankingType === "average" ? p.averageScore : p.totalScore);
  const nameOf = (p: ReplacementPlayer) => p.bbs_name || p.global_name || p.bbs_id;

  const fetchReplacement = useCallback(async (replaceIds: string[]) => {
    const params = new URLSearchParams({
      cycle_name: cycleName,
      year: String(cycleYear),
      ranking_type: rankingType,
      guild_names: guildOrder.join(","),
      target_guild: targetGuild,
      tolerance: String(tolerance),
    });
    if (replaceIds.length > 0) params.set("replace_bbs_ids", replaceIds.join(","));
    const response = await fetch(`${apiUrl}/api/podium/draft-replacement?${params}`, { headers: authHeaders });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Erreur lors de la recherche de remplaçants");
    return data as ReplacementResponse;
  }, [cycleName, cycleYear, rankingType, guildOrder, targetGuild, tolerance, authHeaders]);

  // Membres de la guilde visée (à cocher), rechargés quand le contexte change
  useEffect(() => {
    if (!targetGuild || !guildOrder.includes(targetGuild)) return;
    let cancelled = false;
    setIsLoadingRoster(true);
    setResult(null);
    setSelected(new Set());
    fetchReplacement([])
      .then((data) => { if (!cancelled) setRoster(data.roster); })
      .catch((err) => { if (!cancelled) toast({ title: err instanceof Error ? err.message : "Erreur inconnue", status: "error" }); })
      .finally(() => { if (!cancelled) setIsLoadingRoster(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleName, cycleYear, rankingType, targetGuild, guildOrder.join(",")]);

  const toggle = (bbsId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(bbsId)) next.delete(bbsId);
      else next.add(bbsId);
      return next;
    });
  };

  const search = async () => {
    setIsSearching(true);
    try {
      setResult(await fetchReplacement([...selected]));
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Erreur inconnue", status: "error" });
    } finally {
      setIsSearching(false);
    }
  };

  const targetIndex = guildOrder.indexOf(targetGuild);
  const higher = guildOrder.slice(0, Math.max(0, targetIndex));
  const lower = guildOrder.slice(targetIndex + 1);

  const playerLine = (p: ReplacementPlayer) => (
    <HStack spacing={2} minW={0}>
      <Avatar size="2xs" src={getUserAvatarUrl({ discord_id: p.discord_id, avatar: p.avatar }) || undefined} name={nameOf(p)} />
      <Text fontSize="sm" isTruncated>{nameOf(p)}</Text>
    </HStack>
  );

  return (
    <VStack align="stretch" spacing={4}>
      <HStack spacing={3} flexWrap="wrap" align="flex-end">
        <Box>
          <Text fontSize="xs" color={mutedText} mb={1}>Guilde à renforcer</Text>
          <CustomSelect
            value={targetGuild}
            onChange={setTargetGuild}
            options={guildOrder.map((g) => ({ value: g, label: `Guilde ${g}` }))}
            allowDeselect={false}
            size="sm"
            w="150px"
          />
        </Box>
        <Box>
          <Text fontSize="xs" color={mutedText} mb={1}>Tolérance (score jusqu'à X % plus bas)</Text>
          <HStack>
            <NumberInput size="sm" w="90px" min={0} max={50} value={tolerance} onChange={(_, v) => setTolerance(isNaN(v) ? 0 : v)}>
              <NumberInputField id="draft-replacement-tolerance" />
            </NumberInput>
            <Text fontSize="sm">%</Text>
          </HStack>
        </Box>
        <Button colorScheme="purple" size="sm" onClick={search} isLoading={isSearching} isDisabled={selected.size === 0}>
          Proposer des remplaçants{selected.size > 0 ? ` (${selected.size})` : ""}
        </Button>
      </HStack>

      <Text fontSize="xs" color={mutedText}>
        Remplaçants cherchés dans {lower.length ? `les guildes ${lower.join(", ")}` : "aucune guilde inférieure"} et parmi les joueurs
        sans guilde. {higher.length ? `Jamais dans ${higher.join(", ")} (guilde${higher.length > 1 ? "s" : ""} supérieure${higher.length > 1 ? "s" : ""}) ` : ""}
        ni dans la guilde {targetGuild}.
      </Text>

      {isLoadingRoster ? (
        <Skeleton h="160px" borderRadius="md" />
      ) : roster && roster.length === 0 ? (
        <Alert status="info" borderRadius="md" fontSize="sm"><AlertIcon />Aucun membre de la guilde {targetGuild} n'a de score sur ce cycle.</Alert>
      ) : roster ? (
        <Box borderWidth="1px" borderColor={border} borderRadius="md" p={3}>
          <Text fontSize="sm" fontWeight="semibold" mb={2}>Joueurs de la guilde {targetGuild} à remplacer</Text>
          <Box sx={{ columnCount: { base: 1, md: 2, xl: 3 }, columnGap: "16px" }}>
            {roster.map((p) => (
              <Flex key={p.bbs_id} align="center" gap={2} py={1} sx={{ breakInside: "avoid" }}>
                <Checkbox isChecked={selected.has(p.bbs_id)} onChange={() => toggle(p.bbs_id)} aria-label={`Remplacer ${nameOf(p)}`} />
                {playerLine(p)}
                <Text fontSize="xs" fontFamily="mono" color={mutedText} ml="auto" whiteSpace="nowrap">{formatScore(scoreOf(p))}</Text>
              </Flex>
            ))}
          </Box>
        </Box>
      ) : null}

      {result && result.replacements.length > 0 && (
        <VStack align="stretch" spacing={3}>
          {result.replacements.map(({ player, suggestions, eligible_count, recommended_bbs_id }) => {
            const recommended = suggestions.find((s) => s.bbs_id === recommended_bbs_id);
            return (
              <Box key={player.bbs_id} bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="xl" p={3}>
                <Flex justify="space-between" align="center" gap={2} wrap="wrap" mb={2}>
                  <HStack spacing={2}>
                    {playerLine(player)}
                    <Text fontSize="xs" fontFamily="mono" color={mutedText}>{formatScore(scoreOf(player))}</Text>
                  </HStack>
                  {recommended ? (
                    <Badge colorScheme="green" px={2} py={0.5} borderRadius="md" textTransform="none">
                      Échange conseillé : {nameOf(player)} ↔ {nameOf(recommended)}
                      {recommended.currentGuildName ? ` (${recommended.currentGuildName})` : " (sans guilde)"}
                    </Badge>
                  ) : (
                    <Badge colorScheme="gray" textTransform="none">Aucun remplaçant disponible</Badge>
                  )}
                </Flex>
                {suggestions.length === 0 ? (
                  <Text fontSize="sm" color={mutedText}>
                    Personne d'équivalent dans les guildes inférieures ni parmi les joueurs sans guilde. Augmente la tolérance pour élargir.
                  </Text>
                ) : (
                  <VStack align="stretch" spacing={0}>
                    {suggestions.map((s) => (
                      <Flex key={s.bbs_id} align="center" gap={2} px={2} py={1} borderRadius="md" bg={s.bbs_id === recommended_bbs_id ? recommendedBg : undefined}>
                        {playerLine(s)}
                        {s.currentGuildName ? (
                          <Badge colorScheme={guildColorMap[s.currentGuildName] || "gray"} fontSize="0.6rem" fontFamily="mono">◦ {s.currentGuildName}</Badge>
                        ) : (
                          <Badge variant="outline" fontSize="0.6rem">Sans guilde</Badge>
                        )}
                        {s.bbs_id === recommended_bbs_id && (
                          <Tooltip label="Meilleur remplaçant encore libre (chaque remplaçant n'est conseillé qu'une fois)" hasArrow>
                            <Text fontSize="xs" color="green.500" fontWeight="semibold">✓ conseillé</Text>
                          </Tooltip>
                        )}
                        <Text fontSize="xs" fontFamily="mono" ml="auto" whiteSpace="nowrap">{formatScore(scoreOf(s))}</Text>
                        <Text fontSize="xs" fontFamily="mono" w="70px" textAlign="right" color={(s.delta ?? 0) >= 0 ? "green.500" : "orange.400"}>
                          {(s.delta ?? 0) >= 0 ? "+" : ""}{s.deltaPercent?.toLocaleString("fr-FR") ?? "—"} %
                        </Text>
                      </Flex>
                    ))}
                    {eligible_count > suggestions.length && (
                      <Text fontSize="xs" color={mutedText} px={2} pt={1}>+ {eligible_count - suggestions.length} autre(s) candidat(s)</Text>
                    )}
                  </VStack>
                )}
              </Box>
            );
          })}
        </VStack>
      )}
    </VStack>
  );
};
