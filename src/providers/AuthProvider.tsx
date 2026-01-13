import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { IUser } from '../interfaces';
import { getToken, isTokenValid, getUserFromToken, clearTokens, setToken as saveToken } from '../utils/user';
import { getDiscordAvatarUrl } from '../utils/discord';

interface AuthContextType {
  currentUser: IUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isGuildManager: boolean;
  isAuthLoading: boolean;
  token: string | null;
  login: (token: string) => void;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuildManager, setIsGuildManager] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);

  const refreshAuth = () => {
    const currentToken = getToken();
    
    if (currentToken && isTokenValid(currentToken)) {
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

        // Migrer adminToken vers userToken si nécessaire
        if (localStorage.getItem("adminToken")) {
          localStorage.setItem("userToken", currentToken);
          localStorage.removeItem("adminToken");
        }
      } else {
        // Token invalide
        logout();
      }
    } else {
      // Pas de token ou token expiré
      setTokenState(null);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setIsGuildManager(false);
      setCurrentUser(null);
    }
    
    setIsAuthLoading(false);
  };

  const login = (token: string) => {
    saveToken(token);
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
