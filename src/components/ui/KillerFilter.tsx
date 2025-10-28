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
  return (
    <Menu>
      <MenuButton 
        as={Button} 
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        maxW="180px"
        w="180px"
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
              <KillerIcon killer={selectedKiller} size="24px" />
              <Text fontSize="sm">{selectedKiller}</Text>
            </>
          ) : (
            <Text fontSize="sm">Tous les tueurs</Text>
          )}
        </HStack>
      </MenuButton>
      <MenuList maxH="200px" overflowY="auto">
        <MenuItem onClick={() => onKillerChange("")}>
          <Text fontSize="sm">Tous les tueurs</Text>
        </MenuItem>
        {killers.map(killer => (
          <MenuItem key={killer} onClick={() => onKillerChange(killer)}>
            <HStack spacing={2}>
              <KillerIcon killer={killer} size="20px" />
              <Text fontSize="sm">{killer}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};