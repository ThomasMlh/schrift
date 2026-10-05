import { Box, useColorModeValue } from "@chakra-ui/react";
import { useId } from "react";
import type { AchievementTier } from "@/interfaces";
import { ICON_PATHS } from "./achievementCatalog";

interface AchievementBadgeProps {
  tier: AchievementTier;
  icon: string;
  locked?: boolean;
  size?: number;
  label?: string;
}

// Couleurs de chaque rareté : dégradé (sombre → clair), contour et couleur de l'icône
const TIER_STYLES: Record<AchievementTier, { stops: [string, string, string]; rim: string; ink: string }> = {
  bronze: { stops: ["#7A3E16", "#C77B43", "#F1BF93"], rim: "#5C2C0E", ink: "#4A230B" },
  silver: { stops: ["#5F6773", "#B9C1CC", "#F4F6F9"], rim: "#474D57", ink: "#353A42" },
  gold: { stops: ["#8A5C00", "#E0AE1C", "#FFF0A6"], rim: "#6B4700", ink: "#563900" },
  platinum: { stops: ["#4E5FA8", "#A9DDF7", "#F3DBFF"], rim: "#3A4785", ink: "#2C3566" },
};

const HEX_OUTER = "50,3 93,27 93,73 50,97 7,73 7,27";
const HEX_INNER = "50,13 84,32 84,68 50,87 16,68 16,32";

// Badge de succès en hexagone : la couleur donne la rareté, l'icône donne le succès. Un succès
// non obtenu est grisé avec un cadenas ; le platine a un reflet animé (coupé si l'utilisateur
// demande moins d'animations).
export const AchievementBadge = ({ tier, icon, locked = false, size = 64, label }: AchievementBadgeProps) => {
  const id = useId().replace(/:/g, "");
  const lockedA = useColorModeValue("#C9CDD8", "#3A3F52");
  const lockedB = useColorModeValue("#E6E8EF", "#2A2E3D");
  const lockedInk = useColorModeValue("#8D93A5", "#6E7489");
  const lockBg = useColorModeValue("#FFFFFF", "#1A202C");
  const lockBorder = useColorModeValue("#E2E8F0", "#2D3748");

  const style = TIER_STYLES[tier];
  const [dark, mid, light] = locked ? [lockedA, lockedB, lockedB] : style.stops;
  const rim = locked ? lockedA : style.rim;
  const ink = locked ? lockedInk : style.ink;

  return (
    <Box
      as="svg"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
      flexShrink={0}
      overflow="visible"
      sx={{
        "@keyframes achievementSheen": {
          "0%, 100%": { transform: "translateX(-70px)" },
          "50%": { transform: "translateX(70px)" },
        },
        ".achievement-sheen": { animation: "achievementSheen 3.2s ease-in-out infinite" },
        "@media (prefers-reduced-motion: reduce)": { ".achievement-sheen": { animation: "none", opacity: 0 } },
      }}
    >
      <defs>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".45" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={mid} />
          <stop offset="1" stopColor={light} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <polygon points={HEX_OUTER} />
        </clipPath>
      </defs>
      <polygon points={HEX_OUTER} fill={`url(#${id}-face)`} stroke={rim} strokeWidth="2.5" />
      <polygon points={HEX_INNER} fill={`url(#${id}-inner)`} stroke={rim} strokeOpacity=".45" strokeWidth="1.5" />
      {!locked && tier === "platinum" && (
        <g clipPath={`url(#${id}-clip)`}>
          <rect className="achievement-sheen" x="20" y="-20" width="22" height="140" transform="rotate(20 50 50)" fill={`url(#${id}-sheen)`} />
        </g>
      )}
      <g
        transform="translate(29 29) scale(1.75)"
        fill="none"
        stroke={ink}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: ICON_PATHS[icon] ?? ICON_PATHS.star }}
      />
      {locked && (
        <g transform="translate(66 64)">
          <circle cx="12" cy="12" r="13" fill={lockBg} stroke={lockBorder} />
          <g
            transform="translate(4.5 4) scale(.62)"
            fill="none"
            stroke={lockedInk}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            dangerouslySetInnerHTML={{ __html: ICON_PATHS.lock }}
          />
        </g>
      )}
    </Box>
  );
};
