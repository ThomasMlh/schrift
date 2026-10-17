import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useAlbum } from "@/hooks/useAPI";

const STORAGE_KEY = "schrift.myAlbumAccount";
const NO_CHARACTERS: Record<string, number> = {};

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

// Album of the logged-in user's bbs account, the main one by default. The chosen account is
// remembered per browser for users with alts.
export const useMyAlbum = () => {
  const { currentUser } = useAuth();
  const [storedId, setStoredId] = useState(readStored);
  const accounts = currentUser?.bbs_accounts ?? [];
  const account = accounts.find((a) => a.bbs_id === storedId) ?? accounts.find((a) => a.is_primary) ?? accounts[0];
  const { album, isLoading } = useAlbum(account?.bbs_id);
  const owned = album?.characters ?? NO_CHARACTERS;

  const selectAccount = (bbsId: string) => {
    setStoredId(bbsId);
    try {
      localStorage.setItem(STORAGE_KEY, bbsId);
    } catch {
      // Storage unavailable: the choice only lasts for this page
    }
  };

  return {
    accounts,
    account,
    owned,
    hasAlbum: Object.keys(owned).length > 0,
    isLoading,
    selectAccount,
  };
};
