import type { NotificationType } from "@/interfaces";

// Mirror of schrift-api/src/utils/notificationTypes.js: keep both lists in sync.
export const NOTIFICATION_TYPES: NotificationType[] = [
  "scores", "podium_snapshot", "score_edit", "rotation_transfer", "character_update", "image_upload",
  "ban", "draft", "guild_toggle", "build_proposal", "build_delete", "cycle_change",
  "guild_change", "membre_role_change", "guild_member_change", "personal_record", "cycle_recap",
  "achievement_unlock",
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
  cycle_recap: "Bilan de fin de cycle (salon membres)",
  achievement_unlock: "Succès or et platine débloqués (salon membres)",
};

// Events only shown in the activity log, never sent to Discord (mirror of ACTIVITY_ONLY_TYPES in the API)
const ACTIVITY_ONLY_TYPES = ["album_update"] as const;
type ActivityOnlyType = typeof ACTIVITY_ONLY_TYPES[number];

export const ACTIVITY_TYPES: (NotificationType | ActivityOnlyType)[] = [...NOTIFICATION_TYPES, ...ACTIVITY_ONLY_TYPES];

export const ACTIVITY_TYPE_LABELS: Record<NotificationType | ActivityOnlyType, string> = {
  ...NOTIFICATION_TYPE_LABELS,
  album_update: "Modification d'album",
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
    case "achievement_unlock": {
      const count = Array.isArray(data.unlocks) ? data.unlocks.length : 0;
      return `${count} succès débloqué(s)${data.guild_name ? ` dans **${fmt(data, "guild_name")}**` : ""}`;
    }
    case "album_update": {
      const count = (key: string) => (Array.isArray(data[key]) ? data[key].length : 0);
      const parts = [
        count("added") && `+${count("added")}`,
        count("removed") && `-${count("removed")}`,
        count("changed") && `${count("changed")} spé`,
      ].filter(Boolean).join(", ");
      const editor = fmt(data, "edited_by");
      const account = fmt(data, "bbs_name");
      const who = editor === account ? `**${account}** a modifié son album` : `${editor} a modifié l'album de **${account}**`;
      return parts ? `${who} (${parts})` : who;
    }
    case "cycle_recap":
      return `Bilan de fin de **${fmt(data, "cycle_name")}** publié${data.guild_name ? ` pour **${fmt(data, "guild_name")}**` : ""}`;
    default:
      return `${type} : ${fmt(data, "message", JSON.stringify(data).slice(0, 120))}`;
  }
};
