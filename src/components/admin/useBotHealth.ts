import { useCallback, useEffect, useState } from "react";
import { useAdminMutations } from "@/hooks/mutations/useAdminMutations";

export type BotStatus = "checking" | "online" | "offline" | "unknown";

export interface BotHealth {
  status: BotStatus;
  detail?: string;
  checkedAt: Date | null;
  check: () => Promise<void>;
}

// État du bot Discord, vérifié automatiquement à l'ouverture (admins uniquement : la route
// /admin/bot-health leur est réservée) puis à la demande.
export const useBotHealth = (enabled: boolean): BotHealth => {
  const { checkBotHealth } = useAdminMutations();
  const [status, setStatus] = useState<BotStatus>(enabled ? "checking" : "unknown");
  const [detail, setDetail] = useState<string>();
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const check = useCallback(async () => {
    setStatus("checking");
    try {
      const data = await checkBotHealth();
      setStatus(data.online ? "online" : "offline");
      setDetail(data.online
        ? `status: ${data.data?.status ?? "?"} · bot: ${data.data?.bot ?? "?"}`
        : data.error === "timeout" ? "Timeout (5s)" : data.error || "Aucune réponse");
    } catch (err: unknown) {
      setStatus("offline");
      setDetail((err as Error).message || "Erreur vérification bot");
    } finally {
      setCheckedAt(new Date());
    }
  // checkBotHealth est recréée à chaque rendu par useAdminMutations : on ne la met pas en dépendance
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (enabled) void check();
  }, [enabled, check]);

  return { status, detail, checkedAt, check };
};
