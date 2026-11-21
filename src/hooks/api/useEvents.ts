import { useMemo } from 'react';
import useSWR from 'swr';
import type {
  IAdventAdmin, IAdventAnswer, IAdventCalendar, IAdventCase, IAdventCharacter, IAdventDay, IAttemptState, ISiteEvent, IPublicEvent,
  IGoalProgress, IHuntAdmin, IHuntSpot, IHuntTarget, ILiveEvent, IQuiz, IQuizAttemptDetail, IQuizAttemptRow, IQuizMedia, IQuizResults, QuizAnswer,
} from '../../interfaces';
import { useAuth } from '../../providers/AuthProvider';
import { invalidateKeys, makeRequest } from '../../utils/apiRequest';
import { apiUrl, useAuthenticatedFetcher } from './shared';

const EVENTS = `${apiUrl}/api/events`;
const ADMIN = `${apiUrl}/api/admin/events`;

// Latest anniversary event, with the logged-in player's state on each quiz
export const useCurrentEvent = (kind = 'anniversary') => {
  const fetcher = useAuthenticatedFetcher();
  const { data, error, isLoading, mutate } = useSWR<IPublicEvent & { success: boolean }>(
    `${EVENTS}/current?kind=${kind}`, fetcher, { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  return { data: data ?? null, isLoading, error: error as Error | undefined, mutate };
};

export const useQuizResults = (quizId?: string, enabled = true) => {
  const fetcher = useAuthenticatedFetcher();
  const { data, error, isLoading } = useSWR<IQuizResults & { success: boolean }>(
    quizId && enabled ? `${EVENTS}/quizzes/${quizId}/results` : null, fetcher, { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  return { results: data ?? null, isLoading, error: error as Error | undefined };
};

// Player actions; each returns the new state of the attempt. `test`: an admin rehearsal, never ranked
export const useQuizPlay = (quizId?: string, test = false) => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);
  return useMemo(() => {
    const url = test ? `${ADMIN}/quizzes/${quizId}/test` : `${EVENTS}/quizzes/${quizId}/attempt`;
    return {
      start: () => request<IAttemptState>(url, { method: 'POST' }),
      state: () => request<IAttemptState>(url),
      answer: (questionId: string, answer: QuizAnswer) =>
        request<IAttemptState>(`${url}/answer`, { method: 'POST', body: JSON.stringify({ question_id: questionId, answer }) }),
      // Correction of a rehearsal
      result: async () => (await request<{ data: IQuizAttemptDetail }>(`${url}/result`)).data,
    };
  }, [quizId, test, request]);
};

// Advent calendar of an event, with the player's answers when logged in
export const useAdventCalendar = (eventId?: string) => {
  const fetcher = useAuthenticatedFetcher();
  const { data, error, isLoading, mutate } = useSWR<IAdventCalendar & { success: boolean }>(
    eventId ? `${EVENTS}/${eventId}/advent` : null, fetcher, { revalidateOnFocus: true, shouldRetryOnError: false },
  );
  return { data: data ?? null, isLoading, error: error as Error | undefined, mutate };
};

export const useAdventAnswer = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);
  return useMemo(() => async (eventId: string, day: number, answer: string) => {
    const result = await request<{ data: NonNullable<IAdventDay['mine']> }>(`${EVENTS}/${eventId}/advent/${day}/answer`, {
      method: 'POST', body: JSON.stringify({ answer }),
    });
    await invalidateKeys(EVENTS);
    return result.data;
  }, [request]);
};

// Running event, read by every page: decor, framed avatars, gift hunt
export const useLiveEvent = () => {
  const fetcher = useAuthenticatedFetcher();
  const { data } = useSWR<{ success: boolean; data: ILiveEvent | null }>(
    `${EVENTS}/live`, fetcher, { revalidateOnFocus: false, shouldRetryOnError: false, refreshInterval: 5 * 60 * 1000 },
  );
  return data?.data ?? null;
};

export const useGiftHunt = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);
  return useMemo(() => ({
    check: async (path: string) =>
      (await request<{ data: { gift: boolean } }>(`${EVENTS}/hunt/check`, { method: 'POST', body: JSON.stringify({ path }) })).data,
    claim: async (path: string) => {
      const result = await request<{ data: { points: number; tickets: number; found: number; hunter_badge: boolean } }>(
        `${EVENTS}/hunt/claim`, { method: 'POST', body: JSON.stringify({ path }) },
      );
      await invalidateKeys(EVENTS);
      return result.data;
    },
  }), [request]);
};

// ---------- Admin ----------

const useAdminList = <T>(url: string | null) => {
  const fetcher = useAuthenticatedFetcher();
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: T }>(url, fetcher, { revalidateOnFocus: false });
  return { data: data?.data, isLoading, error: error as Error | undefined, mutate };
};

export const useAdminEvents = () => useAdminList<ISiteEvent[]>(ADMIN);
export const useAdminQuiz = (quizId?: string) => useAdminList<IQuiz>(quizId ? `${ADMIN}/quizzes/${quizId}` : null);
export const useAdminEventQuizzes = (eventId?: string) => useAdminList<IQuiz[]>(eventId ? `${ADMIN}/${eventId}/quizzes` : null);
export const useEventMedia = (eventId?: string) => useAdminList<IQuizMedia[]>(eventId ? `${ADMIN}/${eventId}/media` : null);
export const useQuizAttempts = (quizId?: string) => useAdminList<IQuizAttemptRow[]>(quizId ? `${ADMIN}/quizzes/${quizId}/attempts` : null);
export const useAdventCases = (eventId?: string) => useAdminList<IAdventAdmin>(eventId ? `${ADMIN}/${eventId}/advent` : null);
export const useAdventCaseAnswers = (eventId?: string, day?: number | null) =>
  useAdminList<IAdventAnswer[]>(eventId && day ? `${ADMIN}/${eventId}/advent/${day}/answers` : null);
