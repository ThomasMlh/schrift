import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Badge, Box, Button, Flex, HStack, Icon, SimpleGrid, Skeleton, Text, VStack,
} from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  FiActivity, FiAlertTriangle, FiChevronRight, FiClock, FiCpu, FiRefreshCw, FiSearch, FiTrendingDown,
} from "react-icons/fi";
import type { AdminPage, IGuild } from "@/interfaces";
import { useActivity, useCycles, useDeclineAlerts, useMissingScores, useScoreAnomalies } from "@/hooks/useAPI";
import { useCurrentRotation } from "@/hooks/useCurrentRotation";
import { getRotationRealDates } from "@/utils/cycleHelpers";
import { formatActivityEntry, NOTIFICATION_TYPE_LABELS } from "@/utils/notificationTypes";
import type { NotificationType } from "@/interfaces";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BoldMarkdownText } from "@/components/ui/BoldMarkdownText";
import type { BotHealth } from "./useBotHealth";

interface AdminOverviewProps {
  // Managed guilds (all of them for an admin, their own for a leader)
  guilds: IGuild[];
  isAdmin: boolean;
  bot: BotHealth;
  onNavigate: (page: AdminPage) => void;
}

const formatRemaining = (ms: number) => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  return days > 0 ? `${days} j ${hours} h` : `${hours} h ${totalMinutes % 60} min`;
};

const formatRelative = (iso: string) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
};

interface OverviewCardProps {
  icon: IconType;
  gradient: string;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  isLoading?: boolean;
  tone?: "default" | "warning" | "danger" | "success";
  onClick?: () => void;
  action?: ReactNode;
}

const TONE_BORDER: Record<NonNullable<OverviewCardProps["tone"]>, string> = {
  default: "border.subtle",
  warning: "orange.400",
  danger: "red.400",
  success: "green.400",
};

// Overview card: key figure, explanation and link to the related tab
const OverviewCard = ({ icon, gradient, label, value, hint, isLoading, tone = "default", onClick, action }: OverviewCardProps) => (
  <Box
    as={onClick ? "button" : "div"}
    onClick={onClick}
    textAlign="left"
    w="100%"
    bg="bg.card"
    borderRadius="xl"
    borderWidth="1px"
    borderColor={TONE_BORDER[tone]}
    p={4}
    role="group"
    transition="border-color 0.15s, transform 0.15s"
    _hover={onClick ? { borderColor: "purple.400", transform: "translateY(-2px)" } : undefined}
  >
    <HStack justify="space-between" align="start" mb={3}>
      <Box p={2} borderRadius="lg" bgGradient={gradient} display="flex">
        <Icon as={icon} boxSize={4} color="white" aria-hidden />
      </Box>
      {action ?? (onClick && (
        <Icon as={FiChevronRight} color="text.muted" _groupHover={{ color: "purple.400" }} aria-hidden />
      ))}
    </HStack>
    <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wide" fontWeight="semibold">
      {label}
    </Text>
    <Skeleton isLoaded={!isLoading} mt={1}>
      <Text fontSize="2xl" fontWeight="extrabold" color="text.strong" lineHeight={1.2} noOfLines={1}>
        {value}
      </Text>
    </Skeleton>
    {hint && (
      <Text fontSize="sm" color="text.secondary" mt={1} noOfLines={2}>
        {hint}
      </Text>
    )}
  </Box>
);

interface GuildMissing {
  total: number;
  lastRotation: number;
  lastPosition: number | null;
}

