// Palette de couleurs Chakra assignées par index de guilde, partagée par l'onglet Draft et la
// proposition de draft pour garder le même code couleur par guilde.
export const GUILD_COLORS = ["purple", "blue", "teal", "green", "orange", "pink", "cyan", "red"] as const;
export type GuildColor = typeof GUILD_COLORS[number];

export const getGuildColor = (index: number): GuildColor =>
  GUILD_COLORS[index % GUILD_COLORS.length];
