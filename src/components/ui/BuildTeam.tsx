import { Badge, Box, Grid, HStack, Image, SimpleGrid, Tag, Text, VStack, Wrap, WrapItem, type BoxProps } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { bucketUrl } from "@/utils/apiRequest";
import { gameText } from "@/utils/gameText";
import { skillLabel } from "@/utils/skillText";
import type { GameText, IBuildAccessory, IBuildLink, IBuildTeamMember } from "@/interfaces";
import { AffinityIcon } from "./AffinityIcon";
import { SpePips } from "@/components/album/AlbumThumb";

export type BuildTeamLayout = "banner" | "rows";

const characterPath = (id: string) => `/personnage/${id}`;

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" letterSpacing="wide" mb={2}>
    {children}
  </Text>
);

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

const LinkThumb = ({ link }: { link: IBuildLink }) => (
  <Box as={Link} to={characterPath(link.id_character)} display="block" position="relative" flexShrink={0} boxSize="44px" borderRadius="md" overflow="hidden" bg="bg.inset">
    <Image src={`${bucketUrl}/characters/thumb/${link.id_character}.png`} alt={link.character?.name ?? ""} boxSize="100%" objectFit="cover" />
    {link.spe ? (
      <Box position="absolute" insetX={0} bottom={0} pt={2} pb={0.5} bgGradient="linear(to-t, blackAlpha.800, transparent)">
        <SpePips spe={link.spe} size={5} />
      </Box>
    ) : null}
  </Box>
);

const useLinkName = (link: IBuildLink) => {
  const { t } = useTranslation();
  return link.character?.name || t("components.buildDetailModal.characterFallback", { id: link.id_character });
};

// Link as a line: thumbnail on the left, soul traits beside it
const LinkRow = ({ link }: { link: IBuildLink }) => {
  const name = useLinkName(link);
  return (
    <HStack align="flex-start" spacing={2.5}>
      <LinkThumb link={link} />
      <Box minW={0} flex={1}>
        <HStack spacing={1.5}>
          <Text as={Link} to={characterPath(link.id_character)} fontSize="sm" fontWeight="bold" color="text.strong" noOfLines={1} _hover={{ textDecoration: "underline" }}>
            {name}
          </Text>
          {link.character?.affinity && <AffinityIcon affinity={link.character.affinity} size="14px" />}
        </HStack>
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
      <LinkThumb link={link} />
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
          {member.spe ? <Box ml="auto" flexShrink={0}><SpePips spe={member.spe} size={8} /></Box> : null}
        </HStack>
      </Box>
    </Box>
  );
};

const SkillChips = ({ member }: { member: IBuildTeamMember }) => {
  const { i18n } = useTranslation();
  return (
    <Wrap spacing={1.5}>
      {(member.skills ?? []).map((skill, index) => (
        <WrapItem key={index}>
          <Badge colorScheme="purple" textTransform="none" fontWeight="medium" fontSize="sm" px={2} py={0.5} borderRadius="md">
            {typeof skill === "string" ? skill : skillLabel(skill, i18n.language)}
          </Badge>
        </WrapItem>
      ))}
    </Wrap>
  );
};

const AccessoryRow = ({ item }: { item: IBuildAccessory }) => {
  const { i18n } = useTranslation();
  const { accessory, subeffect } = item;
  return (
    <HStack align="flex-start" spacing={2.5}>
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
  );
};

const hasGear = (member: IBuildTeamMember) => (member.skills ?? []).length > 0 || (member.accessories ?? []).length > 0;

// Bonus skills and accessories of a member, in two columns on wide screens
const MemberGear = ({ member }: { member: IBuildTeamMember }) => {
  const { t } = useTranslation();
  const skills = member.skills ?? [];
  const accessories = member.accessories ?? [];

  if (!hasGear(member)) {
    return <Text fontSize="sm" color="text.muted">{t("components.buildDetailModal.noGear")}</Text>;
  }

  return (
    <SimpleGrid columns={{ base: 1, md: skills.length > 0 && accessories.length > 0 ? 2 : 1 }} spacing={4}>
      {skills.length > 0 && (
        <Box>
          <SectionTitle>{t("components.buildDetailModal.skills")}</SectionTitle>
          <SkillChips member={member} />
        </Box>
      )}
      {accessories.length > 0 && (
        <Box>
          <SectionTitle>{t("components.buildDetailModal.accessories")}</SectionTitle>
          <VStack align="stretch" spacing={3}>
            {accessories.map((item, index) => <AccessoryRow key={index} item={item} />)}
          </VStack>
        </Box>
      )}
    </SimpleGrid>
  );
};

