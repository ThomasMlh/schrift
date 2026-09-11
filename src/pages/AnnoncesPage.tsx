import { useState } from "react";
import { Box, Flex, Button } from "@chakra-ui/react";

/**
 * Page /annonce : affiche l'interface des annonces du jeu via le miroir
 * externe urahara-shop.red, qui gere lui-meme le token/device-id et
 * reecrit deja ses liens internes en chemins absolus sur son propre
 * domaine. Simple iframe, aucun proxy ni etat cote schrift-api requis.
 */

const NEWS_MIRROR = "https://urahara-shop.red/DataLoad/game/news";

const LANGS = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ja", label: "JA" },
];

const AnnoncesPage = () => {
  const [lang, setLang] = useState("fr");

  const src = `${NEWS_MIRROR}?lang=${lang}&path=${encodeURIComponent("news/index")}`;

  return (
    <Flex direction="column" h="calc(100vh - 140px)" w="100%">
      <Flex gap={2} mb={2} wrap="wrap" align="center">
        {LANGS.map((l) => (
          <Button
            key={l.code}
            size="sm"
            variant={lang === l.code ? "solid" : "outline"}
            colorScheme="purple"
            onClick={() => setLang(l.code)}
          >
            {l.label}
          </Button>
        ))}
      </Flex>

      <Box flex="1" borderWidth="1px" borderRadius="md" overflow="hidden">
        <iframe
          key={lang}
          src={src}
          title="Annonces Bleach Brave Souls"
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      </Box>
    </Flex>
  );
};

export default AnnoncesPage;
