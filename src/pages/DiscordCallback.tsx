import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Spinner, Text, useToast } from "@chakra-ui/react";
import { useAuth } from "../providers/AuthProvider";

const DiscordCallback = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Éviter la double exécution
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processDiscordCallback = async () => {
      try {
        // Récupérer le code et le state depuis les paramètres URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const returnedState = urlParams.get('state');
        
        // Vérifier si l'utilisateur a refusé l'autorisation
        if (error) {
          throw new Error(`Autorisation refusée: ${error}`);
        }
        
        if (!code) {
          throw new Error('Code d\'autorisation manquant');
        }

        // Vérifier le state anti-CSRF
        const savedState = sessionStorage.getItem('oauth_state');
        sessionStorage.removeItem('oauth_state');
        if (!returnedState || returnedState !== savedState) {
          throw new Error('Vérification de sécurité échouée (state invalide)');
        }

        // Envoyer le code au backend (le backend détermine lui-même la redirect_uri)
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
        
        // Stocker le token JWT et le refresh token via le context
        login(data.token, data.refreshToken);
        
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${data.user.global_name}!`,
          status: "success"
        });
        
        // Rediriger vers la page d'origine ou l'accueil
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        toast({
          title: "Erreur de connexion",
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

  return (
    <Flex w="100%" h="60vh" align="center" justify="center" direction="column">
      <Spinner size="xl" color="purple.500" mb={4} />
      <Text>Connexion en cours avec Discord...</Text>
    </Flex>
  );
}

export default DiscordCallback;