// Comparateur

// Interfaces pour le comparateur
export interface IComparisonStats {
  averageScore: number;
  averageRawScore: number;
  totalScores: number;
  maxScore: number;
  minScore: number;
  maxRawScore: number;
  minRawScore: number;
}

export interface IComparisonEntityInfo {
  _id?: string;
  global_name?: string;
  bbs_name?: string;
  discord_id?: string;
  avatar?: string;
  name?: string;
  description?: string;
}

export interface IComparisonEntity {
  entityInfo: IComparisonEntityInfo | null;
  stats: IComparisonStats;
}

export interface IComparisonDifferences {
  averageScore: {
    difference: number;
    percentage: number | null;
  };
  averageRawScore: {
    difference: number;
    percentage: number | null;
  };
  totalScores: {
    difference: number;
    percentage: number | null;
  };
}

export interface IComparisonSummary {
  entity1: {
    id: string;
    averageScore: number;
    totalScores: number;
  };
  entity2: {
    id: string;
    averageScore: number;
    totalScores: number;
  };
}

export interface IComparisonResult {
  entities: {
    [entityId: string]: IComparisonEntity;
  };
  differences: IComparisonDifferences;
  winner: string | null;
  summary: IComparisonSummary;
}

export interface IComparisonFilters {
  type: "players" | "guilds";
  entity1: string;
  entity2: string;
  cycle_id: string | null;
  rotation_id: string | null;
}

export interface IComparisonMeta {
  comparisonType: "players" | "guilds";
  hasFilters: boolean;
  scopeDescription: string;
}

export interface IComparisonResponse {
  success: boolean;
  comparison: IComparisonResult;
  filters: IComparisonFilters;
}
