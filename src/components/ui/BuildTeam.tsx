import { Badge, Box, Grid, HStack, Image, SimpleGrid, Tag, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { bucketUrl } from "@/utils/apiRequest";
import { gameText } from "@/utils/gameText";
import { skillLabel } from "@/utils/skillText";
import type { GameText, IBuildLink, IBuildTeamMember } from "@/interfaces";
import { AffinityIcon } from "./AffinityIcon";

export type BuildTeamLayout = "banner" | "rows";

const characterPath = (id: string) => `/personnage/${id}`;

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" letterSpacing="wide" mb={2}>
    {children}
  </Text>
);

// Version without the affinity and name it repeats ("Fire Yoruichi Shihoin" → "")
const versionLabel = (character?: { name?: string; affinity?: string; version?: string }) => {
  let version = character?.version ?? "";
  for (const part of [character?.affinity, character?.name]) if (part) version = version.replace(part, "");
  return version.trim();
};

const ExList = ({ traits, fontSize = "sm" }: { traits?: { text: GameText | null }[]; fontSize?: string }) => {
  const { i18n } = useTranslation();
  if (!traits?.length) return null;
  return (
    <VStack align="stretch" spacing={1}>
      {traits.map((trait, index) => (
        <HStack key={index} align="baseline" spacing={1.5} color="orange.300" fontSize={fontSize}>
          <Badge colorScheme="orange" variant="solid" fontSize="2xs" flexShrink={0}>EX</Badge>
          <Text>{gameText(trait.text, i18n.language)}</Text>
        </HStack>
      ))}
    </VStack>
  );
};

const LinkTraits = ({ link, fontSize }: { link: IBuildLink; fontSize: string }) => {
  const { i18n } = useTranslation();
  return (
    <>
      {(link.character?.link_traits ?? []).map((trait, index) => (
        <Text key={index} fontSize={fontSize} color="text.secondary" title={gameText(trait.name, i18n.language)}>
          {gameText(trait.text, i18n.language)}
        </Text>
      ))}
      <ExList traits={link.character?.ex_traits} fontSize={fontSize} />
    </>
  );
};

const LinkThumb = ({ link, size }: { link: IBuildLink; size: string }) => (
  <Box as={Link} to={characterPath(link.id_character)} flexShrink={0}>
    <Image
      src={`${bucketUrl}/characters/thumb/${link.id_character}.png`}
      alt={link.character?.name ?? ""}
      boxSize={size}
      borderRadius="md"
      objectFit="cover"
      bg="bg.inset"
    />
  </Box>
);

const useLinkName = (link: IBuildLink) => {
  const { t } = useTranslation();
  return link.character?.name || t("components.buildDetailModal.characterFallback", { id: link.id_character });
};

// Link as a line: thumbnail on the left, soul traits beside it
const LinkRow = ({ link }: { link: IBuildLink }) => {
  const name = useLinkName(link);
  const version = versionLabel(link.character);
  return (
    <HStack align="flex-start" spacing={2.5}>
      <LinkThumb link={link} size="44px" />
      <Box minW={0} flex={1}>
        <HStack spacing={1.5}>
          <Text as={Link} to={characterPath(link.id_character)} fontSize="sm" fontWeight="bold" color="text.strong" noOfLines={1} _hover={{ textDecoration: "underline" }}>
            {name}
          </Text>
          {link.character?.affinity && <AffinityIcon affinity={link.character.affinity} size="14px" />}
        </HStack>
        {version && <Text fontSize="xs" color="text.muted" noOfLines={1}>{version}</Text>}
        <LinkTraits link={link} fontSize="sm" />
      </Box>
    </HStack>
  );
};

// Link as a tile: thumbnail on top, for the three links side by side
const LinkTile = ({ link }: { link: IBuildLink }) => {
  const name = useLinkName(link);
  return (
    <Box minW={0}>
      <LinkThumb link={link} size="44px" />
      <Text as={Link} to={characterPath(link.id_character)} display="block" mt={1} fontSize="sm" fontWeight="bold" color="text.strong" noOfLines={1} _hover={{ textDecoration: "underline" }}>
        {name}
      </Text>
      <LinkTraits link={link} fontSize="xs" />
    </Box>
  );
};

// fill: on wide screens the artwork stretches to the height of its row instead of keeping a 16:9 box.
// The image is absolutely positioned so its own size never drives the box or the row.
const MemberArtwork = ({ member, borderRadius, fill = false }: { member: IBuildTeamMember; borderRadius?: string; fill?: boolean }) => {
  const { t } = useTranslation();
  const character = member.character;
  const name = character?.name || t("components.buildDetailModal.characterFallback", { id: member.id_character });
  const version = versionLabel(character);

  return (
    <Box
      as={Link}
      to={characterPath(member.id_character)}
      display="block"
      position="relative"
      overflow="hidden"
      minW={0}
      borderRadius={borderRadius}
      bg="bg.inset"
      minH={fill ? { lg: "260px" } : undefined}
      sx={{ aspectRatio: fill ? { base: "16 / 9", lg: "auto" } : "16 / 9" }}
      role="group"
    >
      <Image
        position="absolute"
        inset={0}
        src={`${bucketUrl}/characters/artwork/${member.id_character}.png`}
        fallbackSrc={`${bucketUrl}/characters/thumb/${member.id_character}.png`}
        alt={name}
        w="100%"
        h="100%"
        objectFit="cover"
        objectPosition="50% 20%"
        transition="transform 0.3s"
        _groupHover={{ transform: "scale(1.03)" }}
      />
      <Box position="absolute" insetX={0} bottom={0} px={3.5} pt={8} pb={2.5} bgGradient="linear(to-t, blackAlpha.800, transparent)">
        <HStack spacing={2}>
          <Badge colorScheme="purple" variant="solid" borderRadius="full" px={2}>{member.position}</Badge>
          <Text fontWeight="extrabold" fontSize="lg" color="white" noOfLines={1}>{name}</Text>
          {character?.affinity && <AffinityIcon affinity={character.affinity} size="20px" />}
        </HStack>
        {version && <Text fontSize="xs" color="gray.300" noOfLines={1}>{version}</Text>}
      </Box>
    </Box>
  );
};

