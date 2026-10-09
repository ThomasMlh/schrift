import type { TableEntityDef, TableMetricDef } from "./ComparisonDataTable";

// Valeur la meilleure d'une métrique parmi les entités qui ont des stats
export const getBestValue = (entities: TableEntityDef[], metric: TableMetricDef): number | null => {
  const values = entities.filter((e) => e.stats).map((e) => metric.getRawValue(e.stats));
  if (!values.length) return null;
  return metric.inverse ? Math.min(...values) : Math.max(...values);
};
