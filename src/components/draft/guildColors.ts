// Chakra color palette assigned by guild index, shared by the Draft tab and the draft proposal
// so each guild keeps the same color.
export const GUILD_COLORS = ["purple", "blue", "teal", "green", "orange", "pink", "cyan", "red"] as const;
export type GuildColor = typeof GUILD_COLORS[number];

export const getGuildColor = (index: number): GuildColor =>
  GUILD_COLORS[index % GUILD_COLORS.length];
