import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { IUser, IGuildRoleGrant } from '../interfaces';
import { getToken, isTokenValid, getUserFromToken, clearTokens, setToken as saveToken, getRefreshToken, setRefreshToken as saveRefreshToken } from '../utils/user';
import { getDiscordAvatarUrl } from '../utils/discord';
import { apiUrl } from '../utils/apiRequest';
import { isDiscordActivity, setupDiscordActivity } from '../activity/discordActivity';

interface AuthContextType {
  currentUser: IUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isGuildManager: boolean;
  // Un grant par compte bbs chef/sous-chef — un user peut gérer plusieurs guildes via des comptes différents.
  guildRoles: IGuildRoleGrant[];
  // Raccourci pratique : la liste (dédupliquée) des guilde_id que l'utilisateur peut administrer.
  managedGuildIds: string[];
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
  const [guildRoles, setGuildRoles] = useState<IGuildRoleGrant[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);

  const applyTokenState = useCallback((currentToken: string) => {
    const decoded = getUserFromToken();
    if (decoded) {
      const grants = decoded.guild_roles || [];
      setTokenState(currentToken);
      setIsLoggedIn(true);
      setIsAdmin(decoded.is_admin || false);
      setIsGuildManager(grants.length > 0);
      setGuildRoles(grants);

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
            bbs_accounts: u.bbs_accounts,
            banner: u.banner,
          } : prev);
          if (Array.isArray(u.guild_roles)) {
            setGuildRoles(u.guild_roles);
            setIsGuildManager(u.guild_roles.length > 0);
          }
        }
      }
    } catch {
      // silently fail - JWT data is sufficient
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    const currentToken = getToken();
    
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
      setGuildRoles([]);
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
    setGuildRoles([]);
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

  // Vérifier l'authentification au chargement.
  // En Discord Activity : connexion automatique via le SDK (identité Discord), pas de
  // redirection navigateur. Hors Activity : flow web classique inchangé.
  useEffect(() => {
    if (isDiscordActivity()) {
      setupDiscordActivity(login).catch((error) => {
        console.error('Erreur lors de la connexion Discord Activity:', error);
        setIsAuthLoading(false);
      });
    } else {
      refreshAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshAuth]);

  const managedGuildIds = [...new Set(guildRoles.map(g => g.guilde_id).filter(Boolean))];

  const value: AuthContextType = {
    currentUser,
    isLoggedIn,
    isAdmin,
    isGuildManager,
    guildRoles,
    managedGuildIds,
    isAuthLoading,
    token,
    login,
    logout,
    refreshAuth,
    getAuthHeaders
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
