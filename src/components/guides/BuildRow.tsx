import { Avatar, Badge, Box, Button, Flex, HStack, Icon, IconButton, Text, Tooltip, VStack } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { FiChevronRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { IBuild } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";
import { UserDisplay } from "../ui/UserDisplay";
import { AttackTypeBadge } from "../ui/AttackTypeBadge";
import { AlterationImage } from "../ui/AlterationImage";

interface BuildRowRotation {
  killer: string;
  attack: string;
  alteration: string;
}

interface BuildRowProps {
  build: IBuild;
  rotation?: BuildRowRotation;
  canEdit: boolean;
  onOpen: (build: IBuild) => void;
  onEdit: (build: IBuild, e: React.MouseEvent) => void;
}

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "";

const thumb = (id?: string) => (id ? `${bucketUrl}/characters/thumb/${id}.png` : undefined);

// Une ligne de la liste des builds : rotation à gauche, équipe au centre, auteur et actions à droite.
// Sur mobile, les trois zones s'empilent.
export const BuildRow = ({ build, rotation, canEdit, onOpen, onEdit }: BuildRowProps) => {
  const { t } = useTranslation();
  const team = [...(build.team ?? [])].sort((a, b) => a.position - b.position).slice(0, 3);

  return (
    <Flex
      role="button"
      tabIndex={0}
      onClick={() => onOpen(build)}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(build); }}
      direction={{ base: "column", md: "row" }}
      gap={{ base: 3, md: 5 }}
      align={{ base: "stretch", md: "center" }}
      px={{ base: 4, md: 5 }}
      py={4}
      cursor="pointer"
      transition="background 0.15s"
      _hover={{ bg: "bg.hover" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "purple.400", outlineOffset: "-2px" }}
    >
      {/* Rotation */}
      <Box w={{ md: "150px" }} flexShrink={0}>
        {rotation ? (
          <>
            <HStack spacing={2}>
              <AttackTypeBadge attackType={rotation.attack} size="12px" />
              <Text fontWeight="bold" color="text.strong" noOfLines={1}>
                {t(`factions.${rotation.killer}`, rotation.killer)}
              </Text>
            </HStack>
            {rotation.alteration && (
              <HStack spacing={1.5} mt={1}>
                <AlterationImage alteration={rotation.alteration} size="16px" />
                <Text fontSize="xs" color="text.muted">{t(`alterations.${rotation.alteration}`, rotation.alteration)}</Text>
              </HStack>
            )}
          </>
        ) : (
          <Text fontSize="sm" color="text.muted" fontStyle="italic">{t("components.rotationsBuildsGuide.titleAllBuilds")}</Text>
        )}
      </Box>

      {/* Équipe */}
      <Box flex={1} minW={0}>
        <HStack spacing={{ base: 3, md: 4 }} align="flex-start">
          {team.map((member) => (
            <VStack key={member.position} spacing={1} align="center" w={{ base: "72px", md: "84px" }} flexShrink={0}>
              <Box position="relative">
                <Tooltip label={member.character?.name || "?"} hasArrow>
                  <Avatar
                    size="lg"
                    borderRadius="xl"
                    src={thumb(member.character?._id)}
                    name={member.character?.name || "?"}
                    bg="bg.inset"
                  />
                </Tooltip>
                <Badge
                  position="absolute"
                  top="-6px"
                  left="-6px"
                  colorScheme="purple"
                  variant="solid"
                  borderRadius="full"
                  fontSize="2xs"
                  minW="18px"
                  textAlign="center"
                >
                  {member.position}
                </Badge>
              </Box>
              <Text fontSize="2xs" fontWeight="medium" color="text.body" noOfLines={1} textAlign="center" w="full">
                {member.character?.name || "?"}
              </Text>
              {member.links && member.links.length > 0 && (
                <HStack spacing={0.5} justify="center">
                  {member.links.slice(0, 3).map((link, i) => (
                    <Tooltip key={i} label={link.character?.name || "?"} hasArrow>
                      <Avatar
                        size="2xs"
                        src={thumb(link.character?._id)}
                        name={link.character?.name || "?"}
                        bg="bg.inset"
                        borderWidth="1px"
                        borderColor="border.subtle"
                      />
                    </Tooltip>
                  ))}
                </HStack>
              )}
            </VStack>
          ))}
        </HStack>
        {build.description && (
          <Text fontSize="sm" color="text.secondary" noOfLines={2} mt={2}>
            {build.description}
          </Text>
        )}
      </Box>

      {/* Auteur et actions */}
      <Flex
        w={{ md: "190px" }}
        flexShrink={0}
        direction={{ base: "row", md: "column" }}
        align={{ base: "center", md: "flex-end" }}
        justify="space-between"
        gap={2}
      >
        <VStack align={{ base: "flex-start", md: "flex-end" }} spacing={0} minW={0}>
          {build.user ? (
            <UserDisplay user={build.user} avatarSize="xs" textSize="sm" />
          ) : (
            <Text fontSize="sm" color="text.muted">{t("components.rotationsBuildsGuide.anonymous")}</Text>
          )}
          <Text fontSize="xs" color="text.muted">{formatDate(build.created_at)}</Text>
        </VStack>
        <HStack spacing={1}>
          {canEdit && (
            <Tooltip label={t("common.edit")} hasArrow>
              <IconButton
                aria-label={t("components.rotationsBuildsGuide.ariaEditBuild")}
                icon={<EditIcon />}
                size="sm"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onEdit(build, e); }}
              />
            </Tooltip>
          )}
          <Button size="sm" variant="ghost" colorScheme="purple" rightIcon={<Icon as={FiChevronRight} />}>
            {t("components.rotationsBuildsGuide.view")}
          </Button>
        </HStack>
      </Flex>
    </Flex>
  );
};
