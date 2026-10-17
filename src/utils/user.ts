import { jwtDecode } from 'jwt-decode';
import type { IUser } from '../interfaces';

const TOKEN_KEY = 'userToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Whether a token is present and not expired
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
 * Decodes the token into user information, or null when missing or invalid
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

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // Legacy keys
  localStorage.removeItem("adminToken");
  localStorage.removeItem("token");
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const setRefreshToken = (refreshToken: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
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
