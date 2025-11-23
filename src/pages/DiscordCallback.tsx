import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Spinner, Text, useToast } from "@chakra-ui/react";

const DiscordCallback = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Éviter la double exécution
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processDiscordCallback = async () => {
      try {
        // Récupérer le code depuis les paramètres URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        // Vérifier si l'utilisateur a refusé l'autorisation
        if (error) {
          throw new Error(`Autorisation refusée: ${error}`);
        }
        
        if (!code) {
          throw new Error('Code d\'autorisation manquant');
        }

        // Obtenir la même redirect_uri qui a été utilisée pour la génération du lien
        let redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI;
        
        if (!redirectUri) {
          if (window.location.hostname === 'localhost') {
            redirectUri = 'http://localhost:5173/discord-callback';
          } else if (window.location.hostname === 'www.bbs-schrift.fr') {
            redirectUri = 'https://www.bbs-schrift.fr/discord-callback';
          } else if (window.location.hostname === 'bbs-schrift.fr') {
            redirectUri = 'https://bbs-schrift.fr/discord-callback';
          } else {
            redirectUri = `${window.location.origin}/discord-callback`;
          }
        }

        // Envoyer le code au backend avec la redirect_uri
        const response = await fetch(`${apiUrl}/api/auth/discord/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code,
            redirect_uri: redirectUri 
          }),
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
        
        // Stocker le token JWT
        localStorage.setItem('userToken', data.token);
        
        // Déclencher un événement personnalisé pour notifier MainRouter
        window.dispatchEvent(new Event('authStateChange'));
        
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${data.user.global_name}!`,
          status: "success"
        });
        
        // Rediriger vers l'accueil
        navigate('/');
        
      } catch (error: any) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          status: "error"
        });
        navigate('/');
      }
    };

    processDiscordCallback();
  }, []);

  return (
    <Flex w="100%" h="60vh" align="center" justify="center" direction="column">
      <Spinner size="xl" color="purple.500" mb={4} />
      <Text>Connexion en cours avec Discord...</Text>
    </Flex>
  );
}

export default DiscordCallback;