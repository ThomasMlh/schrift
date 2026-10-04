import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, invalidateKeys, apiUrl } from '@/utils/apiRequest';
import type { IScoreFormData } from '@/interfaces';

export const useScoreMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const createScore = async (scoreData: IScoreFormData) => {
    const result = await request(`${apiUrl}/api/scores`, {
      method: 'POST',
      body: JSON.stringify(scoreData),
    }, { fallbackError: 'Erreur lors de la création du score' });
    await invalidateKeys(`${apiUrl}/api/scores`);
    return result;
  };

  const updateScore = async (scoreId: string, scoreData: Partial<IScoreFormData>) => {
    const result = await request(`${apiUrl}/api/scores/${scoreId}`, {
      method: 'PUT',
      body: JSON.stringify(scoreData),
    }, { fallbackError: 'Erreur lors de la mise à jour du score' });
    await invalidateKeys(`${apiUrl}/api/scores`);
    return result;
  };

  const deleteScore = async (scoreId: string) => {
    await request(`${apiUrl}/api/scores/${scoreId}`, {
      method: 'DELETE',
    }, { fallbackError: 'Erreur lors de la suppression du score' });
    await invalidateKeys(`${apiUrl}/api/scores`);
    return true;
  };

  // Marque un score signalé "à vérifier" comme correct (il réapparaît si sa valeur change)
  const reviewScoreAnomaly = async (scoreId: string) => {
    await request(`${apiUrl}/api/scores/${scoreId}/anomaly-review`, {
      method: 'POST',
    }, { fallbackError: 'Erreur lors de la validation du score' });
    await invalidateKeys(`${apiUrl}/api/scores`);
    return true;
  };

  const createBulkScores = async (scoresData: IScoreFormData[]) => {
    const result = await request(`${apiUrl}/api/scores/bulk`, {
      method: 'POST',
      body: JSON.stringify(scoresData),
    }, { fallbackError: 'Erreur lors de la création des scores' });
    await invalidateKeys(`${apiUrl}/api/scores`);
    return result;
  };

  // Réattribue un score existant à un autre compte bbs — contrairement à updateScore, le compte
  // cible n'a pas besoin d'appartenir à la guilde actuelle du score (cf. commentaire de la route).
  const transferScoreAccount = async (scoreId: string, params: { target_user_id: string; target_bbs_id: string }) => {
    const result = await request(`${apiUrl}/api/scores/${scoreId}/transfer-account`, {
      method: 'PUT',
      body: JSON.stringify(params),
    }, { fallbackError: 'Erreur lors du transfert du score' });
    await invalidateKeys(`${apiUrl}/api/scores`);
    return result;
  };

  const transferRotation = async (params: {
    cycle_id: string;
    source_rotation_id: string;
    target_rotation_id: string;
    guild_id?: string;
    dry_run?: boolean;
  }) => {
    const data = await request(`${apiUrl}/api/scores/transfer-rotation`, {
      method: 'POST',
      body: JSON.stringify(params),
    }, { fallbackError: 'Erreur lors du transfert', attachDataToError: true });
    if (!params.dry_run) {
      await invalidateKeys(`${apiUrl}/api/scores`);
    }
    return data;
  };

  return { createScore, updateScore, deleteScore, createBulkScores, transferRotation, transferScoreAccount, reviewScoreAnomaly };
};
