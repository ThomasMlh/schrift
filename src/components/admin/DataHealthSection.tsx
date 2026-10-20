import { useState } from "react";
import {
  Badge, Box, Button, Flex, HStack, Icon, Skeleton, Text, VStack, Wrap, WrapItem, useToast,
} from "@chakra-ui/react";
import { FiAlertOctagon, FiAlertTriangle, FiCheckCircle, FiChevronDown, FiChevronUp, FiInfo, FiRefreshCw } from "react-icons/fi";
import type { IconType } from "react-icons";
import { useDataHealth } from "@/hooks/useAPI";
import type { DataHealthSeverity, IDataHealthCheck } from "@/hooks/useAPI";
import { useAdminMutations } from "@/hooks/mutations/useAdminMutations";
import { formatScore } from "@/utils/format";
import type { AdminPage } from "@/interfaces";

const SEVERITIES: Record<DataHealthSeverity, { icon: IconType; color: string; label: string }> = {
  error: { icon: FiAlertOctagon, color: "red", label: "Erreur" },
  warning: { icon: FiAlertTriangle, color: "orange", label: "À corriger" },
  info: { icon: FiInfo, color: "blue", label: "À regarder" },
};

// Title, explanation and where to fix each check
const CHECKS: Record<string, { title: string; help: string; tab?: AdminPage; action?: "indexes" }> = {
  duplicate_scores: {
    title: "Scores en double",
    help: "Même compte, même rotation, saisi plusieurs fois : ce score compte deux fois dans la moyenne.",
    tab: "scores",
  },
  implausible_scores: {
    title: "Scores impossibles (plus de 625M)",
    help: "Faute de frappe probable : elle fausse les records, les moyennes et les podiums.",
    tab: "score-control",
  },
  scores_unknown_cycle: {
    title: "Scores d'un cycle supprimé",
    help: "Ils ne s'affichent nulle part mais restent en base.",
    tab: "scores",
  },
  scores_without_account: {
    title: "Scores sans compte BBS",
    help: "Ignorés par les podiums, les succès et les fiches joueurs. Rattache-les au bon compte avec l'outil de transfert.",
    tab: "scores",
  },
  orphan_scores: {
    title: "Scores d'un compte BBS inconnu",
    help: "Aucun joueur n'a ce compte : ces scores comptent au podium mais n'apparaissent sur aucune fiche.",
    tab: "users",
  },
  scores_unknown_guild: {
    title: "Scores d'une guilde supprimée",
    help: "Ils sortent des classements de guildes.",
    tab: "scores",
  },
  rotations_missing_dates: {
    title: "Rotations sans dates",
    help: "Elles sortent du calendrier, des semaines et du podium mensuel.",
    tab: "cycles",
  },
  rotations_unknown_killer: {
    title: "Rotations dont le killer n'existe plus",
    help: "La page de la rotation et la préparation ne peuvent pas s'afficher.",
    tab: "cycles",
  },
  podium_threshold_off: {
    title: "Seuil du podium désactivé",
    help: "Sans minimum de scores, un joueur avec 2 scores peut finir 1er en moyenne. Le réglage est dans l'onglet Draft.",
    tab: "draft",
  },
  missing_indexes: {
    title: "Index de base manquants",
    help: "Les pages concernées sont plus lentes, et le suivi des candidatures en a besoin.",
    action: "indexes",
  },
  duplicate_bbs_names: {
    title: "Pseudos BBS en double",
    help: "Le même pseudo sur deux joueurs différents : souvent un compte créé deux fois.",
    tab: "users",
  },
  empty_rotations: {
    title: "Rotations terminées sans aucun score",
    help: "Scores oubliés, ou rotation à retirer du cycle.",
    tab: "scores",
  },
  accounts_inactive_guild: {
    title: "Comptes dans une guilde désactivée",
    help: "Ces joueurs n'apparaissent dans aucune guilde active.",
    tab: "users",
  },
  accounts_without_guild: {
    title: "Comptes sans guilde",
    help: "Anciens membres ou joueurs pas encore placés.",
    tab: "users",
  },
};

const TAB_LABELS: Partial<Record<AdminPage, string>> = {
  scores: "Scores", "score-control": "Contrôle des scores", users: "Joueurs", cycles: "Cycles", draft: "Draft",
};

// Short readable line for one sample, whatever its shape
const describeSample = (sample: Record<string, unknown>): string => {
  const parts: string[] = [];
  if (sample.bbs_name) parts.push(String(sample.bbs_name));
  else if (sample.bbs_id) parts.push(`ID ${String(sample.bbs_id)}`);
  if (sample.cycle) parts.push(`${String(sample.cycle)}${sample.position ? ` R${String(sample.position)}` : ""}`);
  if (typeof sample.score === "number") parts.push(formatScore(sample.score));
  if (typeof sample.scores === "number") parts.push(`${sample.scores} score${sample.scores > 1 ? "s" : ""}`);
  if (Array.isArray(sample.bbs_ids)) parts.push(`IDs ${sample.bbs_ids.join(", ")}`);
  if (sample.end_date) parts.push(`fin ${String(sample.end_date)}`);
  if (sample.collection) parts.push(`${String(sample.collection)} ${JSON.stringify(sample.key)}`);
  return parts.join(" · ") || "—";
};

