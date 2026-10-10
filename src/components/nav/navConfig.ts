import type { IconType } from "react-icons";
import {
  FiAward,
  FiBookOpen,
  FiHome,
  FiRefreshCw,
  FiSettings,
  FiShield,
  FiUsers,
  FiBell,
} from "react-icons/fi";
import { LuSwords, LuBookMarked } from "react-icons/lu";

export type NavGroup = "explore" | "compete" | "resources";

export interface NavItem {
  labelKey: string;
  path: string;
  icon: IconType;
  group: NavGroup;
  // Affiché directement dans la barre du haut (sinon dans le menu « Plus »)
  primary?: boolean;
  adminOrGuildManagerOnly?: boolean;
  // Lien présent seulement dans le pied de page
  footerOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.home", path: "/", icon: FiHome, group: "explore", primary: true },
  { labelKey: "nav.guilds", path: "/guildes", icon: FiShield, group: "explore", primary: true },
  { labelKey: "nav.characters", path: "/personnages", icon: FiBookOpen, group: "explore", primary: true },
  { labelKey: "nav.cycles", path: "/cycles", icon: FiRefreshCw, group: "explore", primary: true },
  { labelKey: "nav.players", path: "/joueurs", icon: FiUsers, group: "explore", primary: true },
  { labelKey: "nav.podium", path: "/podium", icon: FiAward, group: "compete", primary: true },
  { labelKey: "nav.comparator", path: "/comparateur", icon: LuSwords, group: "compete" },
  { labelKey: "nav.guides", path: "/guides", icon: LuBookMarked, group: "resources" },
  { labelKey: "nav.annonces", path: "/annonce", icon: FiBell, group: "resources", footerOnly: true },
  { labelKey: "nav.admin", path: "/admin", icon: FiSettings, group: "resources", adminOrGuildManagerOnly: true },
];

export const NAV_GROUP_LABELS: Record<NavGroup, string> = {
  explore: "nav.groupExplore",
  compete: "nav.groupCompete",
  resources: "nav.groupResources",
};

export const isActivePath = (pathname: string, path: string) =>
  path === "/" ? pathname === "/" : pathname.startsWith(path);

// Gradient de la marque, repris par le logo et le bouton de connexion
export const BRAND_GRADIENT = "linear(to-br, #7C3AED, #4F46E5)";
