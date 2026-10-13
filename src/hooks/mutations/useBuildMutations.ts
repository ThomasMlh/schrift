import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { makeRequest, invalidateKeys, apiUrl } from '@/utils/apiRequest';

interface BuildTeamMember {
  id_character: string;
  position: number;
  links?: Array<{ id_character: string }>;
}

// Optional build result; null clears the value
interface BuildResult {
  score?: number | null;
  time_normal_wave?: number | null;
  time_extra_wave?: number | null;
}

export const useBuildMutations = () => {
  const { token } = useAuth();
  const request = useMemo(() => makeRequest(token), [token]);

  const createBuild = async (buildData: {
    rotation_id: string;
    description?: string;
    team: BuildTeamMember[];
  } & BuildResult) => {
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
  } & BuildResult) => {
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

  // Screenshot: data URL image, converted and stored on the bucket by the API
  const uploadBuildScreenshot = async (buildId: string, image: string) => {
    const result = await request<{ success: boolean; screenshot: string }>(`${apiUrl}/api/builds/${buildId}/screenshot`, {
      method: 'POST',
      body: JSON.stringify({ image }),
    }, { fallbackError: "Erreur lors de l'envoi de la capture" });
    await invalidateKeys(`${apiUrl}/api/builds`);
    return result;
  };

  const deleteBuildScreenshot = async (buildId: string) => {
    await request(`${apiUrl}/api/builds/${buildId}/screenshot`, {
      method: 'DELETE',
    }, { fallbackError: 'Erreur lors de la suppression de la capture' });
    await invalidateKeys(`${apiUrl}/api/builds`);
    return true;
  };

  return { createBuild, updateBuild, validateBuild, deleteBuild, uploadBuildScreenshot, deleteBuildScreenshot };
};
