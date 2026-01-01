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
import { AffinityIcon } from "./AffinityIcon";

interface AffinityFilterProps {
  selectedAffinity: string;
  affinities: string[];
  onAffinityChange: (affinity: string) => void;
}

export const AffinityFilter = ({
  selectedAffinity,
  affinities,
  onAffinityChange
}: AffinityFilterProps) => {
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
          {selectedAffinity ? (
            <>
              <AffinityIcon affinity={selectedAffinity} size="20px" />
              <Text fontSize="sm">{selectedAffinity}</Text>
            </>
          ) : (
            <>
              <AffinityIcon affinity={"Goton"} size="20px" />
              <Text fontSize="sm">Toutes les affinités</Text>
            </>
          )}
        </HStack>
      </MenuButton>
      <MenuList maxH="200px" overflowY="auto">
        <MenuItem onClick={() => onAffinityChange("")}>
          <HStack spacing={2}>
            <AffinityIcon affinity={"Goton"} size="20px" />
            <Text fontSize="sm">Toutes les affinités</Text>
          </HStack>
        </MenuItem>
        {affinities.map((affinity) => (
          <MenuItem key={affinity} onClick={() => onAffinityChange(affinity)}>
            <HStack spacing={2}>
              <AffinityIcon affinity={affinity} size="20px" />
              <Text fontSize="sm">{affinity}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
