export interface IRaffleMonth {
  key: string;
  start_date: string;
  end_date: string;
  in_progress: boolean;
  finished: boolean;
}

export interface IRaffleOverview {
  guild_ids: string[];
  prize: string;
  max_tickets: number;
  guilds: { _id: string; name: string }[];
  months: IRaffleMonth[];
}

export type RaffleRank = 'S' | 'A1' | 'A2';

export interface IRaffleBreakdown {
  top5_rotations: number;
  top5_month: number;
  homogeneity: number;
  seniority: number;
  rank: number;
  collective_gap: number;
  farm: number;
  qg: number;
  bonus: number;
}

export interface IRafflePlayer {
  bbs_id: string;
  bbs_name: string | null;
  rotations_played: number;
  // Average of the month, null below half of the rotations
  month_average: number | null;
  worst_gap: number | null;
  years: number;
  breakdown: IRaffleBreakdown;
  farm_periods: number[];
  qg_periods: number[];
  bonuses: { _id: string; label: string; count: number }[];
  earned: number;
  tickets: number;
  discord_id: string | null;
  avatar: string | null;
  global_name: string | null;
  first_seen: string | null;
  schrift_since: string | null;
}

export interface IRaffleExtreme {
  bbs_id: string;
  bbs_name: string | null;
  average: number;
}

export interface IRaffleDraw {
  winner: { bbs_id: string; bbs_name: string | null; discord_id: string | null; tickets: number };
  ticket_number: number;
  total_tickets: number;
  prize: string;
  entrants: { bbs_id: string; bbs_name: string | null; tickets: number }[];
  drawn_at: string;
  drawn_by: { discord_id: string | null; name: string | null };
}

export interface IGuildRaffle {
  month: IRaffleMonth;
  guild: { _id: string; name: string };
  prize: string;
  max_tickets: number;
  rules: {
    rotationTop: number;
    maxRotationTopTickets: number;
    monthTop: number;
    homogeneityFull: number;
    homogeneityHalf: number;
    maxSeniorityTickets: number;
    collectiveGap: number;
    periods: number;
    ranks: RaffleRank[];
    maxRankTickets: number;
  };
  rank: RaffleRank;
  rank_tickets: number;
  draw: IRaffleDraw | null;
  rotations: number;
  collective_gap: number | null;
  // Best and worst monthly averages, the collective gap is measured between them
  collective_extremes: { best: IRaffleExtreme; worst: IRaffleExtreme } | null;
  total_tickets: number;
  players: IRafflePlayer[];
}