// Bonus skills and accessories of a member; sideBySide puts them in two columns on wide screens
const MemberGear = ({ member, sideBySide = false }: { member: IBuildTeamMember; sideBySide?: boolean }) => {
  const { t, i18n } = useTranslation();
  const skills = member.skills ?? [];
  const accessories = member.accessories ?? [];

  if (skills.length === 0 && accessories.length === 0) {
    return <Text fontSize="sm" color="text.muted">{t("components.buildDetailModal.noGear")}</Text>;
  }

  return (
    <SimpleGrid columns={{ base: 1, md: sideBySide && skills.length > 0 && accessories.length > 0 ? 2 : 1 }} spacing={4}>
      {skills.length > 0 && (
        <Box>
          <SectionTitle>{t("components.buildDetailModal.skills")}</SectionTitle>
          <Wrap spacing={1.5}>
            {skills.map((skill, index) => (
              <WrapItem key={index}>
                <Badge colorScheme="purple" textTransform="none" fontWeight="medium" fontSize="sm" px={2} py={0.5} borderRadius="md">
                  {typeof skill === "string" ? skill : skillLabel(skill, i18n.language)}
                </Badge>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
      {accessories.length > 0 && (
        <Box>
          <SectionTitle>{t("components.buildDetailModal.accessories")}</SectionTitle>
          <VStack align="stretch" spacing={3}>
            {accessories.map(({ accessory, subeffect }, index) => (
              <HStack key={index} align="flex-start" spacing={2.5}>
                {accessory?.code ? (
                  <Image
                    src={`${bucketUrl}/accessories/${accessory.code}/thumb.png`}
                    alt=""
                    boxSize="36px"
                    flexShrink={0}
                    objectFit="contain"
                    fallback={<Box boxSize="36px" flexShrink={0} borderRadius="md" bg="bg.inset" />}
                  />
                ) : (
                  <Box boxSize="36px" flexShrink={0} borderRadius="md" bg="bg.inset" />
                )}
                <Box minW={0}>
                  <Text fontSize="sm" fontWeight="bold" color="text.strong">
                    {accessory ? gameText(accessory.names, i18n.language) || accessory.name : "—"}
                  </Text>
                  {accessory?.effect?.text && (
                    <Text fontSize="sm" color="text.secondary">{gameText(accessory.effect.text, i18n.language)}</Text>
                  )}
                  {subeffect && (
                    <Tag size="sm" mt={1} colorScheme="teal" variant="outline" borderRadius="full">
                      {gameText(subeffect.names, i18n.language) || subeffect.name}
                    </Tag>
                  )}
                </Box>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </SimpleGrid>
  );
};

// Team banner: the three artworks side by side, each member's details in a column below
export const BuildTeamBanner = ({ team }: { team: IBuildTeamMember[] }) => {
  const { t } = useTranslation();
  return (
    <SimpleGrid
      columns={{ base: 1, md: Math.min(Math.max(team.length, 1), 3) }}
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="xl"
      overflow="hidden"
      bg="bg.card"
    >
      {team.map((member, index) => (
        <Box
          key={member.position}
          minW={0}
          borderColor="border.subtle"
          borderTopWidth={{ base: index > 0 ? "1px" : 0, md: 0 }}
          borderLeftWidth={{ base: 0, md: index > 0 ? "1px" : 0 }}
        >
          <MemberArtwork member={member} />
          <VStack align="stretch" spacing={4} p={4}>
            <ExList traits={member.character?.ex_traits} />
            {(member.links ?? []).length > 0 && (
              <Box>
                <SectionTitle>{t("components.buildDetailModal.links")}</SectionTitle>
                <VStack align="stretch" spacing={3}>
                  {member.links!.map((link, i) => <LinkRow key={i} link={link} />)}
                </VStack>
              </Box>
            )}
            <MemberGear member={member} />
          </VStack>
        </Box>
      ))}
    </SimpleGrid>
  );
};

// Team rows: one line per member with a large artwork, then its links side by side, its EX and its gear
export const BuildTeamRows = ({ team }: { team: IBuildTeamMember[] }) => {
  const { t } = useTranslation();
  return (
    <VStack align="stretch" spacing={0} borderWidth="1px" borderColor="border.subtle" borderRadius="xl" overflow="hidden" bg="bg.card">
      {team.map((member, index) => (
        <Grid
          key={member.position}
          templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 5fr) minmax(0, 6fr)" }}
          gap={5}
          p={4}
          borderTopWidth={index > 0 ? "1px" : 0}
          borderColor="border.subtle"
        >
          <MemberArtwork member={member} borderRadius="lg" fill />
          <VStack align="stretch" spacing={4} minW={0}>
            {(member.links ?? []).length > 0 && (
              <Box>
                <SectionTitle>{t("components.buildDetailModal.links")}</SectionTitle>
                <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
                  {member.links!.map((link, i) => <LinkTile key={i} link={link} />)}
                </SimpleGrid>
              </Box>
            )}
            {(member.character?.ex_traits ?? []).length > 0 && (
              <Box>
                <SectionTitle>{t("components.buildDetailModal.characterEx")}</SectionTitle>
                <ExList traits={member.character?.ex_traits} />
              </Box>
            )}
            <MemberGear member={member} sideBySide />
          </VStack>
        </Grid>
      ))}
    </VStack>
  );
};