// Missing scores of one guild on the current cycle; reports the figures to the parent
const GuildMissingRow = ({ guild, onLoaded, onClick }: {
  guild: IGuild;
  onLoaded: (guildId: string, value: GuildMissing) => void;
  onClick: () => void;
}) => {
  const { data, isLoading } = useMissingScores(guild._id);
  const rotations = data?.rotations ?? [];
  const total = rotations.reduce((sum, r) => sum + r.missing.length, 0);
  const last = rotations[rotations.length - 1];
  const lastRotation = last?.missing.length ?? 0;
  const lastPosition = last?.position ?? null;

  useEffect(() => {
    if (!isLoading) onLoaded(guild._id, { total, lastRotation, lastPosition });
  }, [isLoading, total, lastRotation, lastPosition, guild._id, onLoaded]);

  return (
    <Flex
      as="button"
      onClick={onClick}
      w="100%"
      align="center"
      justify="space-between"
      gap={3}
      px={3}
      py={2.5}
      borderRadius="lg"
      _hover={{ bg: "bg.hover" }}
      textAlign="left"
    >
      <Text fontWeight="semibold" color="text.strong">Schrift {guild.name}</Text>
      {isLoading ? (
        <Skeleton h="18px" w="90px" />
      ) : total === 0 ? (
        <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2}>Complet</Badge>
      ) : (
        <HStack spacing={2}>
          {lastRotation > 0 && lastPosition != null && (
            <Text fontSize="xs" color="text.muted">R{lastPosition} : {lastRotation}</Text>
          )}
          <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={2}>
            {total} manquant{total > 1 ? "s" : ""}
          </Badge>
        </HStack>
      )}
    </Flex>
  );
};

const BOT_LABELS: Record<BotHealth["status"], string> = {
  checking: "Vérification…",
  online: "En ligne",
  offline: "Hors ligne",
  unknown: "—",
};

