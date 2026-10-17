import type { BulkEntryReference, BulkEntryThresholds } from "@/interfaces";

// Formatting, pasting and alerts of the bulk score entry (BulkScoreModal / BulkScoreRow).

type RowStatus = { level: "ok" | "warn" | "error"; message: string } | null;

// Always formatted as 612,480,300 (commas) in the bulk entry
export const formatScore = (value: number | null | undefined) =>
    value == null ? "" : value.toLocaleString("en-US");

// "612,480,300", "612 480 300", "612.480.300" -> 612480300; empty -> null
export const parseScore = (text: string): number | null => {
    const digits = text.replace(/\D/g, "");
    return digits ? Number(digits) : null;
};

// A paste holding several values (lines, tabs, semicolons) -> list of scores.
// The comma is not a separator: it is the thousands separator.
export const parsePastedColumn = (text: string): (number | null)[] =>
    text.split(/[\r\n\t;]+/).map((part) => part.trim()).filter(Boolean).map(parseScore);

const ratioLabel = (ratio: number) =>
    ratio >= 1
        ? `×${ratio.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}`
        : `${Math.round((ratio - 1) * 100)} %`;

/**
 * Alert for an entered value, with the same thresholds as the score review tool: more than `above`
 * or less than `below` times the player's usual score on this killer. On a differential rotation the
 * entered value is a running total, so (total - base) is compared, and a total below the base is an error.
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
    if (!usual || !thresholds) return { level: "ok", message: "Pas d'historique sur ce killer pour comparer" };
    const ratio = points / usual;
    if (ratio > thresholds.above || ratio < thresholds.below) {
        return { level: "warn", message: `${ratioLabel(ratio)} par rapport à son habitude (${formatScore(usual)})` };
    }
    return { level: "ok", message: `Cohérent avec son habitude (${formatScore(usual)})` };
};

