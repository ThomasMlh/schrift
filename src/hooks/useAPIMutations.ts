import { mutate } from 'swr';
import type { ICycle, IGuild, IScoreFormData, Role } from '../interfaces';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

/**
 * Fonctions utilitaires pour les mutations de données
 * Ces fonctions permettent de mettre à jour le cache local immédiatement
 * et de synchroniser avec le serveur en arrière-plan
 */

// Fonction pour créer un cycle
export const createCycle = async (cycleData: Partial<ICycle>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/api/cycles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(cycleData),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la création du cycle');
  }

  const newCycle = await response.json();

  // Invalider le cache pour forcer un rechargement
  await mutate(`${apiUrl}/api/cycles`);
  
  return newCycle;
}

// Fonction pour mettre à jour un cycle
export const updateCycle = async (cycleId: string, cycleData: Partial<ICycle>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/api/cycles/${cycleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(cycleData),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour du cycle');
  }

  const updatedCycle = await response.json();

  // Invalider le cache pour les cycles et le cycle spécifique
  await mutate(`${apiUrl}/api/cycles`);
  await mutate(`${apiUrl}/api/cycles/${cycleId}`);
  
  return updatedCycle;
}

// Fonction pour supprimer un cycle
export const deleteCycle = async (cycleId: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/api/cycles/${cycleId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la suppression du cycle');
  }

  // Invalider le cache pour forcer un rechargement
  await mutate(`${apiUrl}/api/cycles`);
  
  return true;
}

// Fonction pour créer une guilde
export const createGuild = async (guildData: Partial<IGuild>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/api/guildes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(guildData),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la création de la guilde');
  }

  const newGuild = await response.json();

  // Invalider le cache pour forcer un rechargement
  await mutate(`${apiUrl}/api/guildes`);
  
  return newGuild;
}

// Fonction pour mettre à jour une guilde
export const updateGuild = async (guildId: string, guildData: Partial<IGuild>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/api/guildes/${guildId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(guildData),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour de la guilde');
  }

  const updatedGuild = await response.json();

  // Invalider le cache pour forcer un rechargement
  await mutate(`${apiUrl}/api/guildes`);
  
  return updatedGuild;
}

// Fonction pour assigner un utilisateur à une guilde avec mutation optimiste
export const assignUserToGuild = async (guildId: string, userId: string) => {
  const token = localStorage.getItem('token');
  
  // Mutation optimiste : mettre à jour le cache localement avant la réponse du serveur
  const membersKey = `${apiUrl}/api/guildes/${guildId}/membres`;
  
  // Envoyer la requête au serveur
  const response = await fetch(`${apiUrl}/api/guildes/${guildId}/assign-member`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    // En cas d'erreur, le cache sera automatiquement revalidé
    throw new Error('Erreur lors de l\'assignation de l\'utilisateur');
  }

  const result = await response.json();

  // Invalider les caches concernés
  await mutate(membersKey);
  await mutate(`${apiUrl}/api/users`);
  
  return result;
}

// Fonction pour changer le rôle d'un utilisateur
export const updateUserRole = async (userId: string, newRole: Role) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`${apiUrl}/api/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ role: newRole }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la modification du rôle');
  }

  const result = await response.json();

  // Invalider les caches pour les utilisateurs et les guildes
  await mutate((key) => typeof key === 'string' && (
    key.startsWith(`${apiUrl}/api/users`) || 
    key.startsWith(`${apiUrl}/api/guildes`)
  ));
  
  return result;
}

// Fonction pour déplacer un utilisateur vers une autre guilde
export const moveUserToGuild = async (userId: string, newGuildId: string) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`${apiUrl}/api/users/${userId}/guild`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ guildeId: newGuildId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors du déplacement du membre');
  }

  const result = await response.json();

  // Invalider les caches pour les utilisateurs et les guildes
  await mutate((key) => typeof key === 'string' && (
    key.startsWith(`${apiUrl}/api/users`) || 
    key.startsWith(`${apiUrl}/api/guildes`)
  ));
  
  return result;
}

// Fonction pour supprimer un membre d'une guilde
export const removeGuildMember = async (guildId: string, userId: string) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`${apiUrl}/api/guildes/${guildId}/membres/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la suppression du membre');
  }

  const result = await response.json();

  // Invalider les caches pour les utilisateurs et les guildes
  await mutate((key) => typeof key === 'string' && (
    key.startsWith(`${apiUrl}/api/users`) || 
    key.startsWith(`${apiUrl}/api/guildes`)
  ));
  
  return result;
}

