import { useEffect, useState } from "react";
import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

/**
 * Page /annonce : affiche l'interface des annonces du jeu via le miroir
 * externe urahara-shop.red, qui gere lui-meme le token/device-id et
 * reecrit deja ses liens internes en chemins absolus sur son propre
 * domaine. Simple iframe, aucun proxy ni etat cote schrift-api requis.
 * La langue suit le selecteur global du site (Header) : pas de choix
 * independant ici, le mirror ne supporte de toute facon que fr/en.
 */

const NEWS_MIRROR = "https://urahara-shop.red/DataLoad/game/news";

const AnnoncesPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "fr";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [lang]);

  const src = `${NEWS_MIRROR}?lang=${lang}&path=${encodeURIComponent("news/index")}`;

  return (
    <Flex direction="column" h="calc(100vh - 140px)" w="100%">
      <Box flex="1" position="relative" borderWidth="1px" borderRadius="md" overflow="hidden">
        {loading && (
          <Flex position="absolute" inset={0} align="center" justify="center" bg="blackAlpha.100">
            <Spinner size="lg" color="purple.400" />
          </Flex>
        )}

        <iframe
          key={lang}
          src={src}
          title="Annonces Bleach Brave Souls"
          onLoad={() => setLoading(false)}
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      </Box>
    </Flex>
  );
};

export default AnnoncesPage;
