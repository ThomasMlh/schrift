import { jwtDecode } from 'jwt-decode';
import type { IUser } from '../interfaces';

/**
 * Récupère le token depuis le localStorage
 * Vérifie d'abord userToken puis adminToken
 */
export const getToken = (): string | null => {
  return localStorage.getItem("userToken") || localStorage.getItem("adminToken");
};

/**
 * Vérifie si un token est valide (non expiré)
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded = jwtDecode<IUser>(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded.exp < currentTime) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Décode le token et retourne les informations utilisateur
 * Retourne null si le token est invalide ou absent
 */
export const getUserFromToken = (): IUser | null => {
  const token = getToken();
  if (!token || !isTokenValid(token)) {
    return null;
  }
  try {
    return jwtDecode<IUser>(token);
  } catch (error) {
    console.error("Erreur décodage token:", error);
    return null;
  }
};

/**
 * Nettoie tous les tokens du localStorage
 */
export const clearTokens = (): void => {
  localStorage.removeItem("userToken");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("token");
};

/**
 * Stocke le token dans le localStorage sous userToken
 */
export const setToken = (token: string): void => {
  localStorage.setItem("userToken", token);
};

export const formatRoleName = (role: string): string => {
  switch (role) {
    case "chef":
      return "Chef";
    case "sous-chef":
      return "Sous-Chef";
    case "membre":
      return "Membre";
    default:
      return "Inconnu";
  }
};
