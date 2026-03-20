import { mutate } from 'swr';
import type { ICycle, IGuild, IScoreFormData, Role } from '../interfaces';
import { useAuth } from '@/providers/AuthProvider';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

/**
 * Hook personnalisé pour les mutations de données
 * Utilise le contexte d'authentification pour obtenir le token
 * et fournit des fonctions pour créer, mettre à jour et supprimer des données
 */
export const useAPIMutations = () => {
  const { token } = useAuth();

  // Fonction pour créer un cycle
  const createCycle = async (cycleData: Partial<ICycle>) => {
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
  };

  // Fonction pour mettre à jour un cycle
  const updateCycle = async (cycleId: string, cycleData: Partial<ICycle>) => {
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
  };

  // Fonction pour supprimer un cycle
  const deleteCycle = async (cycleId: string) => {
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
  };

  // Fonction pour créer une guilde
  const createGuild = async (guildData: Partial<IGuild>) => {
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
    // Invalider le cache pour forcer un rechargement
    await mutate(`${apiUrl}/api/guildes`);
    
    return newGuild;
  };

  // Fonction pour mettre à jour une guilde
  const updateGuild = async (guildId: string, guildData: Partial<IGuild>) => {
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
    // Invalider le cache pour forcer un rechargement
    await mutate(`${apiUrl}/api/guildes`);
    
    return updatedGuild;
  };

  // Fonction pour supprimer une guilde
  const deleteGuild = async (guildId: string) => {
    const response = await fetch(`${apiUrl}/api/guildes/${guildId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la suppression de la guilde');
  }

  const result = await response.json();

  // Invalider le cache pour forcer un rechargement
    // Invalider le cache pour forcer un rechargement
    await mutate(`${apiUrl}/api/guildes`);
    
    return result;
  };

  // Fonction pour assigner un utilisateur à une guilde avec mutation optimiste
  const assignUserToGuild = async (guildId: string, userId: string) => {
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
    // Invalider les caches concernés
    await mutate(membersKey);
    await mutate(`${apiUrl}/api/users`);
    
    return result;
  };

  // Fonction pour changer le rôle d'un utilisateur
  const updateUserRole = async (userId: string, newRole: Role) => {
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
    // Invalider les caches pour les utilisateurs et les guildes
    await mutate((key) => typeof key === 'string' && (
      key.startsWith(`${apiUrl}/api/users`) || 
      key.startsWith(`${apiUrl}/api/guildes`)
    ));
    
    return result;
  };

  // Fonction pour déplacer un utilisateur vers une autre guilde
  const moveUserToGuild = async (userId: string, newGuildId: string) => {
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
  };

  // Fonction pour supprimer un membre d'une guilde
  const removeGuildMember = async (guildId: string, userId: string) => {
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
  };

  // Fonction pour créer un score
  const createScore = async (scoreData: IScoreFormData) => {
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
  };

  // Fonction pour mettre à jour un score
  const updateScore = async (scoreId: string, scoreData: Partial<IScoreFormData>) => {
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
  };

  // Fonction pour supprimer un score
  const deleteScore = async (scoreId: string) => {
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
    // Invalider le cache des scores
    await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/scores`));
    
    return true;
  };

  // Fonction pour créer des scores en bulk
  const createBulkScores = async (scoresData: IScoreFormData[]) => {
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
    // Invalider le cache des scores
    await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/scores`));
    
    return result;
  };

  // Fonction pour créer un build
  const createBuild = async (buildData: {
    rotation_id: string;
    description?: string;
    team: Array<{
      id_character: string;
      position: number;
      links?: Array<{ id_character: string }>;
    }>;
  }) => {
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
    // Invalider le cache des builds
    await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/builds`));
    
    return newBuild;
  };

  // Fonction pour mettre à jour un build
  const updateBuild = async (buildId: string, buildData: {
    rotation_id?: string;
    description?: string;
    team?: Array<{
      id_character: string;
      position: number;
      links?: Array<{ id_character: string }>;
    }>;
  }) => {
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
    // Invalider le cache des builds
    await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/builds`));
    
    return updatedBuild;
  };

  // Fonction pour valider/invalider un build (admin only)
  const validateBuild = async (buildId: string, isValid: boolean) => {
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
  };

  // Fonction pour supprimer un build
  const deleteBuild = async (buildId: string) => {
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
  };

  // === OCR ===

  // Traiter un batch de screenshots OCR
  const processOCRBatch = async (params: {
    guild_id: string;
    cycle_id: string;
    rotation_id: string;
    screenshotter_id: string;
    screenshots: Array<{ data: string; filename: string }>;
  }) => {
    const response = await fetch(`${apiUrl}/api/ocr/batch-guild-ranking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Erreur HTTP ${response.status}: ${response.statusText}`);
    }

    if (!data.success) {
      throw new Error(data.message || 'Erreur OCR');
    }

    return data;
  };

  // Soumettre les scores validés depuis l'OCR
  const submitOCRBatch = async (params: {
    guild_id: string;
    cycle_id: string;
    rotation_id: string;
    scores: Array<{ user_id: string; raw_score: number; screenshot_index: number }>;
  }) => {
    const response = await fetch(`${apiUrl}/api/ocr/submit-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la soumission');
    }

    if (!data.success) {
      throw new Error(data.message || 'Erreur soumission');
    }

    // Invalider le cache des scores
    await mutate((key) => typeof key === 'string' && key.includes('/api/scores'));

    return data;
  };

  // Visualiser les zones OCR (debug)
  const visualizeOCRZones = async (params: {
    screenshot: { data: string; filename: string };
    screenshotter_id: string;
  }) => {
    const response = await fetch(`${apiUrl}/api/ocr/debug/visualize-zones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur visualisation');
    }

    return data;
  };

  // Fonction pour exécuter un draft (déplacements en masse de joueurs entre guildes)
  const executeDraft = async (moves: { userId: string; toGuildId: string | null; role?: string }[]) => {
    const response = await fetch(`${apiUrl}/api/guildes/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ moves }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'exécution du draft');
    }

    // Invalider les caches pour les utilisateurs et les guildes
    await mutate((key) => typeof key === 'string' && (
      key.startsWith(`${apiUrl}/api/users`) || 
      key.startsWith(`${apiUrl}/api/guildes`)
    ));

    return data;
  };

  // Fonction pour bannir un utilisateur
  const banUser = async (userId: string, reason?: string) => {
    const response = await fetch(`${apiUrl}/api/users/${userId}/ban`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors du bannissement');
    }

    const result = await response.json();

    await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/users`));

    return result;
  };

  // Fonction pour débannir un utilisateur
  const unbanUser = async (userId: string) => {
    const response = await fetch(`${apiUrl}/api/users/${userId}/unban`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors du débannissement');
    }

    const result = await response.json();

    await mutate((key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/users`));

    return result;
  };

  return {
    createCycle,
    updateCycle,
    deleteCycle,
    createGuild,
    updateGuild,
    deleteGuild,
    assignUserToGuild,
    updateUserRole,
    moveUserToGuild,
    removeGuildMember,
    createScore,
    updateScore,
    deleteScore,
    createBulkScores,
    createBuild,
    updateBuild,
    validateBuild,
    deleteBuild,
    processOCRBatch,
    submitOCRBatch,
    visualizeOCRZones,
    executeDraft,
    banUser,
    unbanUser,
  };
};

/**
 * Exemple d'utilisation dans un composant :
 * 
 * ```tsx
 * import { useCycles } from '@/hooks/useAPI';
 * import { useAPIMutations } from '@/hooks/useAPIMutations';
 * 
 * const MyComponent = () => {
 *   const { cycles, isLoading } = useCycles();
 *   const { createCycle, updateCycle, deleteCycle } = useAPIMutation
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
