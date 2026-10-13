import type { TableEntityDef, TableMetricDef } from "./ComparisonDataTable";

// Best value of a metric among the entities that have stats
export const getBestValue = (entities: TableEntityDef[], metric: TableMetricDef): number | null => {
  const values = entities.filter((e) => e.stats).map((e) => metric.getRawValue(e.stats));
  if (!values.length) return null;
  return metric.inverse ? Math.min(...values) : Math.max(...values);
};
