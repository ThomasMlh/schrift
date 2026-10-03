import type { NotificationType } from "@/interfaces";

// Miroir de schrift-api/src/utils/notificationTypes.js — garder les deux listes synchronisées.
export const NOTIFICATION_TYPES: NotificationType[] = [
  "scores", "podium_snapshot", "score_edit", "rotation_transfer", "character_update", "image_upload",
  "ban", "draft", "guild_toggle", "build_proposal", "build_delete", "cycle_change",
  "guild_change", "membre_role_change", "guild_member_change", "personal_record",
];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  scores: "Saisie de scores",
  podium_snapshot: "Capture du podium (salon membres)",
  score_edit: "Modification de score",
  rotation_transfer: "Transfert de rotation",
  character_update: "Sync personnages",
  image_upload: "Upload d'images",
  ban: "Bannissement / débannissement",
  draft: "Draft / déplacement de joueur",
  guild_toggle: "Activation / désactivation de guilde",
  build_proposal: "Proposition de build",
  build_delete: "Suppression de build",
  cycle_change: "Création / modification / suppression de cycle",
  guild_change: "Création / renommage / suppression de guilde",
  membre_role_change: "Changement de rôle de membre",
  guild_member_change: "Ajout / retrait de membre",
  personal_record: "Record personnel battu (salon membres)",
};

const fmt = (data: Record<string, unknown>, key: string, fallback = "?"): string =>
  typeof data[key] === "string" || typeof data[key] === "number" ? String(data[key]) : fallback;

export const formatActivityEntry = (type: string, data: Record<string, unknown>): string => {
  switch (type) {
    case "guild_change": {
      const action = data.action;
      if (action === "create") return `Guilde **${fmt(data, "guild_name")}** créée`;
      if (action === "delete") return `Guilde **${fmt(data, "guild_name")}** supprimée`;
      return `Guilde **${fmt(data, "old_name")}** renommée en **${fmt(data, "guild_name")}**`;
    }
    case "guild_member_change": {
      const action = data.action;
      return action === "leave"
        ? `**${fmt(data, "username")}** a quitté **${fmt(data, "guild_name")}**`
        : `**${fmt(data, "username")}** a rejoint **${fmt(data, "guild_name")}**${data.role ? ` (${fmt(data, "role")})` : ""}`;
    }
    case "membre_role_change":
      return `**${fmt(data, "membre_name")}** : ${fmt(data, "old_role")} → **${fmt(data, "new_role")}**${data.guild_name ? ` (${fmt(data, "guild_name")})` : ""}`;
    case "guild_toggle":
      return `Guilde **${fmt(data, "guild_name")}** ${data.action === "enable" ? "réactivée" : "désactivée"} par ${fmt(data, "toggled_by")}`;
    case "ban":
      return `${fmt(data, "banned_by")} a ${data.action === "unban" ? "débanni" : "banni"} **${fmt(data, "banned_user")}**`;
    case "cycle_change":
      return `Cycle **${fmt(data, "cycle_name")}** ${data.action === "create" ? "créé" : data.action === "delete" ? "supprimé" : "modifié"}`;
    case "scores":
      return `${fmt(data, "submitted_by")} a saisi des scores${data.guild_name ? ` pour **${fmt(data, "guild_name")}**` : ""}`;
    case "podium_snapshot":
      return `Podium capturé${data.guild_name ? ` pour **${fmt(data, "guild_name")}**` : ""}`;
    case "score_edit":
      return `${fmt(data, "submitted_by")} a modifié le score de **${fmt(data, "pseudo")}**`;
    case "rotation_transfer":
      return `${fmt(data, "submitted_by")} a transféré ${fmt(data, "transferred_count")} score(s) vers **${fmt(data, "target_rotation")}**`;
    case "character_update":
      return `Synchronisation personnages — ${fmt(data, "message", "")}`;
    case "image_upload":
      return `Upload d'images — ${fmt(data, "message", "")}`;
    case "build_proposal":
      return `${fmt(data, "proposed_by")} a proposé un build`;
    case "build_delete":
      return `${fmt(data, "proposed_by")} a supprimé un build`;
    case "draft":
      return `Draft — ${fmt(data, "guild_name")}`;
    case "personal_record": {
      const count = Array.isArray(data.records) ? data.records.length : 0;
      return `${count} record(s) personnel(s) battu(s)${data.guild_name ? ` dans **${fmt(data, "guild_name")}**` : ""}`;
    }
    default:
      return `${type} : ${fmt(data, "message", JSON.stringify(data).slice(0, 120))}`;
  }
};
