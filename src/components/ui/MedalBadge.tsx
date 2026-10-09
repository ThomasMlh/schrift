import { Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const MEDALS = {
  1: { light: "#FFE680", base: "#F5C518", dark: "#B8860B", ribbon: "#7C3AED" },
  2: { light: "#F4F4F5", base: "#C0C0C0", dark: "#8A8A8F", ribbon: "#4F46E5" },
  3: { light: "#F0B27A", base: "#CD7F32", dark: "#8B4F1D", ribbon: "#2563EB" },
} as const;

interface MedalBadgeProps {
  rank: 1 | 2 | 3;
  size?: number;
}

/** Médaille dessinée (ruban + disque gravé du rang), sans dépendre d'une police d'emoji. */
export const MedalBadge = ({ rank, size = 28 }: MedalBadgeProps) => {
  const { t } = useTranslation();
  const c = MEDALS[rank];
  const id = `medal-${rank}`;

  return (
    <Box as="span" display="inline-flex" title={t("components.podiumPedestal.medal", { rank })}>
      <svg width={size} height={size * 1.25} viewBox="0 0 32 40" role="img" aria-label={t("components.podiumPedestal.medal", { rank })}>
        <defs>
          <radialGradient id={id} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={c.light} />
            <stop offset="55%" stopColor={c.base} />
            <stop offset="100%" stopColor={c.dark} />
          </radialGradient>
        </defs>
        {/* Ruban */}
        <path d="M8 0h7l3 13h-7z" fill={c.ribbon} />
        <path d="M24 0h-7l-3 13h7z" fill={c.ribbon} opacity="0.75" />
        {/* Disque */}
        <circle cx="16" cy="25" r="13" fill={`url(#${id})`} stroke={c.dark} strokeWidth="1.5" />
        <circle cx="16" cy="25" r="9.5" fill="none" stroke={c.light} strokeOpacity="0.6" strokeWidth="1" />
        <text
          x="16"
          y="29.5"
          textAnchor="middle"
          fontSize="13"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill={c.dark}
        >
          {rank}
        </text>
      </svg>
    </Box>
  );
};
