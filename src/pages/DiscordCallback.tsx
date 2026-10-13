import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useAuth } from "../providers/AuthProvider";
import { useTranslation } from "react-i18next";
import { PageLoader } from "@/components/ui/PageLoader";

const DiscordCallback = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processDiscordCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const returnedState = urlParams.get('state');
        
        // The user declined the authorization
        if (error) {
          throw new Error(`Autorisation refusée: ${error}`);
        }
        
        if (!code) {
          throw new Error('Code d\'autorisation manquant');
        }

        // Anti-CSRF state check
        const savedState = sessionStorage.getItem('oauth_state');
        sessionStorage.removeItem('oauth_state');

        if (!savedState) {
          // No OAuth flow in progress (stale URL or restored by the browser)
          navigate('/');
          return;
        }

        if (!returnedState || returnedState !== savedState) {
          throw new Error('Vérification de sécurité échouée (state invalide)');
        }

        // Send the code to the API (it determines the redirect_uri itself)
        const response = await fetch(`${apiUrl}/api/auth/discord/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Backend error response:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(errorData.message || `Erreur lors de l'échange du code (${response.status})`);
        }

        const data = await response.json();
        
        login(data.token, data.refreshToken);
        
        toast({
          title: t("pages.discordCallback.toastSuccessTitle"),
          description: `${t("pages.discordCallback.toastSuccessPrefix")} ${data.user.global_name}!`,
          status: "success"
        });
        
        // Redirect to the original page or home
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        toast({
          title: t("pages.discordCallback.toastErrorTitle"),
          description: errorMessage,
          status: "error"
        });
        sessionStorage.removeItem('redirectAfterLogin');
        navigate('/');
      }
    };

    processDiscordCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <PageLoader variant="spinner" label={t("pages.discordCallback.loading")} color="purple.500" />;
}

export default DiscordCallback;