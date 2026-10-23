import type { IconType } from "react-icons";
import {
  FiActivity, FiBarChart2, FiBell, FiBookOpen, FiCalendar, FiCrosshair, FiGift,
  FiGrid, FiHeart, FiImage, FiMessageSquare, FiSearch, FiShield, FiShuffle, FiSlash, FiTrendingDown, FiUserPlus, FiUsers,
} from "react-icons/fi";
import type { AdminPage } from "@/interfaces";

export type AdminTabGroup = "home" | "guilds" | "scores" | "players" | "content" | "communication";

// Navigation groups, in display order. "home" has no group title.
export const ADMIN_TAB_GROUPS: { key: AdminTabGroup; label: string }[] = [
  { key: "home", label: "" },
  { key: "guilds", label: "Guildes" },
  { key: "scores", label: "Scores" },
  { key: "players", label: "Joueurs" },
  { key: "content", label: "Contenu" },
  { key: "communication", label: "Communication" },
];

export interface AdminTab {
  key: AdminPage;
  label: string;
  icon: IconType;
  group: AdminTabGroup;
  // Admins only (otherwise also visible to leaders and officers)
  adminOnly?: boolean;
}

export const ADMIN_TABS: AdminTab[] = [
  { key: "overview", label: "Vue d'ensemble", icon: FiGrid, group: "home" },
  { key: "guilds", label: "Guildes", icon: FiShield, group: "guilds", adminOnly: true },
  { key: "draft", label: "Draft", icon: FiShuffle, group: "guilds", adminOnly: true },
  { key: "cycles", label: "Cycles", icon: FiCalendar, group: "scores", adminOnly: true },
  { key: "scores", label: "Scores", icon: FiBarChart2, group: "scores" },
  { key: "score-control", label: "Contrôle des scores", icon: FiSearch, group: "scores" },
  { key: "preparation", label: "Préparation", icon: FiCrosshair, group: "scores" },
  { key: "alerts", label: "Baisses de régime", icon: FiTrendingDown, group: "scores" },
  { key: "data-health", label: "Santé des données", icon: FiHeart, group: "scores", adminOnly: true },
  { key: "users", label: "Joueurs", icon: FiUsers, group: "players", adminOnly: true },
  { key: "banned", label: "Bannis", icon: FiSlash, group: "players", adminOnly: true },
  { key: "applications", label: "Candidatures", icon: FiUserPlus, group: "players", adminOnly: true },
  { key: "raffle", label: "Tombola", icon: FiGift, group: "players", adminOnly: true },
  { key: "guides", label: "Guides", icon: FiBookOpen, group: "content", adminOnly: true },
  { key: "images", label: "Images", icon: FiImage, group: "content", adminOnly: true },
  { key: "notifications", label: "Notifications", icon: FiBell, group: "communication" },
  { key: "activity", label: "Activité", icon: FiActivity, group: "communication" },
  { key: "messages", label: "Messages", icon: FiMessageSquare, group: "communication" },
];

export const getAdminTab = (key: AdminPage) => ADMIN_TABS.find((tab) => tab.key === key);

// Description shown under the title of sections that have no header of their own
export const ADMIN_SECTION_DESCRIPTIONS: Partial<Record<AdminPage, string>> = {
  guilds: "Créer, renommer, désactiver les guildes et gérer leurs membres.",
  draft: "Simuler une nouvelle répartition des joueurs, puis appliquer les mouvements entre guildes.",
  users: "Comptes Discord du site avec leurs comptes BBS, guildes et rôles ; modifier ou bannir un joueur.",
  banned: "Joueurs bannis du site, avec la raison et la possibilité de les débannir.",
  "data-health": "Tout ce qui fausse les classements ou casse une page : scores en double ou orphelins, rotations sans dates, réglages oubliés.",
  raffle: "Tickets de la tombola mensuelle de chaque guilde, tickets à saisir à la main, et tirage du lot en fin de mois.",
  applications: "Candidatures envoyées depuis la page Recrutement, et réglages de cette page.",
  notifications: "Salons Discord et types de notifications envoyés par le bot, pour le site et pour chaque guilde.",
  activity: "Journal de tout ce qui s'est passé sur le site : scores, guildes, cycles, bannissements…",
  messages: "Envoyer un message dans un salon Discord au nom du bot.",
};
