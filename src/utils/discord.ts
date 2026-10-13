
/**
 * Discord avatar URL from the user id and avatar hash, or null without a hash
 */
export const getDiscordAvatarUrl = (userId: string, avatarHash: string, size: number = 128): string | null => {
  if (!avatarHash || !userId) return null;
  
  const format = avatarHash.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${format}?size=${size}`;
};

/**
 * Discord banner URL from the user id and banner hash, or null without a hash
 */
export const getDiscordBannerUrl = (userId: string, bannerHash: string, size: number = 512): string | null => {
  if (!bannerHash || !userId) return null;
  
  const format = bannerHash.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/banners/${userId}/${bannerHash}.${format}?size=${size}`;
};

/**
 * Avatar URL of a user object, or null
 */
export const getUserAvatarUrl = (user: { discord_id?: string; avatar?: string }, size: number = 128): string | null => {
  const discordId = user.discord_id;
  const avatarHash = user.avatar;
  
  if (!discordId || !avatarHash) return null;
  
  return getDiscordAvatarUrl(discordId, avatarHash, size);
};