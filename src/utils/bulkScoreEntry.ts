import type { BulkEntryReference, BulkEntryThresholds } from "@/interfaces";

// Formatage, collage et alertes de la saisie groupée des scores (BulkScoreModal / BulkScoreRow).

type RowStatus = { level: "ok" | "warn" | "error"; message: string } | null;

// Toujours au format 612,480,300 (virgules) dans la saisie groupée
export const formatScore = (value: number | null | undefined) =>
    value == null ? "" : value.toLocaleString("en-US");

// "612,480,300", "612 480 300", "612.480.300" → 612480300 ; vide → null
export const parseScore = (text: string): number | null => {
    const digits = text.replace(/\D/g, "");
    return digits ? Number(digits) : null;
};

// Un collage contenant plusieurs valeurs (lignes, tabulations, points-virgules) → liste de scores.
// La virgule n'est pas un séparateur : c'est le séparateur de milliers.
export const parsePastedColumn = (text: string): (number | null)[] =>
    text.split(/[\r\n\t;]+/).map((part) => part.trim()).filter(Boolean).map(parseScore);

const ratioLabel = (ratio: number) =>
    ratio >= 1
        ? `×${ratio.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}`
        : `${Math.round((ratio - 1) * 100)} %`;

/**
 * Alerte d'une valeur saisie, mêmes seuils que l'outil « scores à vérifier » : plus de `above` fois
 * ou moins de `below` fois l'habitude du joueur sur ce killer. Sur une rotation différentielle, la
 * valeur saisie est un cumul : on compare (cumul − base), et un cumul sous la base est une erreur.
 */
export const getRowStatus = (
    value: number | null,
    reference: BulkEntryReference | undefined,
    isDifferential: boolean,
    thresholds: BulkEntryThresholds | undefined
): RowStatus => {
    if (value == null) return null;
    if (value === 0) return { level: "ok", message: "Score à 0" };

    let points = value;
    if (isDifferential && reference?.base_raw != null) {
        if (value < reference.base_raw) {
            return { level: "error", message: `Cumul inférieur au score de base (${formatScore(reference.base_raw)})` };
        }
        points = value - reference.base_raw;
    }

    const usual = reference?.usual_score;
    if (usual && thresholds) {
        const ratio = points / usual;
        if (ratio > thresholds.above || ratio < thresholds.below) {
            return { level: "warn", message: `${ratioLabel(ratio)} par rapport à son habitude (${formatScore(usual)})` };
        }
    }
    return { level: "ok", message: "Cohérent avec ses scores habituels" };
};

