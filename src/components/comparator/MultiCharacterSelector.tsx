import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useState, useRef, useEffect } from "react";
import { SelectionSlots } from "./SelectionSlots";
import { useTranslation } from "react-i18next";
import { useCharacters } from "@/hooks/useAPI";
import { AffinityIcon } from "../ui/AffinityIcon";
import { AttackTypeBadge } from "../ui/AttackTypeBadge";
import type { ICharacter } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";

const DEFAULT_COLORS = ["#3182CE", "#38A169", "#DD6B20", "#9F7AEA", "#E53E3E"];

export interface SelectedCharacter {
  id: string;
  character: ICharacter;
}

interface MultiCharacterSelectorProps {
  selectedCharacters: SelectedCharacter[];
  onAddCharacter: (id: string, character: ICharacter) => void;
  onRemoveCharacter: (id: string) => void;
  maxCharacters?: number;
  entityColors?: string[];
}

export const MultiCharacterSelector = ({
  selectedCharacters,
  onAddCharacter,
  onRemoveCharacter,
  maxCharacters = 5,
  entityColors = DEFAULT_COLORS,
}: MultiCharacterSelectorProps) => {
  const bgColor = "bg.card";
  const borderColor = "border.subtle";
  const mutedText = "text.muted";
  const hoverBg = "bg.muted";
  const menuBg = "bg.card";

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const { characters, isLoading } = useCharacters({
    searchQuery: searchTerm || undefined,
    limit: 30,
  });

  const filtered = characters.filter(
    (c) => !selectedCharacters.some((s) => s.id === c._id)
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (character: ICharacter) => {
    if (selectedCharacters.length < maxCharacters) {
      onAddCharacter(character._id, character);
      setSearchTerm("");
      setIsOpen(false);
    }
  };

  return (
    <SelectionSlots
      title={t("components.multiCharacterSelector.heading")}
      max={maxCharacters}
      onRemove={onRemoveCharacter}
      removeLabel={t("components.multiCharacterSelector.ariaRemove")}
      addLabel={t("components.multiCharacterSelector.addLabel")}
      addFieldId="comparator-add-character"
      items={selectedCharacters.map((sc, index) => ({
        id: sc.id,
        color: entityColors[index % entityColors.length],
        content: (
          <HStack spacing={2}>
            <Avatar size="xs" src={`${bucketUrl}/characters/thumb/${sc.id}.png`} name={sc.character.name} bg="gray.200" />
            <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{sc.character.name}</Text>
            {sc.character.affinity && <AffinityIcon affinity={sc.character.affinity} size="14px" />}
            {sc.character.attack_type && <AttackTypeBadge attackType={sc.character.attack_type} size="12px" />}
          </HStack>
        ),
      }))}
    >
          <Box position="relative" ref={menuRef}>
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                {isLoading && isOpen ? <Spinner size="xs" /> : <SearchIcon color="gray.400" boxSize={3} />}
              </InputLeftElement>
              <Input
                placeholder={t("components.multiCharacterSelector.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                borderRadius="lg"
                bg={bgColor}
              />
            </InputGroup>

            {isOpen && (
              <Box
                position="absolute"
                top="100%"
                left={0}
                right={0}
                zIndex={1000}
                bg={menuBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="lg"
                boxShadow="lg"
                maxH="260px"
                overflowY="auto"
                mt={1}
              >
                {isLoading ? (
                  <Flex justify="center" p={4}>
                    <Spinner size="sm" />
                  </Flex>
                ) : filtered.length === 0 ? (
                  <Text p={4} textAlign="center" color={mutedText} fontSize="sm">
                    {searchTerm ? t("components.multiCharacterSelector.noResults") : t("components.multiCharacterSelector.typeToSearch")}
                  </Text>
                ) : (
                  <VStack spacing={0} align="stretch">
                    {filtered.map((character) => (
                      <HStack
                        key={character._id}
                        p={2.5}
                        cursor="pointer"
                        _hover={{ bg: hoverBg }}
                        onClick={() => handleSelect(character)}
                        spacing={3}
                        borderBottom="1px solid"
                        borderColor={borderColor}
                        _last={{ borderBottom: "none" }}
                        justify="space-between"
                      >
                        <HStack spacing={2.5} flex={1} minW={0}>
                          <Avatar
                            size="xs"
                            src={`${bucketUrl}/characters/thumb/${character._id}.png`}
                            name={character.name}
                            bg="gray.200"
                            flexShrink={0}
                          />
                          <Text fontSize="sm" noOfLines={1}>{character.name}</Text>
                        </HStack>
                        <HStack spacing={1.5} flexShrink={0}>
                          {character.affinity && (
                            <AffinityIcon affinity={character.affinity} size="14px" />
                          )}
                          {character.attack_type && (
                            <AttackTypeBadge attackType={character.attack_type} size="14px" />
                          )}
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>
            )}
          </Box>
    </SelectionSlots>
  );
};
