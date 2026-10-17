import {
  Badge, Box, Button, Flex, Grid, HStack, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger,
  Progress, Skeleton, Text, VStack, useToast,
} from "@chakra-ui/react";
import { FiCopy } from "react-icons/fi";
import { useAuth } from "@/providers/AuthProvider";
import { memo, useCallback, useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCharacterCatalog, useGuildAlbums } from "@/hooks/useAPI";
import { AlbumThumb } from "@/components/album/AlbumThumb";
import { AlbumFilters } from "@/components/album/AlbumFilters";
import { UserDisplay } from "@/components/ui/UserDisplay";
import { EMPTY_ALBUM_FILTERS, MAX_SPE, filterAlbumCharacters } from "@/utils/albumFilters";
import type { IAlbumCharacter, IGuildAlbumMember } from "@/interfaces";

interface Owner {
  member: IGuildAlbumMember;
  spe: number;
}

// Stable reference so memoized tiles without owners do not re-render
const NO_OWNERS: Owner[] = [];

const displayName = (member: IGuildAlbumMember) => member.bbs_name || member.global_name || "";

interface GuildAlbumTileProps {
  character: IAlbumCharacter;
  owners: Owner[];
  missingAlbums: number;
  isActive: boolean;
  onOpen: (characterId: string) => void;
  onClose: () => void;
}

