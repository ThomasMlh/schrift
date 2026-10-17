import { Badge, Box, Flex, Text, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGuildAlbums } from "@/hooks/useAPI";
import { useMyAlbum } from "@/hooks/useMyAlbum";
import { UserDisplay } from "@/components/ui/UserDisplay";
import { getBuildOwnership } from "@/utils/buildOwnership";
import type { IBuild } from "@/interfaces";

// Members of the viewer's guild who own the build's whole main team, fewest missing links first
export const BuildGuildPlayers = ({ build }: { build: IBuild }) => {
  const { t } = useTranslation();
  const { account } = useMyAlbum();
  const guildId = account?.guilde_id ?? undefined;
  const { members, isLoading } = useGuildAlbums(guildId);

  const { players, othersCount, withoutAlbumCount } = useMemo(() => {
    const filled = members.filter((m) => m.characters !== null);
    const rows = filled
      .map((member) => ({ member, ownership: getBuildOwnership(build, member.characters ?? {}) }))
      .filter(({ ownership }) => ownership.missingTeam.length === 0)
      .sort((a, b) => a.ownership.missingLinks.length - b.ownership.missingLinks.length);
    return {
      players: rows,
      othersCount: filled.length - rows.length,
      withoutAlbumCount: members.length - filled.length,
    };
  }, [members, build]);

  if (!guildId || isLoading || members.length === 0) return null;

  return (
    <Box p={4} bg="bg.subtle" borderRadius="lg" borderWidth="1px" borderColor="border.subtle">
      <Text fontSize="xs" color="text.muted" mb={2} fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
        {t("components.buildOwnership.guildTitle")}
      </Text>
      {players.length === 0 ? (
        <Text fontSize="sm" color="text.muted">{t("components.buildOwnership.guildNobody")}</Text>
      ) : (
        <VStack align="stretch" spacing={1.5} maxH="220px" overflowY="auto">
          {players.map(({ member, ownership }) => (
            <Flex key={member.bbs_id} justify="space-between" align="center" gap={2}>
              <Box minW={0}>
                <UserDisplay user={member} avatarSize="xs" spacing={2} textSize="sm" />
              </Box>
              {ownership.missingLinks.length === 0 ? (
                <Badge colorScheme="green" variant="subtle" borderRadius="full" textTransform="none">
                  {t("components.buildOwnership.playable")}
                </Badge>
              ) : (
                <Badge colorScheme="orange" variant="subtle" borderRadius="full" textTransform="none" title={ownership.missingLinks.join(", ")}>
                  {t("components.buildOwnership.missingLinks", { count: ownership.missingLinks.length })}
                </Badge>
              )}
            </Flex>
          ))}
        </VStack>
      )}
      {(othersCount > 0 || withoutAlbumCount > 0) && (
        <Text fontSize="xs" color="text.muted" mt={2}>
          {[
            othersCount > 0 && t("components.buildOwnership.guildOthers", { count: othersCount }),
            withoutAlbumCount > 0 && t("components.buildOwnership.guildWithoutAlbum", { count: withoutAlbumCount }),
          ].filter(Boolean).join(" · ")}
        </Text>
      )}
    </Box>
  );
};
