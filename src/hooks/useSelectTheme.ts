import { useColorModeValue } from "@chakra-ui/react";

export type SelectVariant = "default" | "ghost" | "modal" | "modal-orange";

export interface SelectTheme {
  buttonBg: string;
  borderColor: string;
  hoverBorderColor: string;
  menuBg: string;
  menuBorderColor: string;
  hoverItemBg: string;
  groupHeaderBg: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
}

/**
 * Returns color tokens for select/filter components.
 *
 * - "default" → solid background (white / gray.800), suited for cards and light pages
 * - "ghost"   → semi-transparent background, suited for dark/glass containers
 */
export const useSelectTheme = (variant: SelectVariant = "default"): SelectTheme => {
  // ── default ──────────────────────────────────────────────────────────────
  const defaultButtonBg = useColorModeValue("white", "gray.800");
  const defaultBorderColor = useColorModeValue("gray.200", "gray.600");
  const defaultHoverBorderColor = useColorModeValue("gray.300", "gray.500");
  const defaultMenuBg = useColorModeValue("white", "gray.800");
  const defaultHoverItemBg = useColorModeValue("gray.50", "gray.700");
  const defaultGroupHeaderBg = useColorModeValue("gray.100", "gray.700");
  const defaultScrollbarThumb = useColorModeValue("gray.300", "gray.600");
  const defaultScrollbarThumbHover = useColorModeValue("gray.400", "gray.500");

  // ── ghost ─────────────────────────────────────────────────────────────────
  const ghostButtonBg = useColorModeValue("white", "rgba(255,255,255,0.06)");
  const ghostBorderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const ghostHoverBorderColor = useColorModeValue("gray.300", "whiteAlpha.300");
  const ghostMenuBg = useColorModeValue("white", "#1e2535");
  const ghostHoverItemBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const ghostGroupHeaderBg = useColorModeValue("gray.100", "whiteAlpha.50");
  const ghostScrollbarThumb = useColorModeValue("gray.300", "whiteAlpha.300");
  const ghostScrollbarThumbHover = useColorModeValue("gray.400", "whiteAlpha.400");

  // ── modal (violet) ────────────────────────────────────────────────────────
  // Matches BulkScoreModal: modalBg #1a1b2e, accent purple #7C3AED / #4F46E5
  const modalButtonBg = useColorModeValue("purple.50", "rgba(124,58,237,0.12)");
  const modalBorderColor = useColorModeValue("purple.200", "rgba(124,58,237,0.35)");
  const modalHoverBorderColor = useColorModeValue("purple.400", "rgba(124,58,237,0.6)");
  const modalMenuBg = useColorModeValue("white", "#1a1b2e");
  const modalHoverItemBg = useColorModeValue("purple.50", "rgba(124,58,237,0.15)");
  const modalGroupHeaderBg = useColorModeValue("purple.100", "rgba(124,58,237,0.1)");
  const modalScrollbarThumb = useColorModeValue("purple.200", "rgba(124,58,237,0.3)");
  const modalScrollbarThumbHover = useColorModeValue("purple.300", "rgba(124,58,237,0.5)");

  // ── modal-orange ─────────────────────────────────────────────────────────
  // Matches TransferRotationModal: accent orange #EA580C / #F59E0B
  const orangeButtonBg        = useColorModeValue("orange.50",  "rgba(234,88,12,0.12)");
  const orangeBorderColor     = useColorModeValue("orange.200", "rgba(234,88,12,0.35)");
  const orangeMenuBg          = useColorModeValue("white",      "#1a1b2e");
  const orangeHoverItemBg     = useColorModeValue("orange.50",  "rgba(234,88,12,0.15)");
  const orangeGroupHeaderBg   = useColorModeValue("orange.100", "rgba(234,88,12,0.10)");
  const orangeScrollbarThumb  = useColorModeValue("orange.200", "rgba(234,88,12,0.30)");
  const orangeScrollbarThumbHover = useColorModeValue("orange.300", "rgba(234,88,12,0.50)");

  if (variant === "ghost") {
    return {
      buttonBg: ghostButtonBg,
      borderColor: ghostBorderColor,
      hoverBorderColor: ghostHoverBorderColor,
      menuBg: ghostMenuBg,
      menuBorderColor: ghostBorderColor,
      hoverItemBg: ghostHoverItemBg,
      groupHeaderBg: ghostGroupHeaderBg,
      scrollbarThumb: ghostScrollbarThumb,
      scrollbarThumbHover: ghostScrollbarThumbHover,
    };
  }

  if (variant === "modal") {
    return {
      buttonBg: modalButtonBg,
      borderColor: modalBorderColor,
      hoverBorderColor: modalHoverBorderColor,
      menuBg: modalMenuBg,
      menuBorderColor: modalBorderColor,
      hoverItemBg: modalHoverItemBg,
      groupHeaderBg: modalGroupHeaderBg,
      scrollbarThumb: modalScrollbarThumb,
      scrollbarThumbHover: modalScrollbarThumbHover,
    };
  }

  if (variant === "modal-orange") {
    return {
      buttonBg: orangeButtonBg,
      borderColor: orangeBorderColor,
      hoverBorderColor: orangeBorderColor,
      menuBg: orangeMenuBg,
      menuBorderColor: orangeBorderColor,
      hoverItemBg: orangeHoverItemBg,
      groupHeaderBg: orangeGroupHeaderBg,
      scrollbarThumb: orangeScrollbarThumb,
      scrollbarThumbHover: orangeScrollbarThumbHover,
    };
  }

  return {
    buttonBg: defaultButtonBg,
    borderColor: defaultBorderColor,
    hoverBorderColor: defaultHoverBorderColor,
    menuBg: defaultMenuBg,
    menuBorderColor: defaultBorderColor,
    hoverItemBg: defaultHoverItemBg,
    groupHeaderBg: defaultGroupHeaderBg,
    scrollbarThumb: defaultScrollbarThumb,
    scrollbarThumbHover: defaultScrollbarThumbHover,
  };
};
