// Styles communs des onglets de la page joueur
export const userTabStyles = {
  fontWeight: "semibold",
  fontSize: "md",
  px: 6,
  py: 3,
  borderRadius: "lg",
  border: "2px solid",
  borderColor: "gray.300",
  bg: "gray.100",
  color: "gray.700",
  _dark: {
    borderColor: "gray.500",
    bg: "gray.700",
    color: "gray.200"
  },
  _selected: {
    bg: "blue.600",
    color: "white",
    borderColor: "blue.600",
    boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.3)",
    _dark: {
      bg: "blue.600",
      color: "white",
      borderColor: "blue.600"
    }
  },
  _hover: {
    borderColor: "blue.400",
    bg: "blue.50",
    color: "blue.700",
    transform: "translateY(-2px)",
    _dark: {
      bg: "gray.600",
      color: "white"
    }
  },
  transition: "all 0.2s"
};
