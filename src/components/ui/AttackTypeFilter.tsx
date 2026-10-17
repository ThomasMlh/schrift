import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  Text
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { AttackTypeBadge } from "./AttackTypeBadge";
import { useTranslation } from "react-i18next";
import { useSelectTheme, type SelectVariant } from "@/hooks/useSelectTheme";

interface AttackTypeFilterProps {
  selectedAttackType: string;
  onAttackTypeChange: (attackType: string) => void;
  variant?: SelectVariant;
}

export const AttackTypeFilter = ({
  selectedAttackType,
  onAttackTypeChange,
  variant = 'default'
}: AttackTypeFilterProps) => {
  const { t } = useTranslation();
  const theme = useSelectTheme(variant);

  const getDisplayText = (type: string) => {
    switch (type) {
      case "R":
        return t("components.charactersTable.attackRed");
      case "B":
        return t("components.charactersTable.attackBlue");
      default:
        return t("components.charactersTable.attackAll");
    }
  };

  return (
    <Menu matchWidth>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        w="100%"
        minW={0}
        sx={{ "& > span:first-of-type": { minW: 0, overflow: "hidden" } }}
        h="40px"
        justifyContent="space-between"
        bg={theme.buttonBg}
        borderColor={theme.borderColor}
        _hover={{ borderColor: theme.hoverBorderColor }}
        _focus={{
          borderColor: "blue.500",
          boxShadow: "0 0 0 1px #3182ce"
        }}
      >
        <HStack spacing={2} minW={0}>
          <AttackTypeBadge attackType={selectedAttackType} size="16px" />
          <Text fontSize="sm" noOfLines={1}>{getDisplayText(selectedAttackType)}</Text>
        </HStack>
      </MenuButton>
      <MenuList maxH="200px" overflowY="auto" bg={theme.menuBg} borderColor={theme.menuBorderColor}>
        <MenuItem bg={theme.menuBg} _hover={{ bg: theme.hoverItemBg }} onClick={() => onAttackTypeChange("")}>
          <HStack spacing={2}>
            <AttackTypeBadge attackType="" size="16px" />
            <Text fontSize="sm">{t("components.charactersTable.attackAll")}</Text>
          </HStack>
        </MenuItem>
        <MenuItem bg={theme.menuBg} _hover={{ bg: theme.hoverItemBg }} onClick={() => onAttackTypeChange("R")}>
          <HStack spacing={2}>
            <AttackTypeBadge attackType="R" size="16px" />
            <Text fontSize="sm">{t("components.charactersTable.attackRed")}</Text>
          </HStack>
        </MenuItem>
        <MenuItem bg={theme.menuBg} _hover={{ bg: theme.hoverItemBg }} onClick={() => onAttackTypeChange("B")}>
          <HStack spacing={2}>
            <AttackTypeBadge attackType="B" size="16px" />
            <Text fontSize="sm">{t("components.charactersTable.attackBlue")}</Text>
          </HStack>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
