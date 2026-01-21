import {
  Box,
  VStack,
  HStack,
  Badge,
  FormControl,
  FormLabel,
  Button,
  IconButton,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { memo } from "react";
import { CharacterSearchSelect } from "./CharacterSearchSelect";
import { SkillSearchSelect } from "./SkillSearchSelect";
import { AccessorySearchSelect } from "./AccessorySearchSelect";

interface TeamMember {
  id_character: string;
  position: number;
  links: Array<{ id_character: string }>;
  skills?: string[];
  accessories?: Array<{ id_accessory: string; id_subeffect?: string }>;
}

interface TeamMemberCardProps {
  member: TeamMember;
  excludedCharacterIds: string[];
  onCharacterChange: (position: number, characterId: string) => void;
  onAddLink: (position: number) => void;
  onRemoveLink: (position: number, linkIndex: number) => void;
  onLinkChange: (position: number, linkIndex: number, characterId: string) => void;
  onSkillsChange: (position: number, skillIds: string[]) => void;
  onAddAccessory: (position: number) => void;
  onRemoveAccessory: (position: number, accessoryIndex: number) => void;
  onAccessoryChange: (
    position: number,
    accessoryIndex: number,
    accessory: { id_accessory: string; id_subeffect?: string }
  ) => void;
  getUsedAccessoryIds: (position: number) => string[];
}

export const TeamMemberCard = memo(({
  member,
  excludedCharacterIds,
  onCharacterChange,
  onAddLink,
  onRemoveLink,
  onLinkChange,
  onSkillsChange,
  onAddAccessory,
  onRemoveAccessory,
  onAccessoryChange,
  getUsedAccessoryIds,
}: TeamMemberCardProps) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.700");

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      bg={bgColor}
    >
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between">
          <Badge colorScheme="purple">Position {member.position}</Badge>
        </HStack>

        <FormControl isRequired={member.position === 1}>
          <FormLabel fontSize="sm">Personnage principal</FormLabel>
          <CharacterSearchSelect
            value={member.id_character}
            onChange={(characterId) => onCharacterChange(member.position, characterId)}
            placeholder="Rechercher un personnage..."
            excludeIds={excludedCharacterIds}
          />
        </FormControl>

        {/* Links */}
        {member.links.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Links ({member.links.length}/3)
            </Text>
            <VStack spacing={2} align="stretch">
              {member.links.map((link, linkIndex) => (
                <HStack key={linkIndex}>
                  <Box flex={1}>
                    <CharacterSearchSelect
                      value={link.id_character}
                      onChange={(characterId) =>
                        onLinkChange(member.position, linkIndex, characterId)
                      }
                      placeholder="Rechercher un link..."
                      size="sm"
                      excludeIds={excludedCharacterIds}
                    />
                  </Box>
                  <IconButton
                    aria-label="Supprimer le link"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => onRemoveLink(member.position, linkIndex)}
                  />
                </HStack>
              ))}
            </VStack>
          </Box>
        )}

        {member.links.length < 3 && member.id_character && (
          <Button
            size="sm"
            leftIcon={<AddIcon />}
            variant="outline"
            onClick={() => onAddLink(member.position)}
          >
            Ajouter un link
          </Button>
        )}

        {/* Skills */}
        {member.id_character && (
          <FormControl>
            <FormLabel fontSize="sm">
              Compétences bonus (optionnel, max 2)
            </FormLabel>
            <SkillSearchSelect
              value={member.skills || []}
              onChange={(skillIds) => onSkillsChange(member.position, skillIds)}
              placeholder="Rechercher une compétence..."
              size="sm"
              maxSkills={2}
            />
          </FormControl>
        )}

        {/* Accessories */}
        {member.id_character && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Accessoires ({(member.accessories?.length || 0)}/3)
            </Text>
            {member.accessories && member.accessories.length > 0 && (
              <VStack spacing={2} align="stretch" mb={2}>
                {member.accessories.map((accessory, accIndex) => (
                  <HStack key={accIndex} align="flex-start">
                    <Box flex={1}>
                      <AccessorySearchSelect
                        value={accessory}
                        onChange={(acc) =>
                          onAccessoryChange(member.position, accIndex, acc)
                        }
                        placeholder="Rechercher un accessoire..."
                        excludeIds={getUsedAccessoryIds(member.position).filter(
                          (_, idx) => idx !== accIndex
                        )}
                      />
                    </Box>
                    <IconButton
                      aria-label="Supprimer l'accessoire"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => onRemoveAccessory(member.position, accIndex)}
                      mt={6}
                    />
                  </HStack>
                ))}
              </VStack>
            )}
            {(member.accessories?.length || 0) < 3 && (
              <Button
                size="sm"
                leftIcon={<AddIcon />}
                variant="outline"
                onClick={() => onAddAccessory(member.position)}
              >
                Ajouter un accessoire
              </Button>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
});