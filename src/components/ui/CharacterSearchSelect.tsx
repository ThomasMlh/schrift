import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef } from "react";
import { AffinityIcon } from "./AffinityIcon";
import { useCharacters, useCharacter } from "../../hooks/useAPI";
import { bucketUrl } from "../../utils/apiRequest";

interface Character {
  _id: string;
  name: string;
  link?: string;
  image?: string;
  affinity?: string;
}

interface CharacterSearchSelectProps {
  value: string;
  onChange: (characterId: string) => void;
  placeholder?: string;
  size?: "sm" | "md";
  isDisabled?: boolean;
  excludeIds?: string[];
}

export const CharacterSearchSelect = ({
  value,
  onChange,
  placeholder = "Rechercher un personnage...",
  size = "md",
  isDisabled = false,
  excludeIds = [],
}: CharacterSearchSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const bgColor = "bg.elevated";
  const borderColor = "border.default";
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const menuBg = "bg.card";

  const { characters, isLoading } = useCharacters({
    limit: 50,
    searchQuery: searchTerm || undefined,
  });

  const { character: currentCharacter } = useCharacter(value || undefined);

  // Resolve the selected character on mount or when value changes
  useEffect(() => {
    if (value) {
      const found = characters.find((c) => c._id === value);
      if (found) {
        setSelectedCharacter(found);
      } else if (currentCharacter) {
        setSelectedCharacter(currentCharacter as Character);
      }
    } else {
      setSelectedCharacter(null);
    }
  }, [value, characters, currentCharacter]);

  const filteredCharacters = characters.filter((char) => !excludeIds.includes(char._id));

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (characterId: string) => {
    const selected = characters.find((c) => c._id === characterId);
    if (selected) {
      setSelectedCharacter(selected);
    }
    onChange(characterId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleInputFocus = () => {
    if (!isDisabled) {
      setIsOpen(true);
    }
  };

  return (
    <Box position="relative" ref={menuRef} w="100%">
      {selectedCharacter && !isOpen ? (
        <HStack
          p={size === "sm" ? 2 : 3}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          bg={bgColor}
          cursor={isDisabled ? "not-allowed" : "pointer"}
          onClick={() => !isDisabled && setIsOpen(true)}
          spacing={3}
          _hover={!isDisabled ? { borderColor: "gray.300" } : {}}
        >
          <Avatar
            size={size === "sm" ? "xs" : "sm"}
            src={`${bucketUrl}/characters/thumb/${selectedCharacter._id}.png`}
            name={selectedCharacter.name}
            bg="gray.200"
          />
          <Text fontSize={size === "sm" ? "sm" : "md"} flex={1}>
            {selectedCharacter.name}
          </Text>
          {selectedCharacter.affinity && (
            <AffinityIcon 
              affinity={selectedCharacter.affinity} 
              size={size === "sm" ? "16px" : "20px"} 
            />
          )}
        </HStack>
      ) : (
        <InputGroup size={size}>
          <InputLeftElement pointerEvents="none">
            {isLoading ? <Spinner size="sm" /> : <SearchIcon color="gray.400" />}
          </InputLeftElement>
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            isDisabled={isDisabled}
            bg={bgColor}
          />
        </InputGroup>
      )}

      {isOpen && !isDisabled && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1000}
          bg={menuBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          boxShadow="lg"
          maxH="300px"
          overflowY="auto"
          mt={1}
        >
          {isLoading ? (
            <Flex justify="center" p={4}>
              <Spinner size="sm" />
            </Flex>
          ) : filteredCharacters.length === 0 ? (
            <Text p={4} textAlign="center" color="gray.500" fontSize="sm">
              Aucun personnage trouvé
            </Text>
          ) : (
            <VStack spacing={0} align="stretch">
              {filteredCharacters.map((character) => (
                <HStack
                  key={character._id}
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  onClick={() => handleSelect(character._id)}
                  spacing={3}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  _last={{ borderBottom: "none" }}
                  justify="space-between"
                >
                  <HStack spacing={3} flex={1}>
                    <Avatar
                      size={size === "sm" ? "xs" : "sm"}
                      src={`${bucketUrl}/characters/thumb/${character._id}.png`}
                      name={character.name}
                      bg="gray.200"
                    />
                    <Text fontSize={size === "sm" ? "sm" : "md"}>{character.name}</Text>
                  </HStack>
                  {character.affinity && (
                    <AffinityIcon 
                      affinity={character.affinity} 
                      size={size === "sm" ? "16px" : "20px"} 
                    />
                  )}
                </HStack>
              ))}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};
