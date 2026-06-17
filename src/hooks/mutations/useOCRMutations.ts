import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, invalidateKeys, apiUrl } from '@/utils/apiRequest';

export const useOCRMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const processOCRBatch = async (params: {
    guild_id: string;
    cycle_id: string;
    rotation_id: string;
    screenshotter_id: string;
    screenshots: Array<{ data: string; filename: string }>;
  }) => {
    const data = await request(`${apiUrl}/api/ocr/batch-guild-ranking`, {
      method: 'POST',
      body: JSON.stringify(params),
    }, { fallbackError: 'Erreur HTTP lors du traitement OCR' });
    if (!(data as { success: boolean; message?: string }).success) throw new Error((data as { message?: string }).message || 'Erreur OCR');
    return data;
  };

  const submitOCRBatch = async (params: {
    guild_id: string;
    cycle_id: string;
    rotation_id: string;
    scores: Array<{ user_id: string; raw_score: number; screenshot_index: number }>;
  }) => {
    const data = await request(`${apiUrl}/api/ocr/submit-batch`, {
      method: 'POST',
      body: JSON.stringify(params),
    }, { fallbackError: 'Erreur lors de la soumission' });
    if (!(data as { success: boolean; message?: string }).success) throw new Error((data as { message?: string }).message || 'Erreur soumission');
    await invalidateKeys(`${apiUrl}/api/scores`);
    return data;
  };

  const visualizeOCRZones = async (params: {
    screenshot: { data: string; filename: string };
    screenshotter_id: string;
  }) => {
    return request(`${apiUrl}/api/ocr/debug/visualize-zones`, {
      method: 'POST',
      body: JSON.stringify(params),
    }, { fallbackError: 'Erreur visualisation' });
  };

  return { processOCRBatch, submitOCRBatch, visualizeOCRZones };
};
