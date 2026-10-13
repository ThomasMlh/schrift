import {
  Alert, AlertIcon, Avatar, Badge, Box, Container, Flex, HStack, Skeleton, Table, TableContainer, Tbody, Td,
  Text, Th, Thead, Tooltip, Tr, VStack, } from "@chakra-ui/react";
import { useState } from "react";
import { useDeclineAlerts, useGuilds } from "@/hooks/useAPI";
import { useAuth } from "@/providers/AuthProvider";
import type { IDeclineAlert } from "@/interfaces";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { AlterationImage } from "@/components/ui/AlterationImage";
import CustomLink from "@/components/ui/CustomLink";
import { getUserAvatarUrl } from "@/utils/discord";
import { buildPlayerUrl } from "@/utils/playerUrl";
import { SectionHeader } from "@/components/ui/SectionHeader";

const formatScore = (n: number) => n.toLocaleString("fr-FR");

// Leader/admin view: members whose latest scores are well below their usual level. Each recent
// score is compared with the player's average on the SAME killer in previous cycles (killers do
// not share the same point scale); the computation is done by the API.
const DeclineAlertsSection = () => {
  const { isAdmin, managedGuildIds } = useAuth();
  const { guilds } = useGuilds(true);
  const [guildId, setGuildId] = useState("");
  const { alerts, isLoading, error } = useDeclineAlerts(guildId || undefined);

  const cardBg = "bg.card";
  const border = "border.subtle";
  const mutedText = "text.muted";
  const headerBg = "bg.subtle";

  const selectableGuilds = isAdmin
    ? guilds.filter((g) => !g.disabled)
    : guilds.filter((g) => managedGuildIds.includes(g._id));
  const guildOptions = [
    { value: "", label: isAdmin ? "Toutes les guildes actives" : "Toutes mes guildes" },
    ...selectableGuilds.map((g) => ({ value: g._id, label: g.name })),
  ];

  const renderAlert = (alert: IDeclineAlert) => {
    const avatarUrl = alert.avatar && alert.discord_id
      ? getUserAvatarUrl({ discord_id: alert.discord_id, avatar: alert.avatar }) || undefined
      : undefined;
    const name = alert.bbs_name || alert.global_name || alert.bbs_id;

    return (
      <Box key={alert.bbs_id} bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="xl" p={4}>
        <Flex justify="space-between" align="center" gap={3} mb={3} wrap="wrap">
          <HStack spacing={3} minW={0}>
            <Avatar size="sm" src={avatarUrl} name={name} />
            <VStack spacing={0} align="start" minW={0}>
              <CustomLink to={buildPlayerUrl(alert.bbs_name, alert.bbs_id)} text={name} textSize="sm" sx={{ fontWeight: "semibold" }} />
              {alert.guild_name && (
                <Badge colorScheme="purple" variant="subtle" fontSize="xs" borderRadius="full" px={2}>{alert.guild_name}</Badge>
              )}
            </VStack>
          </HStack>
          <Tooltip label="Écart moyen de ses derniers scores par rapport à son habitude sur les mêmes killers" hasArrow>
            <Badge colorScheme="red" variant="solid" fontSize="sm" px={2}>▼ −{alert.drop_percent} %</Badge>
          </Tooltip>
        </Flex>

        <TableContainer>
          <Table size="sm">
            <Thead bg={headerBg}>
              <Tr>
                <Th>Killer</Th>
                <Th>Cycle</Th>
                <Th isNumeric>Score</Th>
                <Th isNumeric>Habitude</Th>
                <Th isNumeric>Écart</Th>
              </Tr>
            </Thead>
            <Tbody>
              {alert.samples.map((sample) => {
                const gap = Math.round((sample.score / sample.usual - 1) * 100);
                return (
                  <Tr key={`${sample.cycle_id}-${sample.rotation_id}`}>
                    <Td>
                      <HStack spacing={2}>
                        {sample.attack && <AttackTypeBadge attackType={sample.attack} size="12px" />}
                        <Text fontWeight="medium">{sample.killer ?? "—"}</Text>
                        {sample.alteration && <AlterationImage alteration={sample.alteration} size="18px" />}
                      </HStack>
                    </Td>
                    <Td color={mutedText}>{[sample.cycle_name, sample.cycle_year].filter(Boolean).join(" ")}</Td>
                    <Td isNumeric fontWeight="semibold">{sample.score > 0 ? formatScore(sample.score) : "Miss"}</Td>
                    <Td isNumeric color={mutedText}>{formatScore(sample.usual)}</Td>
                    <Td isNumeric>{gap > 0 ? "+" : gap < 0 ? "−" : ""}{Math.abs(gap)} %</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={5} align="stretch">
        <SectionHeader
          title="Baisses de régime"
          description="Membres dont les 3 derniers scores (sur les 2 derniers cycles) sont en moyenne à moins de 80 % de leur habitude sur les mêmes killers. Visible uniquement par les chefs, sous-chefs et admins."
          actions={guildOptions.length > 2 && (
            <Box minW={{ md: "260px" }}>
              <CustomSelect value={guildId} onChange={setGuildId} options={guildOptions} allowDeselect={false} size="md" />
            </Box>
          )}
        />

        {isLoading ? (
          <VStack spacing={3} align="stretch">
            {[0, 1, 2].map((i) => <Skeleton key={i} h="160px" borderRadius="lg" />)}
          </VStack>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            Impossible de charger les baisses de régime.
          </Alert>
        ) : alerts.length === 0 ? (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            Aucune baisse de régime détectée 👍
          </Alert>
        ) : (
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" color={mutedText}>{alerts.length} membre(s) concerné(s), du plus en difficulté au moins en difficulté.</Text>
            {alerts.map(renderAlert)}
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default DeclineAlertsSection;
