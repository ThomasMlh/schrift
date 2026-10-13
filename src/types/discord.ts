// Discord channels, members and emojis (messaging from the site)

export interface IDiscordChannelMember {
  id: string;
  username: string;
  display_name: string;
}

export interface IDiscordChannel {
  id: string;
  name: string;
  guild_id: string;
  guild_name: string;
  category: string | null; // Discord category name; null when the channel has none
  members: IDiscordChannelMember[];
}

export interface IDiscordEmoji {
  id: string;
  name: string;
  animated: boolean;
  url: string;
  guild_id: string; // Discord server the emoji belongs to
}
