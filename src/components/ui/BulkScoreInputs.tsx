import { Box, Flex, HStack, Input, Text, Tooltip } from "@chakra-ui/react";
import { memo, type ClipboardEvent, type KeyboardEvent, type SVGProps } from "react";
import type { IUser, BulkEntryReference, BulkEntryThresholds } from "../../interfaces";
import { UserDisplay } from "./UserDisplay";
import { formatScore, getRowStatus, parsePastedColumn, parseScore } from "@/utils/bulkScoreEntry";

// Bulk score entry input (BulkScoreModal), as a row (list view) or a card (grid view),
// and the view switch icons.

export type ViewMode = "list" | "grid";

const STATUS_STYLE = {
    ok: { icon: "✓", color: "green.400" },
    warn: { icon: "⚠", color: "orange.400" },
    error: { icon: "✕", color: "red.400" },
} as const;

interface BulkScoreRowProps {
    member: IUser;
    index: number;
    value: number | null;
    isDirty: boolean;
    reference?: BulkEntryReference;
    isDifferential: boolean;
    thresholds?: BulkEntryThresholds;
    isDisabled: boolean;
    onChange: (bbsId: string, value: number | null) => void;
    onPasteColumn: (index: number, values: (number | null)[]) => void;
    layout: ViewMode;
}

// Enter moves to the next field
const focusRow = (index: number) => {
    const next = document.querySelector<HTMLInputElement>(`[data-bulk-score-index="${index}"]`);
    next?.focus();
};

export const BulkScoreRow = memo(({
    member, index, value, isDirty, reference, isDifferential, thresholds, isDisabled, onChange, onPasteColumn, layout,
}: BulkScoreRowProps) => {
    const status = getRowStatus(value, reference, isDifferential, thresholds);
    const style = status ? STATUS_STYLE[status.level] : null;

    // Only reference shown: the week's base on a differential rotation (the player's usual score is
    // in the alert message)
    const baseRaw = isDifferential ? reference?.base_raw ?? null : null;

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        const values = parsePastedColumn(e.clipboardData.getData("text"));
        if (values.length > 1) {
            e.preventDefault();
            onPasteColumn(index, values);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            focusRow(index + 1);
        }
    };

    // Slightly raised background without a frame; the border only signals an alert
    const borderColor = status?.level === "error" ? "red.400" : status?.level === "warn" ? "orange.400" : "transparent";

    const referenceText = isDifferential ? (
        <Text fontSize="xs" color="text.muted" fontFamily="mono" noOfLines={1} mt={0.5}>
            {baseRaw != null ? `Base ${formatScore(baseRaw)}` : "Base non saisie"}
        </Text>
    ) : null;

    const input = (
        <Input
            data-bulk-score-index={index}
            size="sm"
            w={layout === "grid" ? "100%" : { base: "130px", sm: "160px" }}
            flexShrink={0}
            inputMode="numeric"
            textAlign="right"
            fontFamily="mono"
            borderRadius="lg"
            placeholder="Score"
            bg="bg.card"
            borderColor={isDirty ? "purple.400" : "border.default"}
            _placeholder={{ color: "text.muted" }}
            value={formatScore(value)}
            onChange={(e) => onChange(member.bbs_id!, parseScore(e.target.value))}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
            isDisabled={isDisabled}
            focusBorderColor="purple.400"
        />
    );

    const statusIcon = (
        <Tooltip label={status?.message} hasArrow isDisabled={!status}>
            <Text w="16px" flexShrink={0} textAlign="center" fontWeight="bold" color={style?.color}>
                {style?.icon ?? ""}
            </Text>
        </Tooltip>
    );

    if (layout === "grid") {
        return (
            <Box p={2.5} borderRadius="lg" borderWidth="1px" borderColor={borderColor} bg="bg.subtle">
                {/* Name and alert on the same line, the field takes the full width below */}
                <HStack align="start" spacing={2} mb={2}>
                    <Box flex={1} minW={0}>
                        <UserDisplay user={member} avatarSize="xs" showUsername={false} asLink={false} />
                        {referenceText}
                    </Box>
                    {statusIcon}
                </HStack>
                {input}
            </Box>
        );
    }

    return (
        <Flex
            align="center"
            gap={3}
            px={3}
            py={2}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            bg="bg.subtle"
        >
            <Text fontSize="xs" color="text.muted" minW="20px" textAlign="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                {index + 1}
            </Text>
            <Box flex={1} minW={0}>
                <UserDisplay user={member} avatarSize="xs" showUsername={false} asLink={false} />
                {referenceText}
            </Box>
            {input}
            {statusIcon}
        </Flex>
    );
});

export const ListIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" {...props}>
        <rect x="0" y="2" width="16" height="2.5" rx="1" />
        <rect x="0" y="6.75" width="16" height="2.5" rx="1" />
        <rect x="0" y="11.5" width="16" height="2.5" rx="1" />
    </svg>
);

export const GridIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" {...props}>
        <rect x="0" y="0" width="6.5" height="6.5" rx="1" />
        <rect x="9.5" y="0" width="6.5" height="6.5" rx="1" />
        <rect x="0" y="9.5" width="6.5" height="6.5" rx="1" />
        <rect x="9.5" y="9.5" width="6.5" height="6.5" rx="1" />
    </svg>
);