// Fonction pour créer un score
export const createScore = async (scoreData: IScoreFormData) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`${apiUrl}/api/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(scoreData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la création du score');
  }

  const newScore = await response.json();

  // Invalider le cache des scores
  await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/scores`));
  
  return newScore;
}

// Fonction pour mettre à jour un score
export const updateScore = async (scoreId: string, scoreData: Partial<IScoreFormData>) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`${apiUrl}/api/scores/${scoreId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(scoreData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la mise à jour du score');
  }

  const updatedScore = await response.json();

  // Invalider le cache des scores
  await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/scores`));
  
  return updatedScore;
}

// Fonction pour supprimer un score
export const deleteScore = async (scoreId: string) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`${apiUrl}/api/scores/${scoreId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la suppression du score');
  }

  // Invalider le cache des scores
  await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/scores`));
  
  return true;
}

// Fonction pour créer des scores en bulk
export const createBulkScores = async (scoresData: IScoreFormData[]) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`${apiUrl}/api/scores/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(scoresData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la création des scores');
  }

  const result = await response.json();

  // Invalider le cache des scores
  await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/scores`));
  
  return result;
}

// Fonction pour créer un build
export const createBuild = async (buildData: {
  rotation_id: string;
  description?: string;
  team: Array<{
    id_character: string;
    position: number;
    links?: Array<{ id_character: string }>;
  }>;
}) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`${apiUrl}/api/builds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(buildData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la création du build');
  }

  const newBuild = await response.json();

  // Invalider le cache des builds
  await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/builds`));
  
  return newBuild;
}

// Fonction pour mettre à jour un build
export const updateBuild = async (buildId: string, buildData: {
  rotation_id?: string;
  description?: string;
  team?: Array<{
    id_character: string;
    position: number;
    links?: Array<{ id_character: string }>;
  }>;
}) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`${apiUrl}/api/builds/${buildId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(buildData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la mise à jour du build');
  }

  const updatedBuild = await response.json();

  // Invalider le cache des builds
  await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/builds`));
  
  return updatedBuild;
}

// Fonction pour valider/invalider un build (admin only)
export const validateBuild = async (buildId: string, isValid: boolean) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`${apiUrl}/api/builds/${buildId}/validate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ isValid }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la validation du build');
  }

  const result = await response.json();

  // Invalider le cache des builds
  await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/builds`));
  
  return result;
}

// Fonction pour supprimer un build
export const deleteBuild = async (buildId: string) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`${apiUrl}/api/builds/${buildId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la suppression du build');
  }

  // Invalider le cache des builds
  await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/builds`));
  
  return true;
}

/**
 * Exemple d'utilisation dans un composant :
 * 
 * ```tsx
 * import { useCycles } from '@/hooks/useAPI';
 * import { createCycle, updateCycle, deleteCycle } from '@/hooks/useAPIMutations';
 * 
 * const MyComponent = () => {
 *   const { cycles, isLoading, mutate } = useCycles();
 * 
 *   const handleCreateCycle = async (data) => {
 *     try {
 *       await createCycle(data);
 *       // Le cache est automatiquement invalidé et rechargé
 *     } catch (error) {
 *       console.error(error);
 *     }
 *   };
 * 
 *   const handleUpdateCycle = async (cycleId, data) => {
 *     try {
 *       await updateCycle(cycleId, data);
 *       // Le cache est automatiquement mis à jour
 *     } catch (error) {
 *       console.error(error);
 *     }
 *   };
 * 
 *   return (
 *     // ... votre JSX
 *   );
 * }
 * ```
 */
