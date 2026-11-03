import { Badge, Box, Button, Center, Flex, HStack, IconButton, Image, Tag, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { memo, useCallback, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAccessories, useAccessoriesSubeffects, useCharacterCatalog, useSkills } from "@/hooks/useAPI";
import { bucketUrl } from "@/utils/apiRequest";
import { gameText } from "@/utils/gameText";
import { skillLabel } from "@/utils/skillText";
import type { IAccessory, IAlbumCharacter, ISkill } from "@/interfaces";
import { AffinityIcon } from "./AffinityIcon";
import { CharacterPickerModal } from "./CharacterPickerModal";
import { ItemPickerModal } from "./ItemPickerModal";

export interface TeamMemberAccessory {
  id_accessory: string;
  id_subeffect?: string;
}

export interface TeamMember {
  id_character: string;
  position: number;
  links: Array<{ id_character: string }>;
  skills?: string[];
  accessories?: TeamMemberAccessory[];
}

interface TeamMemberCardProps {
  member: TeamMember;
  usedCharacterIds: string[];
  onCharacterChange: (position: number, characterId: string) => void;
  onRemoveLink: (position: number, linkIndex: number) => void;
  // An index past the end of the list adds an entry
  onLinkChange: (position: number, linkIndex: number, characterId: string) => void;
  onSkillsChange: (position: number, skillIds: string[]) => void;
  onRemoveAccessory: (position: number, accessoryIndex: number) => void;
  onAccessoryChange: (position: number, accessoryIndex: number, accessory: TeamMemberAccessory) => void;
}

const MAX_LINKS = 3;
const MAX_SKILLS = 2;
const MAX_ACCESSORIES = 3;

// index: the link or accessory entry being chosen or replaced
type OpenPicker = { kind: "main" } | { kind: "link"; index: number } | { kind: "skill" } | { kind: "accessory"; index: number } | null;

interface CharacterSlotProps {
  characterId?: string;
  character?: IAlbumCharacter;
  size: string;
  emptyLabel: string;
  removeLabel: string;
  onOpen: () => void;
  onRemove?: () => void;
}

const CharacterSlot = ({ characterId, character, size, emptyLabel, removeLabel, onOpen, onRemove }: CharacterSlotProps) => {
  if (!characterId) {
    return (
      <Box as="button" type="button" display="block" w={size} aria-label={emptyLabel} title={emptyLabel} onClick={onOpen}>
        <Center
          aspectRatio={1}
          borderWidth="2px"
          borderStyle="dashed"
          borderColor="border.default"
          borderRadius="lg"
          color="text.muted"
          _hover={{ borderColor: "purple.400", color: "purple.400" }}
        >
          <AddIcon />
        </Center>
      </Box>
    );
  }

  const label = character?.version || character?.name || "?";
  return (
    <Box w={size} position="relative">
      <Box as="button" type="button" display="block" w="100%" title={label} onClick={onOpen}>
        <Box position="relative" aspectRatio={1} borderRadius="lg" overflow="hidden" bg="bg.inset" borderWidth="2px" borderColor="purple.400">
          <Box as="img" src={`${bucketUrl}/characters/thumb/${characterId}.png`} alt={label} w="100%" h="100%" objectFit="cover" />
          {character?.affinity && (
            <Box position="absolute" top="3px" left="3px"><AffinityIcon affinity={character.affinity} size="18px" /></Box>
          )}
        </Box>
        <Text mt={1} fontSize="2xs" lineHeight="short" color="text.secondary" noOfLines={2}>{label}</Text>
      </Box>
      <IconButton
        aria-label={removeLabel}
        icon={<CloseIcon boxSize="8px" />}
        size="xs"
        minW="20px"
        h="20px"
        borderRadius="full"
        colorScheme="red"
        position="absolute"
        top="-6px"
        right="-6px"
        onClick={onRemove}
      />
    </Box>
  );
};

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Text fontSize="sm" fontWeight="medium" mb={2}>{children}</Text>
);

const AccessoryThumb = ({ accessory }: { accessory: IAccessory }) => accessory.code ? (
  <Image
    src={`${bucketUrl}/accessories/${accessory.code}/thumb.png`}
    alt=""
    boxSize="36px"
    flexShrink={0}
    borderRadius="sm"
    objectFit="contain"
    fallback={<Box boxSize="36px" flexShrink={0} />}
  />
) : <Box boxSize="36px" flexShrink={0} />;

