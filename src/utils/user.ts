export const formatRoleName = (role: string): string => {
  switch (role) {
    case "chef":
      return "Chef";
    case "sous-chef":
      return "Sous-Chef";
    case "membre":
      return "Membre";
    default:
      return "Inconnu";
  }
};
