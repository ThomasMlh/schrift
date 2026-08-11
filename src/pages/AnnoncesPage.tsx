import { useState } from "react";
import type { ComponentType, PropsWithChildren } from "react";
import {
  Box, Flex, Button, Input, Text, useToast, HStack,
  Collapse as ChakraCollapse, type CollapseProps,
} from "@chakra-ui/react";
import { apiUrl } from "../utils/apiRequest";
import { useAuth } from "../providers/AuthProvider";

// Chakra UI 2.x's transition components (built on framer-motion) lose their
// implicit `children` prop under React 19's stricter types — recast locally
// rather than touching the global React/Chakra type setup.
const Collapse = ChakraCollapse as ComponentType<PropsWithChildren<CollapseProps>>;

/**
 * Page /annonce : affiche l'interface des annonces du jeu via le proxy API
 * (`/api/webview/news/index`), qui ajoute les en-tetes + le token requis.
 * Affichage en iframe : les liens internes sont reecrits par le proxy pour
 * rester dans `/api/webview/...`. Les assets viennent du CDN public du jeu.
 *
 * Un bloc admin permet de coller le X-WEB-VIEW-TOKEN capture (mitmproxy) et de
 * l'enregistrer dans Mongo via l'endpoint admin.
 */

const LANGS = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ja", label: "JA" },
  { code: "ko", label: "KO" },
  { code: "th", label: "TH" },
];

const AnnoncesPage = () => {
  const { isAdmin, token } = useAuth();
  const toast = useToast();

  const [lang, setLang] = useState("fr");
  const [reloadKey, setReloadKey] = useState(0);

  const [showAdmin, setShowAdmin] = useState(false);
  const [bbsToken, setBbsToken] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [saving, setSaving] = useState(false);

  const src = `${apiUrl}/api/webview/news/index?lang=${lang}&_=${reloadKey}`;

  const saveToken = async () => {
    if (!bbsToken.trim()) {
      toast({ status: "warning", title: "Colle d'abord le token" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/webview/_admin/token`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          token: bbsToken.trim(),
          ...(deviceId.trim() ? { deviceId: deviceId.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Echec de l'enregistrement");
      }
      toast({
        status: data.authenticated ? "success" : "warning",
        title: data.authenticated
          ? "Token enregistre et valide ✔"
          : "Token enregistre, mais contenu vide (expire ?)",
      });
      setBbsToken("");
      setReloadKey((k) => k + 1); // recharge l'iframe
    } catch (e) {
      toast({ status: "error", title: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

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
        {isAdmin && (
          <Button
            size="sm"
            ml="auto"
            variant="ghost"
            colorScheme="gray"
            onClick={() => setShowAdmin((s) => !s)}
          >
            🔑 Token
          </Button>
        )}
      </Flex>

      {isAdmin && (
        <Collapse in={showAdmin} animateOpacity>
          <Box
            mb={2}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            bg="blackAlpha.300"
          >
            <Text fontSize="sm" mb={2} opacity={0.8}>
              Colle le <b>X-WEB-VIEW-TOKEN</b> et le <b>X-DEVICE-ID</b> captures
              (mitmproxy). Le token est <b>lie au device-id</b> : les deux
              doivent venir de la meme capture, sinon page d'erreur. Une fois le
              device-id enregistre, il reste stocke ; ensuite seul le token est a
              rafraichir.
            </Text>
            <HStack align="flex-start" wrap="wrap">
              <Input
                size="sm"
                w={{ base: "100%", md: "420px" }}
                placeholder="X-WEB-VIEW-TOKEN"
                value={bbsToken}
                onChange={(e) => setBbsToken(e.target.value)}
              />
              <Input
                size="sm"
                w={{ base: "100%", md: "200px" }}
                placeholder="X-DEVICE-ID"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
              <Button
                size="sm"
                colorScheme="purple"
                onClick={saveToken}
                isLoading={saving}
              >
                Enregistrer
              </Button>
            </HStack>
          </Box>
        </Collapse>
      )}

      <Box flex="1" borderWidth="1px" borderRadius="md" overflow="hidden">
        <iframe
          key={`${lang}-${reloadKey}`}
          src={src}
          title="Annonces Bleach Brave Souls"
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      </Box>
    </Flex>
  );
};

export default AnnoncesPage;
