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

interface Character {
  _id: string;
  name: string;
  link?: string;
  image?: string;
  affinity?: string;
}

interface CharacterSearchSelectProps {
  characters: Character[];
  value: string;
  onChange: (characterId: string) => void;
  placeholder?: string;
  size?: "sm" | "md";
  isDisabled?: boolean;
  isLoading?: boolean;
}

export const CharacterSearchSelect = ({
  characters,
  value,
  onChange,
  placeholder = "Rechercher un personnage...",
  size = "md",
  isDisabled = false,
  isLoading = false,
}: CharacterSearchSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const menuBg = useColorModeValue("white", "gray.800");

  const selectedCharacter = characters.find((c) => c._id === value);

  // Filtrer les personnages selon la recherche
  const filteredCharacters = characters.filter((char) =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer le clic en dehors
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
      {/* Affichage quand un personnage est sélectionné */}
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
            src={selectedCharacter.link || selectedCharacter.image}
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
        /* Input de recherche */
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

      {/* Menu déroulant */}
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
                      src={character.link || character.image}
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