export const TeamMemberCard = memo(({
  member,
  usedCharacterIds,
  onCharacterChange,
  onRemoveLink,
  onLinkChange,
  onSkillsChange,
  onRemoveAccessory,
  onAccessoryChange,
}: TeamMemberCardProps) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { characters } = useCharacterCatalog();
  const { skills, isLoading: skillsLoading } = useSkills();
  const { accessories, isLoading: accessoriesLoading } = useAccessories();
  const { subeffects } = useAccessoriesSubeffects();
  const [picker, setPicker] = useState<OpenPicker>(null);
  const closePicker = () => setPicker(null);

  const characterById = useMemo(() => new Map(characters.map((c) => [c._id, c])), [characters]);
  const accessoryById = useMemo(() => new Map(accessories.map((a) => [a._id, a])), [accessories]);
  const skillById = useMemo(() => new Map(skills.map((s) => [s._id, s])), [skills]);

  const memberSkills = member.skills ?? [];
  const memberAccessories = member.accessories ?? [];
  const availableSkills = skills.filter((skill) => !memberSkills.includes(skill._id));
  const replacedAccessoryIndex = picker?.kind === "accessory" ? picker.index : -1;
  const availableAccessories = accessories.filter((accessory) => !memberAccessories.some(
    (worn, index) => index !== replacedAccessoryIndex && worn.id_accessory === accessory._id
  ));

  const accessoryName = useCallback((accessory: IAccessory) => gameText(accessory.names, language) || accessory.name, [language]);
  const accessoryEffect = useCallback((accessory: IAccessory) => gameText(accessory.effect?.text, language), [language]);
  const accessorySearchText = useCallback(
    (accessory: IAccessory) => [accessory.name, gameText(accessory.names, "en"), gameText(accessory.names, "fr"), accessoryEffect(accessory)].join(" "),
    [accessoryEffect],
  );
  const skillSearchText = useCallback((skill: ISkill) => [skill.name, gameText(skill.names, "en"), gameText(skill.names, "fr")].join(" "), []);

  const renderAccessoryOption = (accessory: IAccessory) => (
    <HStack spacing={3} align="flex-start">
      <AccessoryThumb accessory={accessory} />
      <Box minW={0}>
        <Text fontSize="sm" fontWeight="semibold">{accessoryName(accessory)}</Text>
        {accessoryEffect(accessory) && <Text fontSize="xs" color="text.secondary">{accessoryEffect(accessory)}</Text>}
      </Box>
    </HStack>
  );

  const handleCharacterPick = (characterId: string) => {
    if (picker?.kind === "main") onCharacterChange(member.position, characterId);
    if (picker?.kind === "link") onLinkChange(member.position, picker.index, characterId);
    closePicker();
  };

  const handleAccessoryPick = (accessory: IAccessory) => {
    if (picker?.kind !== "accessory") return;
    const current = memberAccessories[picker.index];
    onAccessoryChange(member.position, picker.index, { id_accessory: accessory._id, id_subeffect: current?.id_subeffect });
    closePicker();
  };

  const handleSkillPick = (skill: ISkill) => {
    onSkillsChange(member.position, [...memberSkills, skill._id]);
    closePicker();
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="xl" borderColor="border.default" bg="bg.muted">
      <VStack spacing={5} align="stretch">
        <Flex gap={8} wrap="wrap">
          <Box>
            <SectionTitle>{t("components.buildForm.mainCharacter")}</SectionTitle>
            <CharacterSlot
              characterId={member.id_character}
              character={characterById.get(member.id_character)}
              size="108px"
              emptyLabel={t("components.buildForm.pickCharacter")}
              removeLabel={t("components.buildForm.removeCharacter")}
              onOpen={() => setPicker({ kind: "main" })}
              onRemove={() => onCharacterChange(member.position, "")}
            />
          </Box>
          {member.id_character && (
            <Box>
              <SectionTitle>{t("components.buildForm.links", { count: member.links.length })}</SectionTitle>
              <HStack spacing={3} align="flex-start">
                {member.links.map((link, linkIndex) => (
                  <CharacterSlot
                    key={linkIndex}
                    characterId={link.id_character}
                    character={characterById.get(link.id_character)}
                    size="84px"
                    emptyLabel={t("components.buildForm.pickLink")}
                    removeLabel={t("components.buildForm.removeLink")}
                    onOpen={() => setPicker({ kind: "link", index: linkIndex })}
                    onRemove={() => onRemoveLink(member.position, linkIndex)}
                  />
                ))}
                {member.links.length < MAX_LINKS && (
                  <CharacterSlot
                    size="84px"
                    emptyLabel={t("components.buildForm.pickLink")}
                    removeLabel={t("components.buildForm.removeLink")}
                    onOpen={() => setPicker({ kind: "link", index: member.links.length })}
                  />
                )}
              </HStack>
            </Box>
          )}
        </Flex>

        {member.id_character && (
          <Box>
            <SectionTitle>{t("components.buildForm.skills")}</SectionTitle>
            <Wrap spacing={2} align="center">
              {memberSkills.map((skillId) => {
                const skill = skillById.get(skillId);
                return (
                  <WrapItem key={skillId}>
                    <Badge
                      as="button"
                      colorScheme="purple"
                      fontSize="xs"
                      px={3}
                      py={1}
                      borderRadius="full"
                      textTransform="none"
                      title={t("components.buildForm.removeSkill")}
                      onClick={() => onSkillsChange(member.position, memberSkills.filter((id) => id !== skillId))}
                    >
                      {skill ? skillLabel(skill, language) : "?"} ✕
                    </Badge>
                  </WrapItem>
                );
              })}
              {memberSkills.length < MAX_SKILLS && (
                <WrapItem>
                  <Button size="sm" leftIcon={<AddIcon />} variant="outline" onClick={() => setPicker({ kind: "skill" })}>
                    {t("components.buildForm.addSkill")}
                  </Button>
                </WrapItem>
              )}
            </Wrap>
          </Box>
        )}

        {member.id_character && (
          <Box>
            <SectionTitle>{t("components.buildForm.accessories", { count: memberAccessories.length })}</SectionTitle>
            <VStack spacing={2} align="stretch">
              {memberAccessories.map((worn, accIndex) => {
                const accessory = accessoryById.get(worn.id_accessory);
                return (
                  <Box key={accIndex} p={3} borderWidth="1px" borderColor="border.subtle" borderRadius="lg" bg="bg.elevated">
                    <HStack align="flex-start" spacing={2}>
                      <Box as="button" type="button" flex={1} minW={0} textAlign="left" onClick={() => setPicker({ kind: "accessory", index: accIndex })}>
                        {accessory ? renderAccessoryOption(accessory) : <Text fontSize="sm">?</Text>}
                      </Box>
                      <IconButton
                        aria-label={t("components.buildForm.removeAccessory")}
                        icon={<CloseIcon boxSize="8px" />}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => onRemoveAccessory(member.position, accIndex)}
                      />
                    </HStack>
                    <Text mt={3} mb={1} fontSize="xs" color="text.muted">{t("components.buildForm.subeffect")}</Text>
                    <Wrap spacing={1}>
                      {subeffects.map((subeffect) => {
                        const isSelected = worn.id_subeffect === subeffect._id;
                        return (
                          <WrapItem key={subeffect._id}>
                            <Tag
                              as="button"
                              size="sm"
                              borderRadius="full"
                              colorScheme={isSelected ? "teal" : "gray"}
                              variant={isSelected ? "solid" : "subtle"}
                              aria-pressed={isSelected}
                              onClick={() => onAccessoryChange(member.position, accIndex, {
                                id_accessory: worn.id_accessory,
                                id_subeffect: isSelected ? undefined : subeffect._id,
                              })}
                            >
                              {gameText(subeffect.names, language) || subeffect.name}
                            </Tag>
                          </WrapItem>
                        );
                      })}
                    </Wrap>
                  </Box>
                );
              })}
              {memberAccessories.length < MAX_ACCESSORIES && (
                <Button
                  size="sm"
                  alignSelf="flex-start"
                  leftIcon={<AddIcon />}
                  variant="outline"
                  onClick={() => setPicker({ kind: "accessory", index: memberAccessories.length })}
                >
                  {t("components.buildForm.addAccessory")}
                </Button>
              )}
            </VStack>
          </Box>
        )}
      </VStack>

      <CharacterPickerModal
        isOpen={picker?.kind === "main" || picker?.kind === "link"}
        onClose={closePicker}
        title={t(picker?.kind === "link" ? "components.buildForm.pickLink" : "components.buildForm.pickCharacter")}
        usedIds={usedCharacterIds}
        onPick={handleCharacterPick}
      />
      <ItemPickerModal
        isOpen={picker?.kind === "skill"}
        onClose={closePicker}
        title={t("components.buildForm.addSkill")}
        searchPlaceholder={t("components.buildForm.searchSkill")}
        emptyLabel={t("components.buildForm.noSkill")}
        items={availableSkills}
        isLoading={skillsLoading}
        getSearchText={skillSearchText}
        renderItem={(skill) => <Text fontSize="sm">{skillLabel(skill, language)}</Text>}
        onPick={handleSkillPick}
      />
      <ItemPickerModal
        isOpen={picker?.kind === "accessory"}
        onClose={closePicker}
        title={t("components.buildForm.addAccessory")}
        searchPlaceholder={t("components.buildForm.searchAccessory")}
        emptyLabel={t("components.buildForm.noAccessory")}
        items={availableAccessories}
        isLoading={accessoriesLoading}
        getSearchText={accessorySearchText}
        renderItem={renderAccessoryOption}
        onPick={handleAccessoryPick}
      />
    </Box>
  );
});
