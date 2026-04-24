import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import HomePage from "./pages/HomePage";
import CharactersPage from "./pages/CharactersPage";
import CharacterDetailPage from "./pages/CharacterDetailPage";
import CyclesPage from "./pages/CyclesPage";
import CycleDetailPage from "./pages/CycleDetailPage";
import RotationDetailPage from "./pages/RotationDetailPage";
import DiscordCallback from "./pages/DiscordCallback";
import UserPage from "./pages/UserPage";
import type { IProtectedRoute } from "./interfaces";
import UsersPage from "./pages/UsersPage";
import AdminPage from "./pages/AdminPage";
import PodiumPage from "./pages/PodiumPage";
import ComparatorPage from "./pages/ComparatorPage";
import GuidesPage from "./pages/GuidesPage";
import GuildesPage from "./pages/GuildesPage";
import OCRDebugPage from "./pages/OCRDebugPage";
import NotFound from "./pages/NotFound";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AuthProvider, useAuth } from "./providers/AuthProvider";

// Composant pour protéger les routes admin (admins OU chefs/sous-chefs)
const ProtectedRoute: React.FC<IProtectedRoute> = ({
  isAuthenticated,
  isAdmin,
  isGuildManager,
  isLoading,
  children
}) => {
  // Pendant le chargement, ne pas rediriger
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Flex w="100%" h="60vh" align="center" justify="center">
        <Text>{t("auth.verifying")}</Text>
      </Flex>
    );
  }

  if (!isAuthenticated || (!isAdmin && !isGuildManager)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isLoggedIn, isAdmin, isGuildManager, isAuthLoading } = useAuth();

  return (
    <Box as="main" flex="1" px={4} overflow="auto">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guildes" element={<GuildesPage />} />
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
        <Route
          path="/joueur/:userId"
          element={
            <ProtectedRoute
              isAuthenticated={isLoggedIn}
              isAdmin={isAdmin}
              isGuildManager={isGuildManager}
              isLoading={isAuthLoading}
            >
              <UserPage />
            </ProtectedRoute>
          }
        />
        <Route path="/podium" element={<PodiumPage />} />
        <Route path="/comparateur" element={<ComparatorPage />} />
        <Route
          path="/ocr-debug"
          element={
            <ProtectedRoute
              isAuthenticated={isLoggedIn}
              isAdmin={isAdmin}
              isGuildManager={isGuildManager}
              isLoading={isAuthLoading}
            >
              <OCRDebugPage />
            </ProtectedRoute>
          }
        />
        <Route path="/guides" element={<GuidesPage />} />
        <Route path="/guides/:section" element={<GuidesPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Box>
  );
};

const MainRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <Flex direction="column" minH="100vh">
          <Header />
          <AppRoutes />
          <Footer />
        </Flex>
      </AuthProvider>
    </Router>
  );
};

export default MainRouter;
