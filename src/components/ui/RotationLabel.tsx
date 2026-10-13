import { Badge, Box, HStack, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { ICycleRotation } from "@/interfaces";
import { getRotationRealDates } from "@/utils/cycleHelpers";
import { AttackTypeBadge } from "./AttackTypeBadge";

interface RotationLabelProps {
    rotation: ICycleRotation;
    // Date courte de début, alignée à droite (liste des options)
    showDate?: boolean;
    // Petit badge aligné à droite (ex : « Dernière »), à la place de la date pour laisser la place au killer
    badge?: string;
}

const formatShortDate = (date: Date) =>
    date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" });

// Libellé discret d'une rotation, même style que la liste des rotations de l'accueil :
// « #15 ● Division 0 … ven. 10/10 », pastille d'attaque de 10px avant le killer traduit
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
            {/* Le flex ne doit jamais écraser la pastille quand la ligne manque de place */}
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
