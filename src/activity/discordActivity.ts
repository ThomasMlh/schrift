import { DiscordSDK, patchUrlMappings } from '@discord/embedded-app-sdk';

const BUCKET_HOST = 'bucket.bbs-schrift.fr';

const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID as string;

/**
 * Discord ajoute `frame_id` à l'URL uniquement quand la page est chargée dans
 * l'iframe d'une Activity. En navigation web normale, ce paramètre est absent.
 */
export const isDiscordActivity = (): boolean =>
  new URLSearchParams(window.location.search).has('frame_id');

// Le constructeur de DiscordSDK lit `frame_id` dans l'URL et lève une erreur s'il est
// absent : il ne doit donc JAMAIS être instancié en navigation web normale, seulement
// une fois qu'on sait déjà être dans l'iframe Activity (isDiscordActivity() === true).
let discordSdk: DiscordSDK | null = null;
const getDiscordSdk = (): DiscordSDK => {
  if (!discordSdk) {
    discordSdk = new DiscordSDK(CLIENT_ID);
  }
  return discordSdk;
};

/**
 * Handshake + authentification automatique pour le contexte Discord Activity.
 * À appeler uniquement quand isDiscordActivity() est vrai.
 */
export async function setupDiscordActivity(
  login: (token: string, refreshToken?: string) => void
): Promise<void> {
  // Les <img src="https://bucket.bbs-schrift.fr/...">, absolus et cross-origin, sont
  // bloqués dans l'iframe Activity. On les réécrit à la volée vers /.proxy/bucket/...
  // (le préfixe "/bucket" côté portail doit exister comme mapping de chemin de proxy,
  // cible bucket.bbs-schrift.fr) pour qu'ils passent par le proxy Discord.
  patchUrlMappings([{ prefix: '/.proxy/bucket', target: BUCKET_HOST }], {
    patchFetch: false,
    patchWebSocket: false,
    patchXhr: false,
    patchSrcAttributes: true,
  });

  const discordSdk = getDiscordSdk();
  await discordSdk.ready();

  const { code } = await discordSdk.commands.authorize({
    client_id: CLIENT_ID,
    response_type: 'code',
    state: '',
    prompt: 'none',
    // Mêmes scopes que le flow web classique (voir schrift-api src/routes/auth.js)
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
}
