import { Box, Flex, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text, VStack } from "@chakra-ui/react";
import { memo, type SVGProps } from "react";
import type { IUser } from "../../interfaces";
import { UserDisplay } from "./UserDisplay";

// Ligne (vue liste) et carte (vue grille) de saisie d'un score, et icônes du sélecteur de vue,
// utilisées par BulkScoreModal.

export type ViewMode = 'list' | 'grid';

interface ScoreRowProps {
    member: IUser;
    index: number;
    score: number;
    onChange: (bbsId: string, value: number) => void;
    isDisabled: boolean;
    isDark: boolean;
    rowBg: string;
    rowBorder: string;
    rowActiveBg: string;
    rowActiveBorder: string;
    formatNumber: (v: string | number) => string;
    parseNumber: (v: string) => string;
}

interface ScoreCardProps {
    member: IUser;
    score: number;
    onChange: (bbsId: string, value: number) => void;
    isDisabled: boolean;
    isDark: boolean;
    rowBg: string;
    rowBorder: string;
    rowActiveBg: string;
    rowActiveBorder: string;
    formatNumber: (v: string | number) => string;
    parseNumber: (v: string) => string;
}

export const ScoreRow = memo(({
    member, index, score, onChange, isDisabled,
    isDark, rowBg, rowBorder, rowActiveBg, rowActiveBorder,
    formatNumber, parseNumber
}: ScoreRowProps) => {
    const hasScore = score > 0;
    return (
        <Flex
            align="center"
            gap={3}
            px={3} py={2.5}
            borderRadius="lg"
            border="1px solid"
            bg={hasScore ? rowActiveBg : rowBg}
            borderColor={hasScore ? rowActiveBorder : rowBorder}
            transition="background 0.1s, border-color 0.1s"
        >
            <Text
                fontSize="2xs" fontWeight="bold" minW="18px" textAlign="right"
                color={isDark ? 'whiteAlpha.300' : 'gray.300'}
            >
                {index + 1}
            </Text>
            <Box flex={1} minW={0}>
                <UserDisplay user={member} avatarSize="xs" showUsername={false} asLink={false} />
            </Box>
            <NumberInput
                size="sm"
                min={0}
                max={9999999999}
                step={10000000}
                value={score}
                onChange={(_, value) => onChange(member.bbs_id!, value)}
                isDisabled={isDisabled}
                w="160px"
                flexShrink={0}
                format={formatNumber}
                parse={parseNumber}
            >
                <NumberInputField
                    borderRadius="lg"
                    textAlign="right"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                    borderColor={hasScore ? (isDark ? 'purple.600' : 'purple.300') : undefined}
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                    onFocus={(e) => e.target.select()}
                />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
        </Flex>
    );
});

export const ScoreCard = memo(({
    member, score, onChange, isDisabled,
    isDark, rowBg, rowBorder, rowActiveBg, rowActiveBorder,
    formatNumber, parseNumber
}: ScoreCardProps) => {
    const hasScore = score > 0;
    return (
        <Box
            p={3}
            borderRadius="lg"
            border="1px solid"
            bg={hasScore ? rowActiveBg : rowBg}
            borderColor={hasScore ? rowActiveBorder : rowBorder}
            transition="background 0.1s, border-color 0.1s"
        >
            <VStack spacing={2} align="stretch">
                <UserDisplay user={member} avatarSize="xs" showUsername={false} asLink={false} />
                <NumberInput
                    size="sm"
                    min={0}
                    max={9999999999}
                    step={10000000}
                    value={score}
                    onChange={(_, value) => onChange(member.bbs_id!, value)}
                    isDisabled={isDisabled}
                    format={formatNumber}
                    parse={parseNumber}
                >
                    <NumberInputField
                        borderRadius="lg"
                        textAlign="right"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                        borderColor={hasScore ? (isDark ? 'purple.600' : 'purple.300') : undefined}
                        _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                        onFocus={(e) => e.target.select()}
                    />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            </VStack>
        </Box>
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

