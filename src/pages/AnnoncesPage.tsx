import { useEffect, useState } from "react";
import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

/**
 * /annonce page: shows the in-game announcements through the external urahara-shop.red mirror, which
 * handles the token/device id itself and already rewrites its internal links. Plain iframe, no proxy
 * or state needed in schrift-api. The language follows the site-wide selector (the mirror only
 * supports fr/en).
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
