import { mutate } from 'swr';
import { isDiscordActivity } from '../activity/discordActivity';

// In a Discord Activity, every cross-origin fetch must go through the Discord proxy
// (/.proxy/<mapping configured in the developer portal>) instead of the absolute URL.
export const apiUrl = isDiscordActivity() ? '/.proxy' : (import.meta.env.VITE_API_BASE_URL as string);

// Same for bucket images. The URL must be right from the start (rather than rewriting <img src>
// afterwards) because some components (notably Chakra Avatar) preload the image through a detached
// `new Image()`: a MutationObserver-based rewrite would never see that request.
export const bucketUrl = isDiscordActivity() ? '/.proxy/bucket' : (import.meta.env.VITE_BUCKET_URL as string);

/**
 * Creates an authenticated request function bound to the current token.
 * Call it with useMemo(() => makeRequest(token), [token]) in each hook.
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

/** Invalidates every SWR cache whose key starts with one of the prefixes. */
export const invalidateKeys = (...prefixes: string[]) =>
  mutate((key) => typeof key === 'string' && prefixes.some((p) => key.startsWith(p)));
