import { mutate } from 'swr';
import { isDiscordActivity } from '../activity/discordActivity';

// En Discord Activity, tout fetch cross-origin doit passer par le proxy Discord
// (préfixe /.proxy/<mapping configuré dans le portail>) au lieu de l'URL absolue.
export const apiUrl = isDiscordActivity() ? '/.proxy' : (import.meta.env.VITE_API_BASE_URL as string);

// Même logique pour les images du bucket. Construire l'URL correcte dès le départ (plutôt
// que de réécrire les <img src> après coup) est nécessaire car certains composants (Chakra
// Avatar notamment) précherchent l'image via un `new Image()` détaché du DOM avant de
// l'afficher : une réécriture basée sur un MutationObserver ne verrait jamais cette requête.
export const bucketUrl = isDiscordActivity() ? '/.proxy/bucket' : (import.meta.env.VITE_BUCKET_URL as string);

/**
 * Crée une fonction de requête authentifiée liée au token courant.
 * À appeler avec useMemo(() => makeRequest(token), [token]) dans chaque hook.
 */
export const makeRequest =
  (token: string | null) =>
  async <T = unknown>(
    url: string,
    init: RequestInit = {},
    opts: { fallbackError?: string; attachDataToError?: boolean } = {}
  ): Promise<T> => {
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    if (init.body !== undefined) headers['Content-Type'] = 'application/json';

    const res = await fetch(url, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const err = new Error((data.message as string) || opts.fallbackError || 'Erreur');
      if (opts.attachDataToError) Object.assign(err, { data });
      throw err;
    }
    return data as T;
  };

/** Invalide tous les caches SWR dont la clé commence par l'un des préfixes. */
export const invalidateKeys = (...prefixes: string[]) =>
  mutate((key) => typeof key === 'string' && prefixes.some((p) => key.startsWith(p)));