const CheckCard = ({ check, onNavigate, onCreateIndexes, isCreatingIndexes }: {
  check: IDataHealthCheck;
  onNavigate: (tab: AdminPage) => void;
  onCreateIndexes: () => void;
  isCreatingIndexes: boolean;
}) => {
  const [open, setOpen] = useState(check.severity === "error");
  const meta = CHECKS[check.code] ?? { title: check.code, help: "" };
  const severity = SEVERITIES[check.severity];
  const hasSamples = check.samples.length > 0 && check.code !== "podium_threshold_off";

  return (
    <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderLeftWidth="4px" borderLeftColor={`${severity.color}.400`} borderRadius="xl" p={4}>
      <Flex justify="space-between" align="start" gap={3} wrap="wrap">
        <HStack align="start" spacing={3} minW={0} flex={1}>
          <Icon as={severity.icon} color={`${severity.color}.400`} boxSize={5} mt={0.5} />
          <Box minW={0}>
            <HStack spacing={2} wrap="wrap">
              <Text fontWeight="semibold" color="text.strong">{meta.title}</Text>
              {check.code !== "podium_threshold_off" && <Badge colorScheme={severity.color}>{check.count}</Badge>}
            </HStack>
            <Text fontSize="sm" color="text.muted">{meta.help}</Text>
          </Box>
        </HStack>
        <HStack spacing={2}>
          {meta.action === "indexes" && (
            <Button size="sm" colorScheme="purple" onClick={onCreateIndexes} isLoading={isCreatingIndexes}>Créer les index</Button>
          )}
          {meta.tab && (
            <Button size="sm" variant="outline" onClick={() => onNavigate(meta.tab as AdminPage)}>
              {TAB_LABELS[meta.tab] ?? "Ouvrir"}
            </Button>
          )}
          {hasSamples && (
            <Button size="sm" variant="ghost" rightIcon={open ? <FiChevronUp /> : <FiChevronDown />} onClick={() => setOpen((v) => !v)}>
              Détail
            </Button>
          )}
        </HStack>
      </Flex>
      {hasSamples && open && (
        <VStack align="stretch" spacing={1} mt={3} pl={8}>
          {check.samples.map((sample, i) => (
            <Text key={i} fontSize="sm" color="text.secondary" noOfLines={1}>{describeSample(sample)}</Text>
          ))}
          {check.count > check.samples.length && (
            <Text fontSize="xs" color="text.muted">… et {check.count - check.samples.length} autre(s)</Text>
          )}
        </VStack>
      )}
    </Box>
  );
};

export const DataHealthSection = ({ onNavigate }: { onNavigate: (tab: AdminPage) => void }) => {
  const toast = useToast();
  const { checks, checkedAt, isLoading, isValidating, refresh } = useDataHealth();
  const { createIndexes } = useAdminMutations();
  const [isCreatingIndexes, setIsCreatingIndexes] = useState(false);

  const handleCreateIndexes = async () => {
    setIsCreatingIndexes(true);
    try {
      const result = await createIndexes();
      toast({
        status: result.failed.length === 0 ? "success" : "warning",
        title: result.failed.length === 0 ? `${result.created} index à jour` : `${result.failed.length} index en échec sur ${result.total}`,
        duration: 5000,
      });
      await refresh();
    } catch (err) {
      toast({ status: "error", title: (err as Error).message, duration: 4000 });
    } finally {
      setIsCreatingIndexes(false);
    }
  };

  if (isLoading) return <Skeleton h="240px" borderRadius="xl" />;

  const problems = checks.filter((c) => c.count > 0);
  const clean = checks.filter((c) => c.count === 0);

  return (
    <VStack align="stretch" spacing={4}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Text fontSize="sm" color="text.muted">
          {problems.length === 0 ? "Aucun problème détecté." : `${problems.length} point(s) à regarder sur ${checks.length} vérifications.`}
          {checkedAt && ` Vérifié à ${new Date(checkedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}.`}
        </Text>
        <Button size="sm" leftIcon={<FiRefreshCw />} onClick={() => void refresh()} isLoading={isValidating}>Revérifier</Button>
      </Flex>

      {problems.map((check) => (
        <CheckCard
          key={check.code}
          check={check}
          onNavigate={onNavigate}
          onCreateIndexes={handleCreateIndexes}
          isCreatingIndexes={isCreatingIndexes}
        />
      ))}

      {clean.length > 0 && (
        <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
          <HStack mb={2} spacing={2}>
            <Icon as={FiCheckCircle} color="green.400" />
            <Text fontWeight="semibold" color="text.strong">Tout est bon</Text>
          </HStack>
          <Wrap spacing={2}>
            {clean.map((check) => (
              <WrapItem key={check.code}>
                <Badge colorScheme="green" variant="subtle" textTransform="none" fontWeight="medium" px={2} py={0.5} borderRadius="md">
                  {CHECKS[check.code]?.title ?? check.code}
                </Badge>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
    </VStack>
  );
};
