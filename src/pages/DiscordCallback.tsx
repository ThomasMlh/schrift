import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Spinner, Text } from "@chakra-ui/react";

export default function DiscordCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Récupère le token dans le hash
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    if (accessToken) {
      // Stocke le token dans le localStorage (ou autre)
      localStorage.setItem("discord_access_token", accessToken);
    }
    // Redirige vers /admin après traitement
    setTimeout(() => {
      navigate("/admin");
    }, 500);
  }, [navigate]);

  return (
    <Flex w="100%" h="60vh" align="center" justify="center" direction="column">
      <Spinner size="xl" />
      <Text mt={4}>Connexion Discord en cours...</Text>
    </Flex>
  );
}