// Admin landing page: what needs attention, at a glance
export const AdminOverview = ({ guilds, isAdmin, bot, onNavigate }: AdminOverviewProps) => {
  const { t } = useTranslation();
  const { cycles, isLoading: cyclesLoading } = useCycles({ limit: 5, authenticated: true });
  const { currentCycle, currentRotation, isRotationActive } = useCurrentRotation(cycles, cyclesLoading);
  const { alerts, isLoading: alertsLoading } = useDeclineAlerts();
  const { anomalies, isLoading: anomaliesLoading } = useScoreAnomalies();
  const { activity, isLoading: activityLoading } = useActivity({ limit: 6 });

  const [missingByGuild, setMissingByGuild] = useState<Record<string, GuildMissing>>({});
  const handleMissingLoaded = useCallback((guildId: string, value: GuildMissing) => {
    setMissingByGuild((prev) => {
      const current = prev[guildId];
      if (current && current.total === value.total && current.lastRotation === value.lastRotation) return prev;
      return { ...prev, [guildId]: value };
    });
  }, []);
  const missingLoaded = guilds.length > 0 && guilds.every((g) => missingByGuild[g._id]);
  const missingTotal = Object.values(missingByGuild).reduce((sum, m) => sum + m.total, 0);

  const rotationDates = currentRotation?.start_date && currentRotation.end_date
    ? getRotationRealDates(currentRotation.start_date, currentRotation.end_date)
    : null;
  const remaining = rotationDates
    ? (isRotationActive ? rotationDates.realEndDate : rotationDates.realStartDate).getTime() - Date.now()
    : null;

  return (
    <VStack align="stretch" spacing={6}>
      <SectionHeader
        title="Vue d'ensemble"
        icon={FiActivity}
        description="Ce qui demande votre attention en ce moment. Cliquez sur une carte pour ouvrir l'onglet concerné."
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: isAdmin ? 5 : 4 }} spacing={4}>
        <OverviewCard
          icon={FiClock}
          gradient="linear(to-br, purple.500, blue.500)"
          label={isRotationActive ? "Rotation en cours" : "Prochaine rotation"}
          isLoading={cyclesLoading}
          value={currentRotation ? `#${currentRotation.position} ${t(`factions.${currentRotation.killer}`, currentRotation.killer)}` : "—"}
          hint={currentRotation && remaining != null
            ? `${isRotationActive ? "Se termine" : "Commence"} dans ${formatRemaining(remaining)}${currentCycle ? ` · ${currentCycle.name}` : ""}`
            : "Aucune rotation prévue"}
          onClick={() => onNavigate(isAdmin ? "cycles" : "scores")}
        />
        <OverviewCard
          icon={FiAlertTriangle}
          gradient="linear(to-br, orange.400, red.400)"
          label="Scores manquants"
          isLoading={!missingLoaded}
          value={missingTotal}
          tone={missingTotal > 0 ? "warning" : "default"}
          hint={missingTotal > 0 ? "Sur les rotations terminées du cycle" : "Tout est saisi"}
          onClick={() => onNavigate("score-control")}
        />
        <OverviewCard
          icon={FiSearch}
          gradient="linear(to-br, yellow.400, orange.400)"
          label="Scores à vérifier"
          isLoading={anomaliesLoading}
          value={anomalies.length}
          tone={anomalies.length > 0 ? "warning" : "default"}
          hint={anomalies.length > 0 ? "Probables erreurs de saisie" : "Rien de suspect"}
          onClick={() => onNavigate("score-control")}
        />
        <OverviewCard
          icon={FiTrendingDown}
          gradient="linear(to-br, pink.400, purple.500)"
          label="Baisses de régime"
          isLoading={alertsLoading}
          value={alerts.length}
          tone={alerts.length > 0 ? "warning" : "default"}
          hint={alerts.length > 0 ? "Membres nettement sous leur habitude" : "Aucune alerte"}
          onClick={() => onNavigate("alerts")}
        />
        {isAdmin && (
          <OverviewCard
            icon={FiCpu}
            gradient="linear(to-br, green.400, teal.400)"
            label="Bot Discord"
            value={BOT_LABELS[bot.status]}
            tone={bot.status === "offline" ? "danger" : bot.status === "online" ? "success" : "default"}
            hint={bot.detail}
            action={
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<Icon as={FiRefreshCw} />}
                onClick={() => void bot.check()}
                isLoading={bot.status === "checking"}
              >
                Tester
              </Button>
            }
          />
        )}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        <Box bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle" p={4}>
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontWeight="bold" color="text.strong">Scores manquants par guilde</Text>
            <Button size="xs" variant="ghost" rightIcon={<Icon as={FiChevronRight} />} onClick={() => onNavigate("score-control")}>
              Contrôle
            </Button>
          </Flex>
          {guilds.length === 0 ? (
            <Text fontSize="sm" color="text.muted" px={3} py={2}>Aucune guilde à suivre.</Text>
          ) : (
            <VStack align="stretch" spacing={0}>
              {guilds.map((guild) => (
                <GuildMissingRow
                  key={guild._id}
                  guild={guild}
                  onLoaded={handleMissingLoaded}
                  onClick={() => onNavigate("score-control")}
                />
              ))}
            </VStack>
          )}
        </Box>

        <Box bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle" p={4}>
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontWeight="bold" color="text.strong">Dernière activité</Text>
            <Button size="xs" variant="ghost" rightIcon={<Icon as={FiChevronRight} />} onClick={() => onNavigate("activity")}>
              Tout voir
            </Button>
          </Flex>
          {activityLoading ? (
            <VStack align="stretch" spacing={3} px={3} py={2}>
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="16px" />)}
            </VStack>
          ) : activity.length === 0 ? (
            <Text fontSize="sm" color="text.muted" px={3} py={2}>Aucune activité récente.</Text>
          ) : (
            <VStack align="stretch" spacing={0}>
              {activity.map((entry) => (
                <Flex key={entry._id} gap={3} px={3} py={2} align="baseline" justify="space-between">
                  <Box minW={0}>
                    <Text fontSize="2xs" color="text.muted" textTransform="uppercase" letterSpacing="wide">
                      {NOTIFICATION_TYPE_LABELS[entry.type as NotificationType] ?? entry.type}
                    </Text>
                    <Text fontSize="sm" color="text.body" noOfLines={2}>
                      <BoldMarkdownText text={formatActivityEntry(entry.type, entry.data)} />
                    </Text>
                  </Box>
                  <Text fontSize="xs" color="text.muted" flexShrink={0}>{formatRelative(entry.created_at)}</Text>
                </Flex>
              ))}
            </VStack>
          )}
        </Box>
      </SimpleGrid>
    </VStack>
  );
};
