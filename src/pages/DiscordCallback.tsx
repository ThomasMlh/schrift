import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Spinner, Text, useToast } from "@chakra-ui/react";

export default function DiscordCallback() {
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
        
        if (!code) {
          throw new Error('Code d\'autorisation manquant');
        }

        // Envoyer le code au backend
        const response = await fetch(`${apiUrl}/api/auth/discord/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de l\'authentification');
        }

        const data = await response.json();
        
        // Stocker le token JWT
        localStorage.setItem('userToken', data.token);
        
        // Déclencher un événement personnalisé pour notifier MainRouter
        window.dispatchEvent(new Event('authStateChange'));
        
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${data.user.username}!`,
          status: "success"
        });
        
        // Rediriger vers l'accueil
        navigate('/');
        
      } catch (error: any) {
        console.error('Erreur lors de l\'authentification Discord:', error);
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