import { AspectRatio, Badge, Box, Divider, Flex, HStack, Image, Tag, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { bucketUrl } from "@/utils/apiRequest";
import { gameText } from "@/utils/gameText";
import { skillLabel } from "@/utils/skillText";
import type { IBuildLink, IBuildTeamMember } from "@/interfaces";
import { AffinityIcon } from "./AffinityIcon";

const CardSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box p={3}>
    <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" letterSpacing="wide" mb={2}>{title}</Text>
    {children}
  </Box>
);

const LinkRow = ({ link }: { link: IBuildLink }) => {
  const { t, i18n } = useTranslation();
  const character = link.character;
  const name = character?.name || t("components.buildDetailModal.characterFallback", { id: link.id_character });
  const traits = character?.link_traits ?? [];

  return (
    <HStack align="flex-start" spacing={2.5}>
      <Box as={Link} to={`/personnage/${link.id_character}`} flexShrink={0}>
        <Image
          src={`${bucketUrl}/characters/thumb/${link.id_character}.png`}
          alt={name}
          boxSize="44px"
          borderRadius="md"
          objectFit="cover"
          bg="bg.inset"
        />
      </Box>
      <Box minW={0} flex={1}>
        <HStack spacing={1.5}>
          <Text as={Link} to={`/personnage/${link.id_character}`} fontSize="sm" fontWeight="semibold" noOfLines={1} _hover={{ textDecoration: "underline" }}>
            {name}
          </Text>
          {character?.affinity && <AffinityIcon affinity={character.affinity} size="14px" />}
        </HStack>
        {traits.map((trait, index) => (
          <Text key={index} fontSize="xs" color="text.secondary" title={gameText(trait.name, i18n.language)}>
            {gameText(trait.text, i18n.language)}
          </Text>
        ))}
      </Box>
    </HStack>
  );
};

// Team member in the build sheet: artwork, then links, bonus skills and accessories
export const BuildMemberCard = ({ member }: { member: IBuildTeamMember }) => {
  const { t, i18n } = useTranslation();
  const character = member.character;
  const name = character?.name || t("components.buildDetailModal.characterFallback", { id: member.id_character });
  const links = member.links ?? [];
  const skills = member.skills ?? [];
  const accessories = member.accessories ?? [];

  return (
    <Flex direction="column" h="100%" bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" overflow="hidden">
      <AspectRatio ratio={16 / 9} as={Link} to={`/personnage/${member.id_character}`}>
        <Box bg="bg.inset">
          <Image
            src={`${bucketUrl}/characters/full/${member.id_character}.png`}
            alt={name}
            w="100%"
            h="100%"
            objectFit="cover"
            fallbackSrc={`${bucketUrl}/characters/thumb/${member.id_character}.png`}
          />
          <Badge position="absolute" top={2} left={2} colorScheme="purple" variant="solid" borderRadius="full" px={2}>
            {member.position}
          </Badge>
        </Box>
      </AspectRatio>
      <HStack px={3} pt={3} spacing={2} align="flex-start">
        <Box minW={0} flex={1}>
          <Text fontWeight="bold" color="text.strong" noOfLines={1}>{name}</Text>
          {character?.version && <Text fontSize="xs" color="text.muted" noOfLines={1} title={character.version}>{character.version}</Text>}
        </Box>
        {character?.affinity && <AffinityIcon affinity={character.affinity} size="20px" />}
      </HStack>

      <VStack align="stretch" spacing={0} divider={<Divider />}>
        {links.length > 0 && (
          <CardSection title={t("components.buildDetailModal.links")}>
            <VStack align="stretch" spacing={3}>
              {links.map((link, index) => <LinkRow key={index} link={link} />)}
            </VStack>
          </CardSection>
        )}

        {skills.length > 0 && (
          <CardSection title={t("components.buildDetailModal.skills")}>
            <Wrap spacing={1.5}>
              {skills.map((skill, index) => (
                <WrapItem key={index}>
                  <Badge colorScheme="purple" textTransform="none" fontWeight="medium" px={2} py={0.5} borderRadius="md">
                    {typeof skill === "string" ? skill : skillLabel(skill, i18n.language)}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          </CardSection>
        )}

        {accessories.length > 0 && (
          <CardSection title={t("components.buildDetailModal.accessories")}>
            <VStack align="stretch" spacing={3}>
              {accessories.map(({ accessory, subeffect }, index) => (
                <HStack key={index} align="flex-start" spacing={2.5}>
                  {accessory?.code ? (
                    <Image
                      src={`${bucketUrl}/accessories/${accessory.code}/thumb.png`}
                      alt=""
                      boxSize="36px"
                      flexShrink={0}
                      borderRadius="md"
                      objectFit="contain"
                      fallback={<Box boxSize="36px" flexShrink={0} borderRadius="md" bg="bg.inset" />}
                    />
                  ) : (
                    <Box boxSize="36px" flexShrink={0} borderRadius="md" bg="bg.inset" />
                  )}
                  <Box minW={0}>
                    <Text fontSize="sm" fontWeight="semibold">
                      {accessory ? gameText(accessory.names, i18n.language) || accessory.name : "—"}
                    </Text>
                    {accessory?.effect?.text && (
                      <Text fontSize="xs" color="text.secondary">{gameText(accessory.effect.text, i18n.language)}</Text>
                    )}
                    {subeffect && (
                      <Tag size="sm" mt={1} colorScheme="teal" borderRadius="full">
                        {gameText(subeffect.names, i18n.language) || subeffect.name}
                      </Tag>
                    )}
                  </Box>
                </HStack>
              ))}
            </VStack>
          </CardSection>
        )}
      </VStack>
    </Flex>
  );
};
