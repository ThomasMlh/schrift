import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { RadarMetricDef } from "./ComparisonRadarChart";
import type { TableMetricDef } from "./ComparisonDataTable";
import type { IUserStats, IGuildStats } from "@/hooks/useAPI";
import { formatScore, formatNumber } from "@/utils/format";
import {
  FiAlertTriangle, FiAward, FiBarChart2, FiCalendar, FiCheckCircle, FiCrosshair, FiHash, FiHeart, FiShield,
  FiTarget, FiTrendingDown, FiTrendingUp, FiUsers, FiZap,
} from "react-icons/fi";

// Comparator metric definitions (radar and table) for characters, players, guilds and the
// weekly mode.

export const ENTITY_COLORS = [
  "#3182CE",
  "#38A169",
  "#DD6B20",
  "#9F7AEA",
  "#E53E3E",
];

export const parseStatValue = (val?: string): number => {
  if (!val) return 0;
  return parseInt(val.replace(/[^\d]/g, ""), 10) || 0;
};

export const useComparatorMetrics = () => {
  const { t } = useTranslation();

  // Character radar and table metrics, computed from the selected characters
  const charRadarMetrics = useMemo<RadarMetricDef[]>(() => [
    { key: "atk", label: t("components.comparatorCharts.radarCharAtk"), getRawValue: (s) => parseStatValue(s.atk as string) },
    { key: "def", label: t("components.comparatorCharts.radarCharDef"), getRawValue: (s) => parseStatValue(s.def as string) },
    { key: "end", label: t("components.comparatorCharts.radarCharEnd"), getRawValue: (s) => parseStatValue(s.end as string) },
    { key: "cct", label: t("components.comparatorCharts.radarCharCct"), getRawValue: (s) => parseStatValue(s.cct as string) },
    { key: "pre", label: t("components.comparatorCharts.radarCharPre"), getRawValue: (s) => parseStatValue(s.pre as string) },
  ], [t]);

  const charTableMetrics = useMemo<TableMetricDef[]>(() => [
    { label: t("components.comparatorCharts.radarCharAtk"), icon: FiZap, getDisplayValue: (s) => formatNumber(parseStatValue(s.atk as string)), getRawValue: (s) => parseStatValue(s.atk as string) },
    { label: t("components.comparatorCharts.radarCharDef"), icon: FiShield, getDisplayValue: (s) => formatNumber(parseStatValue(s.def as string)), getRawValue: (s) => parseStatValue(s.def as string) },
    { label: t("components.comparatorCharts.radarCharEnd"), icon: FiHeart, getDisplayValue: (s) => formatNumber(parseStatValue(s.end as string)), getRawValue: (s) => parseStatValue(s.end as string) },
    { label: t("components.comparatorCharts.radarCharCct"), icon: FiTarget, getDisplayValue: (s) => formatNumber(parseStatValue(s.cct as string)), getRawValue: (s) => parseStatValue(s.cct as string) },
    { label: t("components.comparatorCharts.radarCharPre"), icon: FiCrosshair, getDisplayValue: (s) => formatNumber(parseStatValue(s.pre as string)), getRawValue: (s) => parseStatValue(s.pre as string) },
  ], [t]);

  const playerRadarMetrics = useMemo<RadarMetricDef[]>(() => {
    const P = (s: Record<string, unknown>) => s as unknown as IUserStats;
    return [
      { key: "averageScore", label: t("components.comparatorCharts.radarAvg"), getRawValue: (s) => P(s)?.averageScore || 0 },
      { key: "bestScore", label: t("components.comparatorCharts.radarBest"), getRawValue: (s) => P(s)?.bestScore?.score || 0 },
      { key: "totalScores", label: t("components.comparatorCharts.radarParticipation"), getRawValue: (s) => P(s)?.totalScores || 0 },
      { key: "regularity", label: t("components.comparatorCharts.radarRegularity"), getRawValue: (s) => typeof P(s)?.missRate === "number" ? 100 - P(s).missRate! : 0, absolute: true },
      { key: "totalPoints", label: t("components.comparatorCharts.radarTotalPoints"), getRawValue: (s) => P(s)?.totalPoints || 0 },
    ];
  }, [t]);

  const guildRadarMetrics = useMemo<RadarMetricDef[]>(() => {
    const G = (s: Record<string, unknown>) => s as unknown as IGuildStats;
    return [
      { key: "averageScore", label: t("components.comparatorCharts.radarAvg"), getRawValue: (s) => G(s)?.averageScore || 0 },
      { key: "bestScore", label: t("components.comparatorCharts.radarBest"), getRawValue: (s) => G(s)?.bestScore || 0 },
      { key: "totalMembers", label: t("components.comparatorCharts.radarMembers"), getRawValue: (s) => G(s)?.totalMembers || 0 },
      { key: "totalScores", label: t("components.comparatorCharts.radarParticipation"), getRawValue: (s) => G(s)?.totalScores || 0 },
      { key: "clearRate", label: t("components.comparatorCharts.metricClearRate"), getRawValue: (s) => G(s)?.clearRate || 0, absolute: true },
    ];
  }, [t]);

  const playerTableMetrics = useMemo<TableMetricDef[]>(() => {
    const P = (s: Record<string, unknown>) => s as unknown as IUserStats;
    return [
      { label: t("components.comparatorCharts.metricAvgScore"), icon: FiBarChart2, getDisplayValue: (s) => formatScore(P(s)?.averageScore), getRawValue: (s) => P(s)?.averageScore || 0 },
      { label: t("components.comparatorCharts.metricBestScore"), icon: FiAward, getDisplayValue: (s) => formatNumber(P(s)?.bestScore?.score), getRawValue: (s) => P(s)?.bestScore?.score || 0 },
      { label: t("components.comparatorCharts.metricWorstScore"), icon: FiTrendingDown, getDisplayValue: (s) => formatNumber(P(s)?.worstScore?.score), getRawValue: (s) => P(s)?.worstScore?.score || 0 },
      { label: t("components.comparatorCharts.metricParticipations"), icon: FiTarget, getDisplayValue: (s) => formatNumber(P(s)?.totalScores), getRawValue: (s) => P(s)?.totalScores || 0 },
      { label: t("components.comparatorCharts.metricTotalPoints"), icon: FiTrendingUp, getDisplayValue: (s) => formatScore(P(s)?.totalPoints), getRawValue: (s) => P(s)?.totalPoints || 0 },
      { label: t("components.comparatorCharts.metricMissRate"), icon: FiAlertTriangle, getDisplayValue: (s) => typeof P(s)?.missRate === "number" ? `${P(s).missRate}%` : "N/A", getRawValue: (s) => P(s)?.missRate || 0, inverse: true, unit: "percent" },
    ];
  }, [t]);

  const guildTableMetrics = useMemo<TableMetricDef[]>(() => {
    const G = (s: Record<string, unknown>) => s as unknown as IGuildStats;
    return [
      { label: t("components.comparatorCharts.metricMemberCount"), icon: FiUsers, getDisplayValue: (s) => formatNumber(G(s)?.totalMembers), getRawValue: (s) => G(s)?.totalMembers || 0 },
      { label: t("components.comparatorCharts.metricAvgScore"), icon: FiBarChart2, getDisplayValue: (s) => formatScore(G(s)?.averageScore), getRawValue: (s) => G(s)?.averageScore || 0 },
      { label: t("components.comparatorCharts.metricBestScore"), icon: FiAward, getDisplayValue: (s) => formatNumber(G(s)?.bestScore), getRawValue: (s) => G(s)?.bestScore || 0 },
      { label: t("components.comparatorCharts.metricTotalParticipations"), icon: FiTarget, getDisplayValue: (s) => formatNumber(G(s)?.totalScores), getRawValue: (s) => G(s)?.totalScores || 0 },
      { label: t("components.comparatorCharts.metricTotalPoints"), icon: FiTrendingUp, getDisplayValue: (s) => formatScore(G(s)?.totalPoints), getRawValue: (s) => G(s)?.totalPoints || 0 },
      { label: t("components.comparatorCharts.metricClearRate"), icon: FiCheckCircle, getDisplayValue: (s) => typeof G(s)?.clearRate === "number" ? `${G(s).clearRate}%` : "N/A", getRawValue: (s) => G(s)?.clearRate || 0, unit: "percent" },
    ];
  }, [t]);

  const weeklyRadarMetrics = useMemo<RadarMetricDef[]>(
    () => [
      {
        key: "weekTotal",
        label: t("components.comparatorCharts.weeklyTotal"),
        getRawValue: (s) => (s.weekTotal as number) || 0,
      },
      {
        key: "rotation1Score",
        label: t("components.comparatorCharts.weeklyRotation1"),
        getRawValue: (s) => (s.rotation1Score as number) || 0,
      },
      {
        key: "rotation2Score",
        label: t("components.comparatorCharts.weeklyRotation2"),
        getRawValue: (s) => (s.rotation2Score as number) || 0,
      },
    ],
    [t]
  );

  const weeklyTableMetrics = useMemo<TableMetricDef[]>(
    () => [
      {
        label: t("components.comparatorCharts.weeklyTotal"),
        icon: FiCalendar,
        getDisplayValue: (s) => formatScore((s.weekTotal as number) || 0),
        getRawValue: (s) => (s.weekTotal as number) || 0,
      },
      {
        label: t("components.comparatorCharts.weeklyRotation1"),
        icon: FiHash,
        getDisplayValue: (s) => formatScore((s.rotation1Score as number) || 0),
        getRawValue: (s) => (s.rotation1Score as number) || 0,
      },
      {
        label: t("components.comparatorCharts.weeklyRotation2"),
        icon: FiHash,
        getDisplayValue: (s) => formatScore((s.rotation2Score as number) || 0),
        getRawValue: (s) => (s.rotation2Score as number) || 0,
      },
    ],
    [t]
  );

  return {
    charRadarMetrics, charTableMetrics,
    playerRadarMetrics, guildRadarMetrics, playerTableMetrics, guildTableMetrics,
    weeklyRadarMetrics, weeklyTableMetrics,
  };
};
