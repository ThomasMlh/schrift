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
import { KillerIcon } from "./KillerIcon";
import { useTranslation } from "react-i18next";
import { useSelectTheme, type SelectVariant } from "@/hooks/useSelectTheme";

interface KillerFilterProps {
  selectedKiller: string;
  killers: string[];
  onKillerChange: (killer: string) => void;
  variant?: SelectVariant;
}

export const KillerFilter = ({ 
  selectedKiller, 
  killers, 
  onKillerChange,
  variant = 'default'
}: KillerFilterProps) => {
  const { t } = useTranslation();
  const theme = useSelectTheme(variant);
  return (
    <Menu>
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
          {selectedKiller ? (
            <>
              <KillerIcon killer={selectedKiller} size="20px" />
              <Text fontSize="sm" noOfLines={1}>{t(`factions.${selectedKiller}`, selectedKiller)}</Text>
            </>
          ) : (
            <>
              <KillerIcon killer={"Toutes"} size="20px" />
              <Text fontSize="sm" noOfLines={1}>{t("factions.allKillers")}</Text>
            </>
          )}
        </HStack>
      </MenuButton>
      <MenuList maxH="200px" overflowY="auto" bg={theme.menuBg} borderColor={theme.menuBorderColor}>
        <MenuItem bg={theme.menuBg} _hover={{ bg: theme.hoverItemBg }} onClick={() => onKillerChange("")}>
        <HStack spacing={2}>
          <KillerIcon killer={"Toutes"} size="20px" />
          <Text fontSize="sm">{t("factions.allKillers")}</Text>
          </HStack>
        </MenuItem>
        {killers.map(killer => (
          <MenuItem key={killer} bg={theme.menuBg} _hover={{ bg: theme.hoverItemBg }} onClick={() => onKillerChange(killer)}>
            <HStack spacing={2}>
              <KillerIcon killer={killer} size="20px" />
              <Text fontSize="sm">{t(`factions.${killer}`, killer)}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};