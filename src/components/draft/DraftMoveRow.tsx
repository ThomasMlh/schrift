import { Flex, HStack, Avatar, Text, Tag, TagLabel, IconButton } from "@chakra-ui/react";
import { ArrowForwardIcon, DeleteIcon } from "@chakra-ui/icons";
import type { IGuild, IUser } from "@/interfaces";

interface DraftMove {
  id: string;
  user: IUser;
  fromGuild: IGuild | null;
  toGuild: IGuild | null;
}

interface DraftMoveRowProps {
  move: DraftMove;
  fromColor: string;
  toColor: string;
  borderColor: string;
  isLast: boolean;
  getAvatarUrl: (user: IUser) => string | undefined;
  onRemove?: (id: string) => void;
  hoverBg?: string;
  mutedText?: string;
  compact?: boolean;
}

export const DraftMoveRow = ({
  move,
  fromColor,
  toColor,
  borderColor,
  isLast,
  getAvatarUrl,
  onRemove,
  hoverBg,
  mutedText,
  compact = false,
}: DraftMoveRowProps) => (
  <Flex
    align="center"
    gap={3}
    px={compact ? 4 : 5}
    py={compact ? 3 : 3}
    transition={hoverBg ? "background 0.15s" : undefined}
    _hover={hoverBg ? { bg: hoverBg } : undefined}
    borderBottomWidth={isLast ? 0 : "1px"}
    borderColor={borderColor}
  >
    <HStack spacing={3} flex={1} minW={0}>
      <Avatar
        size={compact ? "xs" : "sm"}
        src={getAvatarUrl(move.user)}
        name={move.user.bbs_name || move.user.global_name || move.user.username}
      />
      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
        {move.user.bbs_name || move.user.global_name || move.user.username}
      </Text>
    </HStack>

    <HStack spacing={2} flexShrink={0}>
      <Tag size="sm" borderRadius="full" colorScheme={fromColor} variant="subtle">
        <TagLabel>{move.fromGuild?.name || "—"}</TagLabel>
      </Tag>
      <ArrowForwardIcon boxSize={3} color="orange.400" />
      <Tag
        size="sm"
        borderRadius="full"
        colorScheme={move.toGuild ? toColor : "gray"}
        variant={move.toGuild ? "subtle" : "outline"}
      >
        <TagLabel>{move.toGuild?.name || "Retrait"}</TagLabel>
      </Tag>
    </HStack>

    {onRemove && (
      <IconButton
        aria-label="Retirer"
        icon={<DeleteIcon boxSize={3} />}
        size="xs"
        variant="ghost"
        borderRadius="full"
        color={mutedText}
        _hover={{ bg: "red.50", color: "red.500", _dark: { bg: "red.900", color: "red.300" } }}
        onClick={() => onRemove(move.id)}
      />
    )}
  </Flex>
);
