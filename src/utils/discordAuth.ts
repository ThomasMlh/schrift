// Redirige vers l'autorisation Discord ; la page actuelle est rouverte après la connexion
export const startDiscordLogin = () => {
  const discordClientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI || `${window.location.origin}/discord-callback`;

  // State anti-CSRF vérifié au retour sur /discord-callback
  const state = crypto.randomUUID();
  sessionStorage.setItem("oauth_state", state);

  const encodedRedirectUri = encodeURIComponent(redirectUri);
  const scope = encodeURIComponent("identify guilds guilds.members.read");
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${scope}&state=${state}`;

  sessionStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);

  window.location.href = discordAuthUrl;
};
