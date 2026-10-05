// Salons, membres et emojis Discord (messagerie depuis le site)

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
  category: string | null; // nom de la catégorie Discord ; null si le salon n'en a pas
  members: IDiscordChannelMember[];
}

export interface IDiscordEmoji {
  id: string;
  name: string;
  animated: boolean;
  url: string;
  guild_id: string; // serveur Discord auquel appartient l'emoji
}
