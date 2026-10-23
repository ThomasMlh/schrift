import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense, useRef } from "react";
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
const RecruitmentPage = lazy(() => import("./pages/RecruitmentPage"));
const RecruitmentTrackingPage = lazy(() => import("./pages/RecruitmentTrackingPage"));
const GuidesPage = lazy(() => import("./pages/GuidesPage"));
const AnnoncesPage = lazy(() => import("./pages/AnnoncesPage"));
const GuildesPage = lazy(() => import("./pages/GuildesPage"));
const OCRDebugPage = lazy(() => import("./pages/OCRDebugPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageFallback = () => (
  <Flex w="100%" h="60vh" align="center" justify="center">
    <Spinner size="xl" color="purple.500" />
  </Flex>
);

// Restricts a route to admins and guild leaders/officers
const ProtectedRoute: React.FC<IProtectedRoute> = ({
  isAuthenticated,
  isAdmin,
  isGuildManager,
  isLoading,
  children
}) => {
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

// Restricts a route to any logged-in user
const AuthenticatedRoute: React.FC<{ isAuthenticated: boolean; isLoading: boolean; children: React.ReactNode }> = ({
  isAuthenticated,
  isLoading,
  children
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Flex w="100%" h="60vh" align="center" justify="center">
        <Text>{t("auth.verifying")}</Text>
      </Flex>
    );
  }

  if (!isAuthenticated) {
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
          path="/joueur/:bbs_name"
          element={
            <AuthenticatedRoute
              isAuthenticated={isLoggedIn}
              isLoading={isAuthLoading}
            >
              <UserPage />
            </AuthenticatedRoute>
          }
        />
        <Route path="/podium" element={<PodiumPage />} />
        <Route path="/comparateur" element={<ComparatorPage />} />
        <Route path="/recrutement" element={<RecruitmentPage />} />
        <Route path="/recrutement/suivi/:token" element={<RecruitmentTrackingPage />} />
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
        <Route path="/annonce" element={<AnnoncesPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </Box>
  );
};

// Hides the site header and footer in capture mode (?capture=1), used by the Discord bot
// to screenshot only the page content (e.g. the podium).
const AppShell = () => {
  const location = useLocation();
  const { isAuthLoading } = useAuth();
  // Read once on mount: some pages (e.g. PodiumPage) rewrite the URL through setSearchParams()
  // without keeping "capture", which would bring the header back while the page loads.
  const isCaptureRef = useRef(new URLSearchParams(location.search).get("capture") === "1");
  const isCapture = isCaptureRef.current;

  if (isCapture) {
    return <AppRoutes />;
  }

  // While the session is being restored, wait for the profile instead of rendering
  // a half-filled header.
  if (isAuthLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" color="purple.500" thickness="3px" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" minH="100vh">
      <Header />
      <AppRoutes />
      <Footer />
    </Flex>
  );
};

const MainRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  );
};

export default MainRouter;