const GuildAlbumTile = memo(({ character, owners, missingAlbums, isActive, onOpen, onClose }: GuildAlbumTileProps) => {
  const { t } = useTranslation();
  const label = character.version || character.name;
  const bestSpe = owners[0]?.spe ?? 0;

  const trigger = (
    <Box as="button" type="button" display="block" w="100%" aria-label={label} title={label} onClick={() => onOpen(character._id)}>
      <AlbumThumb character={character} spe={bestSpe}>
        {owners.length > 0 && (
          <Box
            position="absolute"
            top="3px"
            right="3px"
            minW="18px"
            h="18px"
            px="5px"
            borderRadius="full"
            bg="purple.500"
            color="white"
            fontSize="2xs"
            fontWeight="bold"
            lineHeight="18px"
            textAlign="center"
          >
            {owners.length}
          </Box>
        )}
      </AlbumThumb>
    </Box>
  );

  if (!isActive) return trigger;

  return (
    <Popover isOpen onClose={onClose} placement="top" isLazy>
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent w="260px">
        <PopoverArrow />
        <PopoverBody>
          <Text fontSize="sm" fontWeight="semibold" color="text.strong" mb={2} noOfLines={2}>{label}</Text>
          {owners.length === 0 ? (
            <Text fontSize="sm" color="text.muted">{t("pages.guilds.albumNoOwner")}</Text>
          ) : (
            <VStack align="stretch" spacing={1.5} maxH="260px" overflowY="auto">
              {owners.map(({ member, spe }) => (
                <Flex key={member.bbs_id} justify="space-between" align="center" gap={2}>
                  <Box minW={0}>
                    <UserDisplay user={member} avatarSize="xs" spacing={2} textSize="sm" />
                  </Box>
                  <Badge colorScheme={spe === MAX_SPE ? "yellow" : "purple"} flexShrink={0}>
                    {t("pages.guilds.albumSpe", { spe })}
                  </Badge>
                </Flex>
              ))}
            </VStack>
          )}
          {missingAlbums > 0 && (
            <Text fontSize="xs" color="text.muted" mt={2}>
              {t("pages.guilds.albumUnknown", { count: missingAlbums })}
            </Text>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});

export const GuildAlbum = ({ guildId }: { guildId: string }) => {
  const { t } = useTranslation();
  const { characters, isLoading: catalogLoading } = useCharacterCatalog();
  const { members, isLoading: membersLoading } = useGuildAlbums(guildId);
  const { isAdmin, managedGuildIds } = useAuth();
  const canRemind = isAdmin || managedGuildIds.includes(guildId);
  const toast = useToast();
  const [filters, setFilters] = useState(EMPTY_ALBUM_FILTERS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const deferredFilters = useDeferredValue(filters);

  const { filled, withoutAlbum } = useMemo(() => ({
    filled: members.filter((m) => m.characters !== null),
    withoutAlbum: members.filter((m) => m.characters === null).sort((a, b) => displayName(a).localeCompare(displayName(b))),
  }), [members]);

  // Best spec first, then by name
  const ownersByCharacter = useMemo(() => {
    const map = new Map<string, Owner[]>();
    for (const member of filled) {
      for (const [characterId, spe] of Object.entries(member.characters ?? {})) {
        if (spe <= 0) continue;
        const owners = map.get(characterId) ?? [];
        owners.push({ member, spe });
        map.set(characterId, owners);
      }
    }
    for (const owners of map.values()) {
      owners.sort((a, b) => b.spe - a.spe || displayName(a.member).localeCompare(displayName(b.member)));
    }
    return map;
  }, [filled]);

  const visibleCharacters = useMemo(
    () => filterAlbumCharacters(characters, deferredFilters, (id) => ownersByCharacter.has(id)),
    [characters, ownersByCharacter, deferredFilters],
  );

  const closeTile = useCallback(() => setActiveId(null), []);

  if (catalogLoading || membersLoading) return <Skeleton h="320px" borderRadius="xl" />;

  // Discord mentions paste as pings; members without a Discord id fall back to their name
  const copyReminder = async () => {
    const mentions = [...new Set(withoutAlbum.map((m) => (m.discord_id ? `<@${m.discord_id}>` : displayName(m))))];
    try {
      await navigator.clipboard.writeText(`${mentions.join(" ")} ${t("pages.guilds.albumReminderMessage")}`);
      toast({ status: "success", title: t("pages.guilds.albumReminderCopied"), duration: 2500 });
    } catch {
      toast({ status: "error", title: t("pages.guilds.albumReminderCopyError"), duration: 3000 });
    }
  };

  const coveredCount = characters.filter((c) => ownersByCharacter.has(c._id)).length;
  const fillPercent = members.length > 0 ? Math.round((filled.length / members.length) * 100) : 0;

  return (
    <VStack spacing={5} align="stretch">
      <Box bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle" p={5}>
        <Flex justify="space-between" align="baseline" wrap="wrap" gap={2} mb={2}>
          <Box>
            <Text fontSize="md" fontWeight="bold" color="text.strong">{t("pages.guilds.albumTitle")}</Text>
            <Text fontSize="sm" color="text.muted">{t("pages.guilds.albumSubtitle")}</Text>
          </Box>
          <HStack spacing={4}>
            <Text fontSize="sm" color="text.muted">
              <Text as="span" fontSize="xl" fontWeight="bold" color="text.strong">{filled.length}</Text>
              {" "}{t("pages.guilds.albumFilled", { total: members.length })}
            </Text>
            <Text fontSize="sm" color="text.muted">
              {t("pages.guilds.albumCovered", { covered: coveredCount, total: characters.length })}
            </Text>
          </HStack>
        </Flex>
        <Progress value={fillPercent} size="sm" colorScheme="purple" borderRadius="full" />
        {withoutAlbum.length > 0 && (
          <Flex mt={3} gap={3} align="center" justify="space-between" wrap="wrap">
            <Text fontSize="xs" color="text.muted" flex="1 1 300px">
              {t("pages.guilds.albumWithout")}{" "}
              <Text as="span" color="text.secondary">{withoutAlbum.map(displayName).join(", ")}</Text>
            </Text>
            {canRemind && (
              <Button size="xs" variant="outline" leftIcon={<FiCopy />} onClick={copyReminder} flexShrink={0}>
                {t("pages.guilds.albumReminderButton")}
              </Button>
            )}
          </Flex>
        )}
      </Box>

      {filled.length === 0 ? (
        <Text fontSize="sm" color="text.muted" textAlign="center" py={8}>{t("pages.guilds.albumNobodyFilled")}</Text>
      ) : (
        <>
          <AlbumFilters
            value={filters}
            onChange={setFilters}
            ownershipLabels={{
              all: t("pages.user.albumFilter_all"),
              owned: t("pages.guilds.albumFilter_owned"),
              missing: t("pages.guilds.albumFilter_missing"),
            }}
          />

          {visibleCharacters.length === 0 ? (
            <Text fontSize="sm" color="text.muted" textAlign="center" py={8}>{t("pages.user.albumEmpty")}</Text>
          ) : (
            <Grid templateColumns="repeat(auto-fill, minmax(76px, 1fr))" gap={3}>
              {visibleCharacters.map((character) => (
                <GuildAlbumTile
                  key={character._id}
                  character={character}
                  owners={ownersByCharacter.get(character._id) ?? NO_OWNERS}
                  missingAlbums={withoutAlbum.length}
                  isActive={activeId === character._id}
                  onOpen={setActiveId}
                  onClose={closeTile}
                />
              ))}
            </Grid>
          )}
        </>
      )}
    </VStack>
  );
};
