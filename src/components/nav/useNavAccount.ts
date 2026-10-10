import { useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { buildPlayerUrl } from "@/utils/playerUrl";

// Données du compte connecté partagées par le menu avatar et le menu mobile
export const useNavAccount = () => {
  const { currentUser, isLoggedIn, isAdmin, isGuildManager, logout } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();

  // Pseudo Discord, à défaut le nom d'utilisateur ou le compte de jeu
  const displayName = currentUser?.global_name || currentUser?.username || currentUser?.bbs_name || t("nav.myProfile");
  const roleLabel = isAdmin ? t("nav.roleAdmin") : isGuildManager ? t("nav.roleGuildManager") : t("nav.roleMember");
  const profileUrl = buildPlayerUrl(currentUser?.bbs_name, currentUser?.bbs_id);
  const canSeeAdmin = isAdmin || isGuildManager;

  const handleLogout = () => {
    logout();
    toast({
      title: t("auth.logoutSuccess"),
      description: t("auth.logoutDescription"),
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return {
    isLoggedIn,
    isAdmin,
    canSeeAdmin,
    avatar: currentUser?.avatar,
    displayName,
    roleLabel,
    profileUrl,
    handleLogout,
  };
};
