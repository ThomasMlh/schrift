import {
  Alert, AlertIcon, Badge, Box, Button, Flex, HStack, NumberInput, NumberInputField, Skeleton, Text, Tooltip, VStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useCycles, useMissingScores } from "@/hooks/useAPI";
import { useScoreMutations } from "@/hooks/useAPIMutations";
import type { IMissingScoreMember, IMissingScoreRotation } from "@/interfaces";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { AlterationImage } from "@/components/ui/AlterationImage";

interface MissingScoresPanelProps {
  // Guilde ciblée ; vide si l'admin n'en a pas encore choisi une
  guildId: string;
}

// Scores manquants : pour chaque rotation terminée du cycle, les membres actuels de la guilde sans
// score, avec saisie directe (même route que la saisie classique, donc même calcul différentiel).
export const MissingScoresPanel = ({ guildId }: MissingScoresPanelProps) => {
  const toast = useToast();
  const { cycles } = useCycles({ authenticated: true });
  const { createScore } = useScoreMutations();
  const [cycleId, setCycleId] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const { data, isLoading, error } = useMissingScores(guildId, cycleId || undefined, !!guildId);

  const cardBg = "bg.card";
  const border = "border.subtle";
  const mutedText = "text.muted";

  if (!guildId) {
    return <Alert status="info" borderRadius="md"><AlertIcon />Choisis une guilde en haut de la page pour voir ses scores manquants.</Alert>;
  }

  const cycleOptions = [
    { value: "", label: "Cycle en cours" },
    ...cycles.filter((c) => c._id).map((c) => ({ value: c._id as string, label: `${c.name} ${c.year}` })),
  ];

  const save = async (rotation: IMissingScoreRotation, member: IMissingScoreMember, rawScore: number) => {
    if (!data?.cycle) return;
    const key = `${rotation.rotation_id}|${member.bbs_id}`;
    setSavingKey(key);
    try {
      await createScore({
        user_id: member.user_id,
        bbs_id: member.bbs_id,
        cycle_id: data.cycle._id,
        rotation_id: rotation.rotation_id,
        guild_id: guildId,
        raw_score: rawScore,
      });
      toast({ title: `Score enregistré pour ${member.bbs_name ?? member.bbs_id}`, status: "success", duration: 2000 });
      setValues((prev) => { const next = { ...prev }; delete next[key]; return next; });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Erreur lors de l'enregistrement", status: "error" });
    } finally {
      setSavingKey(null);
    }
  };

  const totalMissing = data?.rotations.reduce((sum, r) => sum + r.missing.length, 0) ?? 0;

  return (
    <VStack align="stretch" spacing={4}>
      <Flex justify="space-between" align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }} gap={3}>
        <Text fontSize="sm" color={mutedText} maxW="2xl">
          Membres actuels de la guilde sans score sur les rotations terminées. Pour la 2e rotation d'une semaine,
          saisis le <b>cumul de la semaine</b> affiché en jeu, comme dans la saisie groupée.
        </Text>
        <Box minW={{ md: "220px" }}>
          <CustomSelect value={cycleId} onChange={setCycleId} options={cycleOptions} allowDeselect={false} size="sm" />
        </Box>
      </Flex>

      {isLoading ? (
        <VStack spacing={3} align="stretch">{[0, 1].map((i) => <Skeleton key={i} h="120px" borderRadius="lg" />)}</VStack>
      ) : error ? (
        <Alert status="error" borderRadius="md"><AlertIcon />Impossible de charger les scores manquants.</Alert>
      ) : !data?.cycle || data.rotations.length === 0 ? (
        <Alert status="info" borderRadius="md"><AlertIcon />Aucune rotation terminée sur ce cycle pour l'instant.</Alert>
      ) : totalMissing === 0 ? (
        <Alert status="success" borderRadius="md"><AlertIcon />Tous les scores de {data.cycle.name} {data.cycle.year} sont saisis 👍</Alert>
      ) : (
        <VStack align="stretch" spacing={3}>
          <Text fontSize="sm" color={mutedText}>
            {totalMissing} score(s) manquant(s) sur {data.cycle.name} {data.cycle.year} · {data.members_count} membre(s)
          </Text>
          {data.rotations.filter((r) => r.missing.length > 0).map((rotation) => (
            <Box key={rotation.rotation_id} bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="lg" p={4}>
              <HStack spacing={2} mb={3} wrap="wrap">
                <Badge colorScheme="purple" variant="subtle">R{rotation.position}</Badge>
                {rotation.attack && <AttackTypeBadge attackType={rotation.attack} size="12px" />}
                <Text fontWeight="semibold">{rotation.killer ?? "—"}</Text>
                {rotation.alteration && <AlterationImage alteration={rotation.alteration} size="18px" />}
                <Text fontSize="sm" color={mutedText}>{rotation.end_date}</Text>
                {rotation.is_differential && (
                  <Tooltip label="2e rotation de la semaine : saisis le cumul de la semaine affiché en jeu" hasArrow>
                    <Badge variant="outline" colorScheme="orange">Cumul semaine</Badge>
                  </Tooltip>
                )}
                <Badge colorScheme="red" ml="auto">{rotation.missing.length} manquant(s)</Badge>
              </HStack>
              <VStack align="stretch" spacing={2}>
                {rotation.missing.map((member) => {
                  const key = `${rotation.rotation_id}|${member.bbs_id}`;
                  const raw = values[key] ?? "";
                  const parsed = parseInt(raw.replace(/\s/g, ""), 10);
                  return (
                    <Flex key={key} align="center" gap={2} wrap="wrap">
                      <Text flex="1 1 140px" minW={0} fontSize="sm" fontWeight="medium" noOfLines={1}>
                        {member.bbs_name ?? member.bbs_id}
                      </Text>
                      <NumberInput
                        size="sm"
                        w={{ base: "100%", sm: "170px" }}
                        min={0}
                        value={raw}
                        onChange={(v) => setValues((prev) => ({ ...prev, [key]: v }))}
                      >
                        <NumberInputField id={`missing-${key}`} placeholder={rotation.is_differential ? "Cumul semaine" : "Score"} />
                      </NumberInput>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        isDisabled={isNaN(parsed) || parsed < 0}
                        isLoading={savingKey === key}
                        onClick={() => save(rotation, member, parsed)}
                      >
                        Enregistrer
                      </Button>
                      <Tooltip label="Le joueur n'a pas joué cette rotation : enregistre un miss (0)" hasArrow>
                        <Button size="sm" variant="outline" isDisabled={savingKey === key} onClick={() => save(rotation, member, 0)}>
                          Miss
                        </Button>
                      </Tooltip>
                    </Flex>
                  );
                })}
              </VStack>
            </Box>
          ))}
        </VStack>
      )}
    </VStack>
  );
};
