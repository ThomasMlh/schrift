/**
 * Utilitaires pour la gestion des avatars Discord
 */

/**
 * Construit l'URL de l'avatar Discord à partir de l'ID utilisateur et du hash de l'avatar
 * @param userId - L'ID Discord de l'utilisateur
 * @param avatarHash - Le hash de l'avatar Discord
 * @param size - La taille souhaitée de l'avatar (par défaut: 128)
 * @returns L'URL complète de l'avatar ou null si pas de hash
 */
export const getDiscordAvatarUrl = (userId: string, avatarHash: string, size: number = 128): string | null => {
  if (!avatarHash || !userId) return null;
  
  const format = avatarHash.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${format}?size=${size}`;
};

/**
 * Obtient l'URL de l'avatar à partir d'un objet utilisateur
 * @param user - L'objet utilisateur contenant discord_id et avatar
 * @param size - La taille souhaitée de l'avatar (par défaut: 128)
 * @returns L'URL de l'avatar ou null
 */
export const getUserAvatarUrl = (user: { discord_id?: string; avatar?: string }, size: number = 128): string | null => {
  const discordId = user.discord_id;
  const avatarHash = user.avatar;
  
  if (!discordId || !avatarHash) return null;
  
  return getDiscordAvatarUrl(discordId, avatarHash, size);
};