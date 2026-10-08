import {
  Alert, AlertIcon, Badge, Box, Container, HStack, SimpleGrid, Skeleton, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tooltip, Tr, VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useCycles, useGuilds, useRotationPreparation } from "@/hooks/useAPI";
import { useAuth } from "@/providers/AuthProvider";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { AlterationImage } from "@/components/ui/AlterationImage";
import { getScoreDisplayValue } from "@/utils/scores";
import { SectionHeader } from "@/components/ui/SectionHeader";

const formatScore = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("fr-FR"));
const SCORE_COLORS: Record<string, string> = {
  rainbow: "purple", blue: "blue", purple: "purple", green: "green", teal: "teal", yellow: "yellow", orange: "orange", red: "red", brown: "gray",
};

// Fiche de préparation d'une rotation (chefs/admins) : pour le killer choisi, le record, la moyenne
// et le dernier score de chaque membre actuel de la guilde, pour savoir qui est à l'aise ou non.
const RotationPreparationSection = () => {
  const { isAdmin, managedGuildIds } = useAuth();
  const { guilds } = useGuilds(true);
  const [guildId, setGuildId] = useState("");
  const [rotationId, setRotationId] = useState("");

  const selectableGuilds = isAdmin
    ? guilds.filter((g) => !g.disabled)
    : guilds.filter((g) => managedGuildIds.includes(g._id));
  const effectiveGuildId = guildId || (selectableGuilds.length === 1 ? selectableGuilds[0]._id : "");
  const { data, isLoading, error } = useRotationPreparation(effectiveGuildId || undefined, rotationId || undefined, undefined, !!effectiveGuildId);
  const { cycles } = useCycles({ authenticated: true });

  const cardBg = "bg.card";
  const border = "border.subtle";
  const mutedText = "text.muted";
  const headerBg = "bg.subtle";

  const cycle = data ? cycles.find((c) => c._id === data.cycle._id) : undefined;
  const rotationOptions = (cycle?.rotations ?? []).map((r) => ({
    value: r.rotation_id,
    label: `R${r.position} · ${r.killer}${r.attack ? ` (${r.attack})` : ""} · ${r.start_date}`,
  }));
  const guildOptions = selectableGuilds.map((g) => ({ value: g._id, label: g.name }));

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={5} align="stretch">
        <SectionHeader
          title="Préparation d'une rotation"
          description="Ce que chaque membre a déjà fait sur le killer de la rotation : record, moyenne et dernier score. Par défaut, la prochaine rotation du cycle en cours."
          actions={<>
            {guildOptions.length > 1 && (
              <Box minW="200px">
                <CustomSelect value={guildId} onChange={setGuildId} options={guildOptions} placeholder="Choisir une guilde" size="md" />
              </Box>
            )}
            {rotationOptions.length > 0 && (
              <Box minW="260px">
                <CustomSelect value={rotationId || data?.rotation.rotation_id || ""} onChange={setRotationId} options={rotationOptions} allowDeselect={false} size="md" />
              </Box>
            )}
          </>}
        />

        {!effectiveGuildId ? (
          <Alert status="info" borderRadius="md"><AlertIcon />Choisis une guilde pour préparer sa rotation.</Alert>
        ) : isLoading ? (
          <Skeleton h="320px" borderRadius="lg" />
        ) : error || !data ? (
          <Alert status="error" borderRadius="md"><AlertIcon />Impossible de charger la fiche de préparation.</Alert>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3}>
              <Box bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="xl" p={4}>
                <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color={mutedText}>
                  {data.cycle.name} {data.cycle.year} · R{data.rotation.position}
                </Text>
                <HStack spacing={2} mt={1}>
                  {data.rotation.attack && <AttackTypeBadge attackType={data.rotation.attack} size="14px" />}
                  <Text fontSize="lg" fontWeight="bold">{data.rotation.killer ?? "—"}</Text>
                  {data.rotation.alteration && <AlterationImage alteration={data.rotation.alteration} size="22px" />}
                </HStack>
                <Text fontSize="xs" color={mutedText}>{data.rotation.start_date} → {data.rotation.end_date}</Text>
              </Box>
              {[
                ["Record tous joueurs", formatScore(data.killer_stats.record)],
                ["Moyenne tous joueurs", formatScore(data.killer_stats.average)],
                ["Scores sur ce killer", data.killer_stats.attempts.toLocaleString("fr-FR")],
              ].map(([label, value]) => (
                <Box key={label} bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="xl" p={4}>
                  <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color={mutedText}>{label}</Text>
                  <Text fontSize="xl" fontWeight="bold" mt={1} sx={{ fontVariantNumeric: "tabular-nums" }}>{value}</Text>
                </Box>
              ))}
            </SimpleGrid>

            {data.members.length === 0 ? (
              <Alert status="info" borderRadius="md"><AlertIcon />Aucun membre dans cette guilde.</Alert>
            ) : (
              <TableContainer bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="xl">
                <Table size="sm">
                  <Thead bg={headerBg}>
                    <Tr>
                      <Th>Membre</Th>
                      <Th isNumeric>Moyenne</Th>
                      <Th isNumeric>Record</Th>
                      <Th>Dernier score</Th>
                      <Th isNumeric>Tentatives</Th>
                      <Th isNumeric>Ce cycle</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.members.map((m) => (
                      <Tr key={m.bbs_id}>
                        <Td fontWeight="medium">{m.bbs_name ?? m.global_name ?? m.bbs_id}</Td>
                        <Td isNumeric>
                          {m.average == null ? (
                            <Tooltip label="Ce membre n'a encore aucun score sur ce killer" hasArrow>
                              <Badge colorScheme="gray">Jamais joué</Badge>
                            </Tooltip>
                          ) : (
                            <Badge colorScheme={SCORE_COLORS[getScoreDisplayValue(m.average)] ?? "gray"} variant="subtle" sx={{ fontVariantNumeric: "tabular-nums" }}>
                              {formatScore(m.average)}
                            </Badge>
                          )}
                        </Td>
                        <Td isNumeric sx={{ fontVariantNumeric: "tabular-nums" }}>{formatScore(m.best)}</Td>
                        <Td>
                          {m.last ? (
                            <Text as="span" sx={{ fontVariantNumeric: "tabular-nums" }}>
                              {formatScore(m.last.score)} <Text as="span" color={mutedText} fontSize="xs">({[m.last.cycle_name, m.last.cycle_year].filter(Boolean).join(" ")})</Text>
                            </Text>
                          ) : "—"}
                        </Td>
                        <Td isNumeric>{m.attempts}</Td>
                        <Td isNumeric sx={{ fontVariantNumeric: "tabular-nums" }}>{formatScore(m.this_cycle)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </VStack>
    </Container>
  );
};

export default RotationPreparationSection;
