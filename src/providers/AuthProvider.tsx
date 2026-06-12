import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { IUser } from '../interfaces';
import { getToken, isTokenValid, getUserFromToken, clearTokens, setToken as saveToken, getRefreshToken, setRefreshToken as saveRefreshToken } from '../utils/user';
import { getDiscordAvatarUrl } from '../utils/discord';

interface AuthContextType {
  currentUser: IUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isGuildManager: boolean;
  isAuthLoading: boolean;
  token: string | null;
  login: (token: string, refreshToken?: string) => void;
  logout: () => void;
  refreshAuth: () => void;
  getAuthHeaders: () => HeadersInit;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.success && data.token) {
      saveToken(data.token);
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuildManager, setIsGuildManager] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);

  const applyTokenState = useCallback((currentToken: string) => {
    const decoded = getUserFromToken();
    if (decoded) {
      setTokenState(currentToken);
      setIsLoggedIn(true);
      setIsAdmin(decoded.is_admin || false);
      setIsGuildManager(
        decoded.role === "chef" || decoded.role === "sous-chef"
      );

      // Construire l'URL de l'avatar si disponible
      let avatarUrl = null;
      if (decoded.avatar && decoded.discord_id) {
        avatarUrl = getDiscordAvatarUrl(decoded.discord_id, decoded.avatar);
      }

      setCurrentUser({
        ...decoded,
        avatar: avatarUrl || undefined
      });
    } else {
      logout();
    }
  }, []);

  const fetchUserProfile = useCallback(async (currentToken: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${currentToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const u = data.user;
          let avatarUrl = null;
          if (u.avatar && u.discord_id) {
            avatarUrl = getDiscordAvatarUrl(u.discord_id, u.avatar);
          }
          setCurrentUser(prev => prev ? {
            ...prev,
            username: u.username,
            global_name: u.global_name,
            avatar: avatarUrl || undefined,
            bbs_id: u.bbs_id,
            bbs_name: u.bbs_name,
            banner: u.banner,
          } : prev);
        }
      }
    } catch {
      // silently fail - JWT data is sufficient
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    let currentToken = getToken();
    
    if (currentToken && isTokenValid(currentToken)) {
      applyTokenState(currentToken);
      // Fetch full profile from API to get up-to-date fields
      fetchUserProfile(currentToken);
    } else if (currentToken || getRefreshToken()) {
      // Token expiré mais refresh token disponible
      const newToken = await tryRefreshToken();
      if (newToken) {
        applyTokenState(newToken);
        fetchUserProfile(newToken);
      } else {
        logout();
      }
    } else {
      setTokenState(null);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setIsGuildManager(false);
      setCurrentUser(null);
    }
    
    setIsAuthLoading(false);
  }, [applyTokenState, fetchUserProfile]);

  const login = (token: string, refreshToken?: string) => {
    saveToken(token);
    if (refreshToken) {
      saveRefreshToken(refreshToken);
    }
    refreshAuth();
  };

  const logout = () => {
    clearTokens();
    setTokenState(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setIsGuildManager(false);
    setCurrentUser(null);
  };

  const getAuthHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    refreshAuth();
  }, []);

  const value: AuthContextType = {
    currentUser,
    isLoggedIn,
    isAdmin,
    isGuildManager,
    isAuthLoading,
    token,
    login,
    logout,
    refreshAuth,
    getAuthHeaders
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