// One horizontal band of the banner: a cell per member, all cells of a band share the same height
interface Band {
  key: string;
  cell: (member: IBuildTeamMember) => ReactNode;
  pt?: number;
  pb?: number;
}

// Team banner: the three artworks side by side, each member's details in a column below. The columns
// share their rows (EX, each link, skills, each accessory), so the same item lines up across members.
export const BuildTeamBanner = ({ team }: { team: IBuildTeamMember[] }) => {
  const { t } = useTranslation();
  const columns = Math.min(Math.max(team.length, 1), 3);
  const maxLinks = Math.max(0, ...team.map((m) => (m.links ?? []).length));
  const maxAccessories = Math.max(0, ...team.map((m) => (m.accessories ?? []).length));
  const anySkills = team.some((m) => (m.skills ?? []).length > 0);
  const anyEx = team.some((m) => (m.character?.ex_traits ?? []).length > 0);
  const anyWithoutGear = team.some((m) => !hasGear(m));

  const bands: Band[] = [
    { key: "artwork", cell: (m) => <MemberArtwork member={m} /> },
    ...(anyEx ? [{ key: "ex", cell: (m: IBuildTeamMember) => <ExList traits={m.character?.ex_traits} />, pt: 4 }] : []),
    ...(maxLinks > 0
      ? [{
          key: "links",
          cell: (m: IBuildTeamMember) => ((m.links ?? []).length > 0 ? <SectionTitle>{t("components.buildDetailModal.links")}</SectionTitle> : null),
          pt: 4,
        }]
      : []),
    ...Array.from({ length: maxLinks }, (_, i) => ({
      key: `link-${i}`,
      cell: (m: IBuildTeamMember) => (m.links?.[i] ? <LinkRow link={m.links[i]} /> : null),
      pb: 3,
    })),
    ...(anySkills
      ? [{
          key: "skills",
          cell: (m: IBuildTeamMember) => ((m.skills ?? []).length > 0 ? (
            <>
              <SectionTitle>{t("components.buildDetailModal.skills")}</SectionTitle>
              <SkillChips member={m} />
            </>
          ) : null),
          pt: 2,
        }]
      : []),
    ...(maxAccessories > 0
      ? [{
          key: "accessories",
          cell: (m: IBuildTeamMember) => ((m.accessories ?? []).length > 0 ? <SectionTitle>{t("components.buildDetailModal.accessories")}</SectionTitle> : null),
          pt: 4,
        }]
      : []),
    ...Array.from({ length: maxAccessories }, (_, i) => ({
      key: `accessory-${i}`,
      cell: (m: IBuildTeamMember) => (m.accessories?.[i] ? <AccessoryRow item={m.accessories[i]} /> : null),
      pb: 3,
    })),
    ...(anyWithoutGear
      ? [{
          key: "no-gear",
          cell: (m: IBuildTeamMember) => (hasGear(m) ? null : <Text fontSize="sm" color="text.muted">{t("components.buildDetailModal.noGear")}</Text>),
          pt: 2,
        }]
      : []),
    { key: "end", cell: () => null, pb: 2 },
  ];

  return (
    <Grid
      templateColumns={{ base: "minmax(0, 1fr)", md: `repeat(${columns}, minmax(0, 1fr))` }}
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="xl"
      overflow="hidden"
      bg="bg.card"
    >
      {team.map((member, column) => bands.map((band, row) => {
        const content = band.cell(member);
        const cellProps: BoxProps = {
          gridColumn: { md: column + 1 },
          gridRow: { md: row + 1 },
          minW: 0,
          px: band.key === "artwork" ? 0 : 4,
          pt: band.pt ?? 0,
          pb: band.pb ?? 0,
          borderColor: "border.subtle",
          borderLeftWidth: { base: 0, md: column > 0 ? "1px" : 0 },
          // On one column, empty cells disappear and a line separates the members
          borderTopWidth: { base: row === 0 && column > 0 ? "1px" : 0, md: 0 },
          display: content == null ? { base: "none", md: "block" } : "block",
        };
        return <Box key={`${member.position}-${band.key}`} {...cellProps}>{content}</Box>;
      }))}
    </Grid>
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
            <MemberGear member={member} />
          </VStack>
        </Grid>
      ))}
    </VStack>
  );
};
