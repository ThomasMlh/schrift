import { mutate } from 'swr';
import { isDiscordActivity } from '../activity/discordActivity';

// En Discord Activity, tout fetch cross-origin doit passer par le proxy Discord
// (préfixe /.proxy/<mapping configuré dans le portail>) au lieu de l'URL absolue.
export const apiUrl = isDiscordActivity() ? '/.proxy' : (import.meta.env.VITE_API_BASE_URL as string);

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
