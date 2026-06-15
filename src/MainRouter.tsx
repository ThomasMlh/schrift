import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { IProtectedRoute } from "./interfaces";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AuthProvider, useAuth } from "./providers/AuthProvider";

const HomePage = lazy(() => import("./pages/HomePage"));
const CharactersPage = lazy(() => import("./pages/CharactersPage"));
const CharacterDetailPage = lazy(() => import("./pages/CharacterDetailPage"));
const CyclesPage = lazy(() => import("./pages/CyclesPage"));
const CycleDetailPage = lazy(() => import("./pages/CycleDetailPage"));
const RotationDetailPage = lazy(() => import("./pages/RotationDetailPage"));
const DiscordCallback = lazy(() => import("./pages/DiscordCallback"));
const UserPage = lazy(() => import("./pages/UserPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const PodiumPage = lazy(() => import("./pages/PodiumPage"));
const ComparatorPage = lazy(() => import("./pages/ComparatorPage"));
const GuidesPage = lazy(() => import("./pages/GuidesPage"));
const GuildesPage = lazy(() => import("./pages/GuildesPage"));
const OCRDebugPage = lazy(() => import("./pages/OCRDebugPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageFallback = () => (
  <Flex w="100%" h="60vh" align="center" justify="center">
    <Spinner size="xl" color="purple.500" />
  </Flex>
);

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
      <Suspense fallback={<PageFallback />}>
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
      </Suspense>
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
