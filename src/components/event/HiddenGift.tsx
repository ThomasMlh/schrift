import { useEffect, useState } from "react";
import { Box, Tooltip, useToast } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGiftHunt } from "@/hooks/useAPI";
import { useAuth } from "@/providers/AuthProvider";
import { useLive } from "@/providers/LiveEventProvider";
import { GiftBox } from "./GiftBox";

const bob = keyframes`
  0%, 100% { transform: translateY(0) rotate(-6deg); }
  50% { transform: translateY(-6px) rotate(6deg); }
`;

// Where the gift sits on the page, picked from the path so it does not always show at the same place
const SPOTS = [
  { bottom: "18%", left: "14px" },
  { top: "38%", right: "14px" },
  { bottom: "90px", right: "22%" },
  { top: "55%", left: "14px" },
  { bottom: "24%", right: "14px" },
];
const spotOf = (path: string) => SPOTS[[...path].reduce((sum, c) => sum + c.charCodeAt(0), 0) % SPOTS.length];

// Gift of the hunt: asks the server whether the page shown hides today's gift, and lets the player pick it up
export const HiddenGift = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { pathname } = useLocation();
  const { isLoggedIn } = useAuth();
  const { live } = useLive();
  const hunt = useGiftHunt();
  const [giftPath, setGiftPath] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const active = Boolean(live?.hunt && isLoggedIn);

  useEffect(() => {
    setGiftPath(null);
    if (!active) return undefined;
    let cancelled = false;
    // Waits for the page to settle: a quick navigation does not ask for every page it passes
    const timer = window.setTimeout(() => {
      hunt.check(pathname).then((result) => {
        if (!cancelled && result.gift) setGiftPath(pathname);
      }).catch(() => undefined);
    }, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active, pathname, hunt]);

  if (!giftPath || giftPath !== pathname) return null;

  const claim = async () => {
    setClaiming(true);
    try {
      const result = await hunt.claim(giftPath);
      setGiftPath(null);
      toast({
        status: "success",
        duration: 8000,
        isClosable: true,
        title: t("components.liveEvent.giftFound"),
        description: [
          t("components.liveEvent.giftReward", { points: result.points, count: result.tickets }),
          t("components.liveEvent.giftCount", { count: result.found }),
          result.hunter_badge ? t("components.liveEvent.hunterBadge") : null,
        ].filter(Boolean).join(" "),
      });
    } catch (err) {
      setGiftPath(null);
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Tooltip label={t("components.liveEvent.giftHere")} hasArrow placement="top">
      <Box
        as="button"
        type="button"
        onClick={claiming ? undefined : claim}
        aria-label={t("components.liveEvent.giftHere")}
        position="fixed"
        zIndex={1300}
        {...spotOf(pathname)}
        animation={`${bob} 2.2s ease-in-out infinite`}
        sx={{ "@media (prefers-reduced-motion: reduce)": { animation: "none" } }}
        borderRadius="lg"
        _hover={{ filter: "brightness(1.15)" }}
        _focusVisible={{ outline: "3px solid", outlineColor: "yellow.300", outlineOffset: "3px" }}
        opacity={claiming ? 0.5 : 1}
      >
        <GiftBox size={46} />
      </Box>
    </Tooltip>
  );
};
