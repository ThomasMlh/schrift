import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, invalidateKeys, apiUrl } from '@/utils/apiRequest';

interface BuildTeamMember {
  id_character: string;
  position: number;
  links?: Array<{ id_character: string }>;
}

export const useBuildMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const createBuild = async (buildData: {
    rotation_id: string;
    description?: string;
    team: BuildTeamMember[];
  }) => {
    const result = await request(`${apiUrl}/api/builds`, {
      method: 'POST',
      body: JSON.stringify(buildData),
    }, { fallbackError: 'Erreur lors de la création du build' });
    await invalidateKeys(`${apiUrl}/api/builds`);
    return result;
  };

  const updateBuild = async (buildId: string, buildData: {
    rotation_id?: string;
    description?: string;
    team?: BuildTeamMember[];
  }) => {
    const result = await request(`${apiUrl}/api/builds/${buildId}`, {
      method: 'PATCH',
      body: JSON.stringify(buildData),
    }, { fallbackError: 'Erreur lors de la mise à jour du build' });
    await invalidateKeys(`${apiUrl}/api/builds`);
    return result;
  };

  const validateBuild = async (buildId: string, isValid: boolean) => {
    const result = await request(`${apiUrl}/api/builds/${buildId}/validate`, {
      method: 'PATCH',
      body: JSON.stringify({ isValid }),
    }, { fallbackError: 'Erreur lors de la validation du build' });
    await invalidateKeys(`${apiUrl}/api/builds`);
    return result;
  };

  const deleteBuild = async (buildId: string) => {
    await request(`${apiUrl}/api/builds/${buildId}`, {
      method: 'DELETE',
    }, { fallbackError: 'Erreur lors de la suppression du build' });
    await invalidateKeys(`${apiUrl}/api/builds`);
    return true;
  };

  return { createBuild, updateBuild, validateBuild, deleteBuild };
};
