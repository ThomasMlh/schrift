import { Badge, Box, HStack, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { ICycleRotation } from "@/interfaces";
import { getRotationRealDates } from "@/utils/cycleHelpers";
import { AttackTypeBadge } from "./AttackTypeBadge";

interface RotationLabelProps {
    rotation: ICycleRotation;
    // Short start date, right-aligned (option list)
    showDate?: boolean;
    // Small right-aligned badge (e.g. "Dernière"), replacing the date to leave room for the killer
    badge?: string;
}

const formatShortDate = (date: Date) =>
    date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" });

// Compact rotation label, same style as the home page rotation list:
// "#15 ● Division 0 … ven. 10/10", with a 10px attack dot before the translated killer
export const RotationLabel = ({ rotation, showDate = false, badge }: RotationLabelProps) => {
    const { t } = useTranslation();
    const startDate = showDate && rotation.start_date && rotation.end_date
        ? getRotationRealDates(rotation.start_date, rotation.end_date).realStartDate
        : null;

    return (
        <HStack spacing={2} w="100%" minW={0}>
            <Text fontSize="sm" fontWeight="bold" color="text.muted" minW="30px" flexShrink={0} sx={{ fontVariantNumeric: "tabular-nums" }}>
                #{rotation.position}
            </Text>
            {/* Never let flex shrink the dot when the row runs out of space */}
            <Box flexShrink={0} display="flex">
                <AttackTypeBadge attackType={rotation.attack} size="10px" />
            </Box>
            <Text fontSize="sm" fontWeight="semibold" color="text.strong" noOfLines={1} minW={0}>
                {t(`factions.${rotation.killer}`, rotation.killer)}
            </Text>
            {badge ? (
                <Badge colorScheme="green" fontSize="2xs" ml="auto" flexShrink={0}>{badge}</Badge>
            ) : startDate && (
                <Text fontSize="xs" color="text.muted" ml="auto" flexShrink={0}>
                    {formatShortDate(startDate)}
                </Text>
            )}
        </HStack>
    );
};
