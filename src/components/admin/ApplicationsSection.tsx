import { useEffect, useState } from "react";
import {
  Badge, Box, Button, ButtonGroup, Flex, HStack, IconButton, NumberInput, NumberInputField, Skeleton, Switch,
  Text, Textarea, Tooltip, VStack, useToast,
} from "@chakra-ui/react";
import { FiCheck, FiExternalLink, FiTrash2, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useApplications, useRecruitmentSettings } from "@/hooks/useAPI";
import type { ApplicationStatus } from "@/hooks/useAPI";
import { useRecruitmentMutations } from "@/hooks/mutations/useRecruitmentMutations";
import { AcceptApplicationModal } from "./AcceptApplicationModal";
import type { IApplication } from "@/hooks/useAPI";
import { formatWithCommas } from "@/utils/format";

const STATUS_LABELS: Record<ApplicationStatus, { label: string; color: string }> = {
  new: { label: "Nouvelle", color: "purple" },
  waitlist: { label: "En attente", color: "orange" },
  accepted: { label: "Acceptée", color: "green" },
  rejected: { label: "Refusée", color: "red" },
};
const FILTERS: (ApplicationStatus | "all")[] = ["new", "waitlist", "accepted", "rejected", "all"];
const FILTER_LABELS: Record<ApplicationStatus | "all", string> = {
  new: "Nouvelles", waitlist: "Liste d'attente", accepted: "Acceptées", rejected: "Refusées", all: "Toutes",
};

const RecruitmentSettingsCard = () => {
  const toast = useToast();
  const { settings } = useRecruitmentSettings();
  const { updateSettings } = useRecruitmentMutations();
  const [draft, setDraft] = useState({ is_open: true, guild_capacity: 30, intro: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) setDraft({ is_open: settings.is_open, guild_capacity: settings.guild_capacity, intro: settings.intro });
  }, [settings]);

  const save = async () => {
    setIsSaving(true);
    try {
      await updateSettings(draft);
      toast({ status: "success", title: "Recrutement mis à jour", duration: 2500 });
    } catch (err) {
      toast({ status: "error", title: (err as Error).message, duration: 4000 });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={3}>
        <HStack spacing={3}>
          <Switch
            colorScheme="purple"
            isChecked={draft.is_open}
            onChange={(e) => setDraft((d) => ({ ...d, is_open: e.target.checked }))}
          />
          <Text fontWeight="semibold">{draft.is_open ? "Recrutement ouvert" : "Recrutement fermé"}</Text>
        </HStack>
        <HStack spacing={2}>
          <Text fontSize="sm" color="text.muted">Places par guilde</Text>
          <NumberInput
            size="sm"
            w="80px"
            min={1}
            max={200}
            value={draft.guild_capacity}
            onChange={(_, n) => setDraft((d) => ({ ...d, guild_capacity: isNaN(n) ? 1 : n }))}
          >
            <NumberInputField aria-label="Places par guilde" />
          </NumberInput>
          <Button as={Link} to="/recrutement" size="sm" variant="ghost" rightIcon={<FiExternalLink />}>Voir la page</Button>
        </HStack>
      </Flex>
      <Textarea
        value={draft.intro}
        onChange={(e) => setDraft((d) => ({ ...d, intro: e.target.value }))}
        placeholder="Texte d'accueil affiché en haut de la page (conditions, ambiance…)"
        rows={3}
        maxLength={2000}
      />
      <Button mt={3} size="sm" colorScheme="purple" onClick={save} isLoading={isSaving}>Enregistrer</Button>
    </Box>
  );
};

// Applications received from the public recruitment page
export const ApplicationsSection = () => {
  const toast = useToast();
  const [filter, setFilter] = useState<ApplicationStatus | "all">("new");
  const { applications, isLoading } = useApplications(filter === "all" ? undefined : filter);
  const { setApplicationStatus, deleteApplication } = useRecruitmentMutations();
  const [accepting, setAccepting] = useState<IApplication | null>(null);

  const run = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (err) {
      toast({ status: "error", title: (err as Error).message, duration: 4000 });
    }
  };

  return (
    <VStack spacing={5} align="stretch">
      <RecruitmentSettingsCard />

      <AcceptApplicationModal application={accepting} onClose={() => setAccepting(null)} />

      <ButtonGroup size="sm" isAttached variant="outline" alignSelf="flex-start" flexWrap="wrap">
        {FILTERS.map((f) => (
          <Button
            key={f}
            colorScheme={filter === f ? "purple" : "gray"}
            variant={filter === f ? "solid" : "outline"}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABELS[f]}
          </Button>
        ))}
      </ButtonGroup>

      {isLoading ? (
        <Skeleton h="160px" borderRadius="xl" />
      ) : applications.length === 0 ? (
        <Text color="text.muted" textAlign="center" py={8}>Aucune candidature</Text>
      ) : (
        applications.map((app) => (
          <Box key={app._id} bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
            <Flex justify="space-between" align="start" gap={3} wrap="wrap">
              <Box minW={0}>
                <HStack spacing={2} wrap="wrap">
                  <Text fontWeight="bold" color="text.strong">{app.bbs_name}</Text>
                  {app.bbs_id && <Text fontSize="sm" color="text.muted">ID {app.bbs_id}</Text>}
                  <Badge colorScheme={STATUS_LABELS[app.status].color}>{STATUS_LABELS[app.status].label}</Badge>
                </HStack>
                <Text fontSize="sm" color="text.secondary">
                  Discord : {app.discord}
                  {app.average_score ? ` · moyenne ${formatWithCommas(app.average_score)}` : ""}
                  {app.preferred_guild_name ? ` · souhaite ${app.preferred_guild_name}` : ""}
                  {app.accepted_guild_name ? ` · acceptée dans ${app.accepted_guild_name}` : ""}
                </Text>
                <Text fontSize="xs" color="text.muted">{new Date(app.created_at).toLocaleString("fr-FR")}</Text>
                {app.message && <Text mt={2} fontSize="sm" whiteSpace="pre-line">{app.message}</Text>}
              </Box>
              <HStack spacing={1}>
                {app.status !== "accepted" && (
                  <Tooltip label="Accepter">
                    <IconButton size="sm" variant="ghost" colorScheme="green" aria-label="Accepter" icon={<FiCheck />}
                      onClick={() => setAccepting(app)} />
                  </Tooltip>
                )}
                {app.status !== "rejected" && (
                  <Tooltip label="Refuser">
                    <IconButton size="sm" variant="ghost" colorScheme="orange" aria-label="Refuser" icon={<FiX />}
                      onClick={() => run(() => setApplicationStatus(app._id, "rejected"))} />
                  </Tooltip>
                )}
                <Tooltip label="Supprimer">
                  <IconButton size="sm" variant="ghost" colorScheme="red" aria-label="Supprimer" icon={<FiTrash2 />}
                    onClick={() => run(() => deleteApplication(app._id))} />
                </Tooltip>
              </HStack>
            </Flex>
          </Box>
        ))
      )}
    </VStack>
  );
};
