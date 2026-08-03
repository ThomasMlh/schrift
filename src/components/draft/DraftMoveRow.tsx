import { useState } from "react";
import { Flex, HStack, Avatar, Text, Tag, TagLabel, IconButton, Tooltip } from "@chakra-ui/react";
import { ArrowForwardIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import type { IGuild, IUser } from "@/interfaces";
import { CustomSelect } from "../ui/CustomSelect";

interface DraftMove {
  id: string;
  user: IUser;
  bbsId: string;
  fromGuild: IGuild | null;
  toGuild: IGuild | null;
}

interface TargetOption {
  value: string;
  label: string;
}

interface DraftMoveRowProps {
  move: DraftMove;
  fromColor: string;
  toColor: string;
  borderColor: string;
  isLast: boolean;
  getAvatarUrl: (user: IUser) => string | undefined;
  onRemove?: (id: string) => void;
  onChangeTarget?: (moveId: string, toGuildId: string | null) => void;
  targetOptions?: TargetOption[];
  hoverBg?: string;
  mutedText?: string;
  compact?: boolean;
}

const TAG_MAX_W = "140px";

export const DraftMoveRow = ({
  move,
  fromColor,
  toColor,
  borderColor,
  isLast,
  getAvatarUrl,
  onRemove,
  onChangeTarget,
  targetOptions,
  hoverBg,
  mutedText,
  compact = false,
}: DraftMoveRowProps) => {
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const canEditTarget = Boolean(onChangeTarget && targetOptions);

  return (
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
        <Tooltip label={move.fromGuild?.name || "Sans guilde"} hasArrow openDelay={400}>
          <Tag size="sm" borderRadius="full" colorScheme={fromColor} variant="subtle" maxW={TAG_MAX_W}>
            <TagLabel isTruncated>{move.fromGuild?.name || "—"}</TagLabel>
          </Tag>
        </Tooltip>

        <ArrowForwardIcon boxSize={3} color="orange.400" flexShrink={0} />

        {canEditTarget && isEditingTarget ? (
          <CustomSelect
            size="sm"
            w="180px"
            minW="180px"
            allowDeselect={false}
            accentColor="orange.400"
            value={move.toGuild ? move.toGuild._id : "__none__"}
            onChange={(v) => {
              onChangeTarget!(move.id, v === "__none__" ? null : v);
              setIsEditingTarget(false);
            }}
            options={targetOptions!}
          />
        ) : (
          <Tooltip
            label={canEditTarget ? "Cliquer pour modifier la destination" : move.toGuild?.name || "Retrait de guilde"}
            hasArrow
            openDelay={400}
          >
            <Tag
              size="sm"
              borderRadius="full"
              colorScheme={move.toGuild ? toColor : "gray"}
              variant={move.toGuild ? "subtle" : "outline"}
              maxW={TAG_MAX_W}
              cursor={canEditTarget ? "pointer" : "default"}
              _hover={canEditTarget ? { boxShadow: "0 0 0 1px currentColor" } : undefined}
              onClick={canEditTarget ? () => setIsEditingTarget(true) : undefined}
            >
              <TagLabel isTruncated>{move.toGuild?.name || "Retrait"}</TagLabel>
              {canEditTarget && <EditIcon boxSize={2.5} ml={1} opacity={0.6} />}
            </Tag>
          </Tooltip>
        )}
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
};
