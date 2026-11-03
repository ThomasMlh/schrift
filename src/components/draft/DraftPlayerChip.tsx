import { forwardRef } from "react";
import { Avatar, Badge, Box, HStack, Text, type BoxProps } from "@chakra-ui/react";
import type { Role } from "@/interfaces";
import type { DraftAccount } from "@/utils/draftBoard";

export type ChipState = "stay" | "in" | "out";

export interface DraftPlayerChipProps extends Omit<BoxProps, "role"> {
  account: DraftAccount;
  // Role once the draft runs
  finalRole: Role | null;
  state?: ChipState;
  // Other guild of the move: origin for an arrival, destination for a departure
  otherGuild?: { name: string; color: string } | null;
  roleChanged?: boolean;
}

const avatarUrl = ({ user }: DraftAccount) =>
  user.avatar && user.discord_id ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.webp?size=64` : undefined;

export const RoleIcon = ({ role }: { role: Role | null }) =>
  role === "chef" ? <Text as="span" fontSize="xs">👑</Text> : role === "sous-chef" ? <Text as="span" fontSize="xs">🥈</Text> : null;

export const GuildTag = ({ guild }: { guild: { name: string; color: string } | null }) => (
  <Badge colorScheme={guild?.color ?? "gray"} fontSize="2xs" borderRadius="md" flexShrink={0} textTransform="none">
    {guild?.name ?? "Sans"}
  </Badge>
);

// Player pill of the draft board: avatar, name, final role, and the other side of its move
export const DraftPlayerChip = forwardRef<HTMLDivElement, DraftPlayerChipProps>(
  ({ account, finalRole, state = "stay", otherGuild, roleChanged, ...props }, ref) => (
    <Box
      ref={ref}
      as="button"
      type="button"
      display="flex"
      alignItems="center"
      gap={1.5}
      w="100%"
      minW={0}
      pl={1}
      pr={2}
      py={1}
      borderRadius="full"
      textAlign="left"
      bg={state === "in" ? "green.50" : "bg.subtle"}
      boxShadow={state === "in" ? "inset 0 0 0 1px var(--chakra-colors-green-500)" : roleChanged ? "inset 0 0 0 1px var(--chakra-colors-orange-400)" : undefined}
      opacity={state === "out" ? 0.55 : 1}
      _hover={{ bg: state === "in" ? "green.100" : "bg.hover" }}
      _dark={state === "in" ? { bg: "green.900", _hover: { bg: "green.800" } } : undefined}
      _focusVisible={{ outline: "2px solid", outlineColor: "purple.400" }}
      {...props}
    >
      <Avatar size="2xs" src={avatarUrl(account)} name={account.name} flexShrink={0} />
      <Text
        fontSize="sm"
        noOfLines={1}
        flex={1}
        minW={0}
        textDecoration={state === "out" ? "line-through" : undefined}
        textDecorationColor="red.400"
      >
        {account.name}
      </Text>
      <RoleIcon role={state === "out" ? account.role : finalRole} />
      {state !== "stay" && (
        <HStack spacing={1} flexShrink={0}>
          <Text fontSize="xs" color="text.muted">{state === "in" ? "←" : "→"}</Text>
          <GuildTag guild={otherGuild ?? null} />
        </HStack>
      )}
    </Box>
  ),
);
DraftPlayerChip.displayName = "DraftPlayerChip";
