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

interface KillerFilterProps {
  selectedKiller: string;
  killers: string[];
  onKillerChange: (killer: string) => void;
}

export const KillerFilter = ({ 
  selectedKiller, 
  killers, 
  onKillerChange 
}: KillerFilterProps) => {
  const { t } = useTranslation();
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
          {selectedKiller ? (
            <>
              <KillerIcon killer={selectedKiller} size="20px" />
              <Text fontSize="sm">{t(`factions.${selectedKiller}`, selectedKiller)}</Text>
            </>
          ) : (
            <>
              <KillerIcon killer={"Toutes"} size="20px" />
              <Text fontSize="sm">{t("factions.allKillers")}</Text>
            </>
          )}
        </HStack>
      </MenuButton>
      <MenuList maxH="200px" overflowY="auto">
        <MenuItem onClick={() => onKillerChange("")}>
        <HStack spacing={2}>
          <KillerIcon killer={"Toutes"} size="20px" />
          <Text fontSize="sm">{t("factions.allKillers")}</Text>
          </HStack>
        </MenuItem>
        {killers.map(killer => (
          <MenuItem key={killer} onClick={() => onKillerChange(killer)}>
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