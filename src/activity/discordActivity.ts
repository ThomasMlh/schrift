import { DiscordSDK } from '@discord/embedded-app-sdk';

const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID as string;

/**
 * Discord only adds `frame_id` to the URL when the page runs inside an Activity iframe.
 */
export const isDiscordActivity = (): boolean =>
  new URLSearchParams(window.location.search).has('frame_id');

// The DiscordSDK constructor reads `frame_id` from the URL and throws when it is missing,
// so it must only be created once isDiscordActivity() is true.
let discordSdk: DiscordSDK | null = null;
const getDiscordSdk = (): DiscordSDK => {
  if (!discordSdk) {
    discordSdk = new DiscordSDK(CLIENT_ID);
  }
  return discordSdk;
};

/**
 * Runs the handshake and authentication for the Discord Activity context.
 * Only call when isDiscordActivity() is true.
 */
export const setupDiscordActivity = async (
  login: (token: string, refreshToken?: string) => void
): Promise<void> => {
  const discordSdk = getDiscordSdk();
  await discordSdk.ready();

  const { code } = await discordSdk.commands.authorize({
    client_id: CLIENT_ID,
    response_type: 'code',
    state: '',
    prompt: 'none',
    // Same scopes as the web OAuth flow (see schrift-api src/routes/auth.js)
    scope: ['identify', 'guilds', 'connections'],
  });

  const response = await fetch('/.proxy/api/auth/discord/activity-callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Échec de l'authentification Discord Activity");
  }

  await discordSdk.commands.authenticate({ access_token: data.discord_access_token });

  login(data.token, data.refreshToken);
};
