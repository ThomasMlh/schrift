import { Box, Button, HStack, Input, InputGroup, InputLeftElement, Spinner, Text, VStack } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useState } from "react";
import type { IGuild } from "@/interfaces";
import type { DraftAccount } from "@/utils/draftBoard";
import { GuildTag } from "./DraftPlayerChip";

interface DraftSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  results: DraftAccount[];
  isLoading: boolean;
  guilds: IGuild[];
  guildColor: (guildId: string | null) => string;
  // Guild the account is in once the draft runs
  finalGuildId: (account: DraftAccount) => string | null;
  onMove: (account: DraftAccount, toGuildId: string | null) => void;
}

const MAX_RESULTS = 8;

// Quick move: type a name, then click the destination guild straight from the suggestion
export const DraftSearchBar = ({ value, onChange, results, isLoading, guilds, guildColor, finalGuildId, onMove }: DraftSearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const term = value.trim();
  const shown = results.slice(0, MAX_RESULTS);
  const guildTag = (guildId: string | null) =>
    guildId ? { name: guilds.find((g) => g._id === guildId)?.name ?? "?", color: guildColor(guildId) } : null;

  return (
    <Box position="relative" onFocus={() => setIsFocused(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsFocused(false); }}>
      <InputGroup>
        <InputLeftElement pointerEvents="none"><SearchIcon color="text.muted" /></InputLeftElement>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") onChange(""); }}
          placeholder="Rechercher un joueur pour le déplacer"
          aria-label="Rechercher un joueur pour le déplacer"
          bg="bg.card"
          borderColor="purple.400"
        />
      </InputGroup>
      {isFocused && term && (
        <VStack
          position="absolute"
          top="calc(100% + 4px)"
          insetX={0}
          zIndex="dropdown"
          align="stretch"
          spacing={0.5}
          p={1.5}
          bg="bg.card"
          borderWidth="1px"
          borderColor="border.subtle"
          borderRadius="lg"
          boxShadow="lg"
          maxH="360px"
          overflowY="auto"
        >
          {shown.length === 0 ? (
            <HStack px={2} py={2} color="text.muted" fontSize="sm">
              {isLoading ? <Spinner size="xs" /> : null}
              <Text>{isLoading ? "Recherche…" : "Aucun joueur trouvé"}</Text>
            </HStack>
          ) : shown.map((account) => {
            const current = finalGuildId(account);
            const targets = [...guilds.map((g) => g._id as string | null), null].filter((id) => id !== current);
            return (
              <HStack key={account.bbsId} px={2} py={1.5} borderRadius="md" _hover={{ bg: "bg.hover" }} spacing={2} flexWrap="wrap">
                <Text fontWeight="semibold" fontSize="sm" noOfLines={1} maxW="220px">{account.name}</Text>
                <GuildTag guild={guildTag(current)} />
                <HStack spacing={1} ml="auto">
                  {targets.map((id) => (
                    <Button
                      key={id ?? "none"}
                      size="xs"
                      variant="outline"
                      colorScheme={guildColor(id)}
                      onClick={() => { onMove(account, id); onChange(""); }}
                      aria-label={`Déplacer ${account.name} vers ${guildTag(id)?.name ?? "sans guilde"}`}
                    >
                      {guildTag(id)?.name ?? "Sans"}
                    </Button>
                  ))}
                </HStack>
              </HStack>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};