export const useEventGoal = (eventId?: string) => useAdminList<IGoalProgress | null>(eventId ? `${ADMIN}/${eventId}/goal` : null);
export const useHuntSpots = (eventId?: string) => useAdminList<IHuntAdmin>(eventId ? `${ADMIN}/${eventId}/hunt` : null);
export const useAttemptDetail = (attemptId?: string | null) => useAdminList<IQuizAttemptDetail>(attemptId ? `${ADMIN}/attempts/${attemptId}` : null);

export const useEventAdminActions = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);
  return useMemo(() => {
    const send = async <T>(url: string, method: string, body?: unknown) => {
      const result = await request<{ data: T }>(url, { method, ...(body !== undefined && { body: JSON.stringify(body) }) });
      await invalidateKeys(ADMIN, EVENTS);
      return result.data;
    };
    return {
      saveEvent: (event: Partial<ISiteEvent>) => (event._id ? send<ISiteEvent>(`${ADMIN}/${event._id}`, 'PUT', event) : send<ISiteEvent>(ADMIN, 'POST', event)),
      deleteEvent: (id: string) => send(`${ADMIN}/${id}`, 'DELETE'),
      createQuiz: (eventId: string, title: string) => send<IQuiz>(`${ADMIN}/${eventId}/quizzes`, 'POST', { title }),
      saveQuiz: (quizId: string, changes: Partial<IQuiz>) => send<IQuiz>(`${ADMIN}/quizzes/${quizId}`, 'PUT', changes),
      deleteQuiz: (quizId: string) => send(`${ADMIN}/quizzes/${quizId}`, 'DELETE'),
      uploadImage: (eventId: string, name: string, data: string) => send<IQuizMedia>(`${ADMIN}/${eventId}/media/image`, 'POST', { name, data }),
      // Audio and video go in chunks: a request body stays under the 4.5 MB of the host
      uploadFile: async (eventId: string, kind: 'audio' | 'video', file: File, onProgress: (ratio: number) => void) => {
        const started = await request<{ data: IQuizMedia & { chunk_bytes: number } }>(`${ADMIN}/${eventId}/media/upload`, {
          method: 'POST', body: JSON.stringify({ kind, name: file.name, size: file.size, mime: file.type }),
        });
        const { _id: id, chunk_bytes: chunkBytes } = started.data;
        for (let index = 0, offset = 0; offset < file.size; index += 1, offset += chunkBytes) {
          const chunk = new Uint8Array(await file.slice(offset, offset + chunkBytes).arrayBuffer());
          let binary = '';
          for (let i = 0; i < chunk.length; i += 0x8000) binary += String.fromCharCode(...chunk.subarray(i, i + 0x8000));
          await request(`${ADMIN}/media/${id}/chunk`, { method: 'PUT', body: JSON.stringify({ index, data: btoa(binary) }) });
          onProgress(Math.min(1, (offset + chunk.length) / file.size));
        }
        await invalidateKeys(ADMIN);
      },
      deleteMedia: (id: string) => send(`${ADMIN}/media/${id}`, 'DELETE'),
      review: (attemptId: string, questionId: string, key: string, accept: boolean) =>
        send<IQuizAttemptDetail>(`${ADMIN}/attempts/${attemptId}/review`, 'POST', { question_id: questionId, key, accept }),
      deleteAttempt: (attemptId: string) => send(`${ADMIN}/attempts/${attemptId}`, 'DELETE'),
      saveAdventCase: (eventId: string, day: number, body: Pick<IAdventCase, 'character_id' | 'clue_type' | 'settings' | 'clue_text' | 'accepted'>) =>
        send<IAdventCase>(`${ADMIN}/${eventId}/advent/${day}`, 'PUT', body),
      deleteAdventCase: (eventId: string, day: number) => send(`${ADMIN}/${eventId}/advent/${day}`, 'DELETE'),
      reviewAdventAnswer: (answerId: string, accept: boolean) => send<IAdventAnswer>(`${ADMIN}/advent/answers/${answerId}/review`, 'POST', { accept }),
      saveHuntSpot: (eventId: string, day: number, body: { path: string; hint: string }) => send<IHuntSpot>(`${ADMIN}/${eventId}/hunt/${day}`, 'PUT', body),
      deleteHuntSpot: (eventId: string, day: number) => send(`${ADMIN}/${eventId}/hunt/${day}`, 'DELETE'),
      // Reads only: nothing to refresh
      randomHuntSpot: async (eventId: string) =>
        (await request<{ data: { path: string; hint: string; label: string; target: IHuntTarget } }>(`${ADMIN}/${eventId}/hunt/random`)).data,
      describeHuntPage: async (path: string) =>
        (await request<{ data: IHuntTarget }>(`${ADMIN}/hunt/preview?path=${encodeURIComponent(path)}`)).data,
      randomAdventCharacter: async (eventId: string) => (await request<{ data: IAdventCharacter }>(`${ADMIN}/${eventId}/advent/random`)).data,
      adventCharacterInfo: async (characterId: string) =>
        (await request<{ data: { accepted: string[]; quote: string | null; has_artwork: boolean } }>(`${ADMIN}/advent/characters/${characterId}`)).data,
    };
  }, [request]);
};
