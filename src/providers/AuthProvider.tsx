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
  // One grant per leader/officer bbs account: a user may manage several guilds through different accounts.
  guildRoles: IGuildRoleGrant[];
  // Convenience: the deduplicated guild ids the user can manage.
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

// Maximum wait for the profile (/api/auth/me) before showing the site with the token data only:
// a slow API (cold start) must not block the site.
const PROFILE_TIMEOUT_MS = 6000;

const tryRefreshToken = async (): Promise<string | null> => {
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
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuildManager, setIsGuildManager] = useState(false);
  const [guildRoles, setGuildRoles] = useState<IGuildRoleGrant[]>([]);
  // Loading only when there is a session to restore: a visitor without a token sees the site
  // immediately, a logged-in user once their profile is loaded.
  const [isAuthLoading, setIsAuthLoading] = useState(() => isDiscordActivity() || !!getToken() || !!getRefreshToken());
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROFILE_TIMEOUT_MS);
    try {
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${currentToken}` },
        signal: controller.signal,
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
      // On failure or timeout, keep the token data
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    const currentToken = getToken();
    
    if (currentToken && isTokenValid(currentToken)) {
      applyTokenState(currentToken);
      // The token only carries permissions: name, avatar and accounts come from the profile
      await fetchUserProfile(currentToken);
    } else if (currentToken || getRefreshToken()) {
      // Expired token but a refresh token is available
      const newToken = await tryRefreshToken();
      if (newToken) {
        applyTokenState(newToken);
        await fetchUserProfile(newToken);
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
    setIsAuthLoading(true);
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

  // Check authentication on load.
  // In a Discord Activity: automatic login through the SDK (Discord identity), no browser redirect.
  // Outside an Activity: regular web flow.
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
