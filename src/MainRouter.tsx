import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import HomePage from "./pages/HomePage";
import CharactersPage from "./pages/CharactersPage";
import CharacterDetailPage from "./pages/CharacterDetailPage";
import CyclesPage from "./pages/CyclesPage";
import CycleDetailPage from "./pages/CycleDetailPage";
import RotationDetailPage from "./pages/RotationDetailPage";
import DiscordCallback from "./pages/DiscordCallback";
import UserPage from "./pages/UserPage";
import type { IProtectedRoute, IUser } from "./interfaces";
import UsersPage from "./pages/UsersPage";
import AdminPage from "./pages/AdminPage";
import PodiumPage from "./pages/PodiumPage";
import ComparatorPage from "./pages/ComparatorPage";
import GuidesPage from "./pages/GuidesPage";
import NotFound from "./pages/NotFound";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

// Composant pour protéger les routes admin (admins OU chefs/sous-chefs)
const ProtectedRoute: React.FC<IProtectedRoute> = ({
  isAuthenticated,
  isAdmin,
  isGuildManager,
  isLoading,
  children
}) => {
  // Pendant le chargement, ne pas rediriger
  if (isLoading) {
    return (
      <Flex w="100%" h="60vh" align="center" justify="center">
        <Text>Vérification des droits d'accès...</Text>
      </Flex>
    );
  }

  if (!isAuthenticated || (!isAdmin && !isGuildManager)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const MainRouter = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuildManager, setIsGuildManager] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Fonction utilitaire pour vérifier la validité du token
  const isTokenValid = (token: string | null): boolean => {
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

  // Vérifier le token au chargement
  useEffect(() => {
    const checkAuthState = () => {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("adminToken");
      if (token && isTokenValid(token)) {
        try {
          const decoded = jwtDecode<IUser>(token);
          setIsLoggedIn(true);
          setIsAdmin(decoded.is_admin || false);
          setIsGuildManager(
            decoded.role === "chef" || decoded.role === "sous-chef"
          );
        } catch (error) {
          console.error("Erreur décodage token:", error);
          localStorage.removeItem("userToken");
          localStorage.removeItem("adminToken");
          setIsLoggedIn(false);
          setIsAdmin(false);
          setIsGuildManager(false);
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsGuildManager(false);
      }
      setIsAuthLoading(false);
    };

    checkAuthState();

    const handleAuthStateChange = () => {
      checkAuthState();
    };

    window.addEventListener("authStateChange", handleAuthStateChange);
    window.addEventListener("storage", handleAuthStateChange);

    return () => {
      window.removeEventListener("authStateChange", handleAuthStateChange);
      window.removeEventListener("storage", handleAuthStateChange);
    };
  }, []);

  return (
    <Router>
      <Flex direction="column" minH="100vh">
        <Header />
        <Box
          as="main"
          flex="1"
          px={4}
          py={2}
          overflow="auto"
          overflowX="hidden"
        >
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/personnages" element={<CharactersPage />} />
          <Route path="/personnage/:id" element={<CharacterDetailPage />} />
          <Route path="/cycles" element={<CyclesPage />} />
          <Route path="/cycle/:id" element={<CycleDetailPage />} />
          <Route
            path="/cycle/:cycleId/rotation/:position"
            element={<RotationDetailPage />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                isAuthenticated={isLoggedIn}
                isAdmin={isAdmin}
                isGuildManager={isGuildManager}
                isLoading={isAuthLoading}
              >
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/discord-callback" element={<DiscordCallback />} />
          <Route path="/joueurs" element={<UsersPage />} />
          <Route path="/joueur/:userId" element={<UserPage />} />
          <Route path="/podium" element={<PodiumPage />} />
          <Route path="/comparateur" element={<ComparatorPage />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/guides/:section" element={<GuidesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Box>
        <Footer />
      </Flex>
    </Router>
  );
};

export default MainRouter;
