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
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const borderColor = "border.default";
  const bgColor = "bg.muted";

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="xl"
      borderColor={borderColor}
      bg={bgColor}
    >
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between">
          <Badge colorScheme="purple">{t("components.buildForm.position", { position: member.position })}</Badge>
        </HStack>

        <FormControl isRequired={member.position === 1}>
          <FormLabel fontSize="sm">{t("components.buildForm.mainCharacter")}</FormLabel>
          <CharacterSearchSelect
            value={member.id_character}
            onChange={(characterId) => onCharacterChange(member.position, characterId)}
            placeholder={t("components.buildForm.searchCharacter")}
            excludeIds={excludedCharacterIds}
          />
        </FormControl>

        {member.links.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              {t("components.buildForm.links", { count: member.links.length })}
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
                      placeholder={t("components.buildForm.searchLink")}
                      size="sm"
                      excludeIds={excludedCharacterIds}
                    />
                  </Box>
                  <IconButton
                    aria-label={t("components.buildForm.removeLink")}
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
            {t("components.buildForm.addLink")}
          </Button>
        )}

        {member.id_character && (
          <FormControl>
            <FormLabel fontSize="sm">
              {t("components.buildForm.skills")}
            </FormLabel>
            <SkillSearchSelect
              value={member.skills || []}
              onChange={(skillIds) => onSkillsChange(member.position, skillIds)}
              placeholder={t("components.buildForm.searchSkill")}
              size="sm"
              maxSkills={2}
            />
          </FormControl>
        )}

        {member.id_character && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              {t("components.buildForm.accessories", { count: member.accessories?.length || 0 })}
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
                        excludeIds={getUsedAccessoryIds(member.position).filter(
                          (_, idx) => idx !== accIndex
                        )}
                      />
                    </Box>
                    <IconButton
                      aria-label={t("components.buildForm.removeAccessory")}
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
                {t("components.buildForm.addAccessory")}
              </Button>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
});