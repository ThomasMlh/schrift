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

interface AttackTypeFilterProps {
  selectedAttackType: string;
  onAttackTypeChange: (attackType: string) => void;
}

export const AttackTypeFilter = ({
  selectedAttackType,
  onAttackTypeChange
}: AttackTypeFilterProps) => {
  const { t } = useTranslation();

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
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        maxW="300px"
        w="auto"
        h="40px"
        justifyContent="space-between"
        bg="white"
        borderColor="gray.200"
        _dark={{
          bg: "gray.800",
          borderColor: "gray.600"
        }}
        _hover={{
          borderColor: "gray.300",
          _dark: { borderColor: "gray.500" }
        }}
        _focus={{
          borderColor: "blue.500",
          boxShadow: "0 0 0 1px #3182ce"
        }}
      >
        <HStack spacing={2}>
          <AttackTypeBadge attackType={selectedAttackType} size="16px" />
          <Text fontSize="sm">{getDisplayText(selectedAttackType)}</Text>
        </HStack>
      </MenuButton>
      <MenuList maxH="200px" overflowY="auto">
        <MenuItem onClick={() => onAttackTypeChange("")}>
          <HStack spacing={2}>
            <AttackTypeBadge attackType="" size="16px" />
            <Text fontSize="sm">{t("components.charactersTable.attackAll")}</Text>
          </HStack>
        </MenuItem>
        <MenuItem onClick={() => onAttackTypeChange("R")}>
          <HStack spacing={2}>
            <AttackTypeBadge attackType="R" size="16px" />
            <Text fontSize="sm">{t("components.charactersTable.attackRed")}</Text>
          </HStack>
        </MenuItem>
        <MenuItem onClick={() => onAttackTypeChange("B")}>
          <HStack spacing={2}>
            <AttackTypeBadge attackType="B" size="16px" />
            <Text fontSize="sm">{t("components.charactersTable.attackBlue")}</Text>
          </HStack>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
