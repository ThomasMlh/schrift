import { Box, Flex, Grid, HStack, Image, SimpleGrid, Text } from "@chakra-ui/react";
import { bucketUrl } from "@/utils/apiRequest";
import { getBuildOwnership } from "@/utils/buildOwnership";
import { AffinityIcon } from "../ui/AffinityIcon";
import { BuildOwnershipBadge } from "./BuildOwnershipBadge";
import {
  BuildAuthor,
  BuildResult,
  EditBuildButton,
  LinkThumbs,
  PositionBadge,
  RotationLabel,
  type BuildListItemProps,
} from "./buildListParts";
import { clickableProps, sortedTeam, thumbUrl, useMissing } from "@/utils/buildList";

// Build card: the three artworks as a banner, then each member with its links, the notes and the result
export const BuildCard = ({ build, rotation, canEdit, onOpen, onEdit, owned }: BuildListItemProps) => {
  const team = sortedTeam(build);
  const missing = useMissing(owned);

  return (
    <Flex
      direction="column"
      h="100%"
      bg="bg.card"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="xl"
      overflow="hidden"
      transition="border-color 0.15s, transform 0.15s"
      _hover={{ borderColor: "purple.400", transform: "translateY(-2px)" }}
      {...clickableProps(build, onOpen)}
    >
      <Box position="relative" h={{ base: "120px", md: "150px" }}>
        <Grid templateColumns={`repeat(${Math.max(team.length, 1)}, minmax(0, 1fr))`} h="100%" gap="1px" bg="bg.page">
          {team.map((member) => (
            <Box key={member.position} position="relative" overflow="hidden" bg="bg.inset">
              <Image
                src={`${bucketUrl}/characters/artwork/${member.id_character}.png`}
                fallbackSrc={thumbUrl(member.id_character)}
                alt={member.character?.name || "?"}
                w="100%"
                h="100%"
                objectFit="cover"
                objectPosition="50% 20%"
                sx={missing(member.id_character)}
              />
              <PositionBadge value={member.position} left={2} bottom={2} />
            </Box>
          ))}
        </Grid>
        <HStack
          position="absolute"
          insetX={0}
          top={0}
          justify="space-between"
          align="flex-start"
          spacing={2}
          p={2.5}
          pb={6}
          bgGradient="linear(to-b, blackAlpha.800, transparent)"
        >
          <RotationLabel rotation={rotation} onImage />
          {owned && <BuildOwnershipBadge ownership={getBuildOwnership(build, owned)} />}
        </HStack>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={{ base: 2, sm: 3 }} px={4} pt={3}>
        {team.map((member) => (
          <Flex key={member.position} direction={{ base: "row", sm: "column" }} justify="space-between" align={{ base: "center", sm: "flex-start" }} gap={1.5} minW={0}>
            <HStack spacing={1.5} minW={0}>
              {member.character?.affinity && <AffinityIcon affinity={member.character.affinity} size="14px" />}
              <Text fontSize="sm" fontWeight="bold" color="text.strong" noOfLines={1}>{member.character?.name || "?"}</Text>
            </HStack>
            <LinkThumbs links={member.links} owned={owned} />
          </Flex>
        ))}
      </SimpleGrid>

      {build.description && (
        <Text fontSize="sm" color="text.muted" noOfLines={1} px={4} pt={2}>{build.description}</Text>
      )}

      <Flex mt="auto" justify="space-between" align="flex-end" gap={3} p={4}>
        <BuildResult build={build} />
        <HStack spacing={2} minW={0}>
          <BuildAuthor build={build} align="right" />
          {canEdit && <EditBuildButton build={build} onEdit={onEdit} />}
        </HStack>
      </Flex>
    </Flex>
  );
};
