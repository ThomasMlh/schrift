import { useMemo } from 'react';
import useSWR from 'swr';
import type {
  IAttemptState, ISiteEvent, IPublicEvent, IQuiz, IQuizAttemptDetail, IQuizAttemptRow, IQuizMedia, IQuizResults, QuizAnswer,
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

// Player actions; each returns the new state of the attempt
export const useQuizPlay = (quizId?: string) => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);
  return useMemo(() => {
    const url = `${EVENTS}/quizzes/${quizId}/attempt`;
    return {
      start: () => request<IAttemptState>(url, { method: 'POST' }),
      state: () => request<IAttemptState>(url),
      answer: (questionId: string, answer: QuizAnswer) =>
        request<IAttemptState>(`${url}/answer`, { method: 'POST', body: JSON.stringify({ question_id: questionId, answer }) }),
    };
  }, [quizId, request]);
};

// ---------- Admin ----------

const useAdminList = <T>(url: string | null) => {
  const fetcher = useAuthenticatedFetcher();
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: T }>(url, fetcher, { revalidateOnFocus: false });
  return { data: data?.data, isLoading, error: error as Error | undefined, mutate };
};

export const useAdminEvents = () => useAdminList<ISiteEvent[]>(ADMIN);
export const useAdminEventQuizzes = (eventId?: string) => useAdminList<IQuiz[]>(eventId ? `${ADMIN}/${eventId}/quizzes` : null);
export const useEventMedia = (eventId?: string) => useAdminList<IQuizMedia[]>(eventId ? `${ADMIN}/${eventId}/media` : null);
export const useQuizAttempts = (quizId?: string) => useAdminList<IQuizAttemptRow[]>(quizId ? `${ADMIN}/quizzes/${quizId}/attempts` : null);
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
    };
  }, [request]);
};
