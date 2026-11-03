import { Box, Button, Flex, Grid, HStack, Icon, Image, Text, Tooltip, VStack } from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
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

// Build list row: attack colour on the left edge, rotation, team with its links, result, then author
// and actions. The areas wrap on smaller screens.
export const BuildRow = ({ build, rotation, canEdit, onOpen, onEdit, owned }: BuildListItemProps) => {
  const { t } = useTranslation();
  const team = sortedTeam(build);
  const missing = useMissing(owned);
  const edgeColor = rotation?.attack?.toUpperCase() === "B" ? "blue.400" : rotation ? "red.500" : "border.subtle";

  return (
    <Grid
      templateColumns={{ base: "minmax(0, 1fr) auto", lg: "150px minmax(0, 1fr) 170px 160px" }}
      templateAreas={{ base: `"rotation result" "team team" "author author"`, lg: `"rotation team result author"` }}
      gap={{ base: 3, lg: 5 }}
      alignItems="center"
      px={{ base: 4, md: 5 }}
      py={4}
      borderLeftWidth="4px"
      borderLeftColor={edgeColor}
      transition="background 0.15s"
      _hover={{ bg: "bg.hover" }}
      {...clickableProps(build, onOpen)}
    >
      <VStack gridArea="rotation" align="flex-start" spacing={2} minW={0}>
        <RotationLabel rotation={rotation} />
        {owned && <BuildOwnershipBadge ownership={getBuildOwnership(build, owned)} />}
      </VStack>

      <VStack gridArea="team" align="stretch" spacing={2} minW={0}>
        <Grid templateColumns={{ base: "minmax(0, 1fr)", sm: "repeat(3, minmax(0, 1fr))" }} gap={3}>
          {team.map((member) => (
            <HStack key={member.position} spacing={2.5} minW={0}>
              <Box position="relative" flexShrink={0}>
                <Tooltip label={member.character?.name || "?"} hasArrow>
                  <Image
                    src={thumbUrl(member.id_character)}
                    alt={member.character?.name || "?"}
                    boxSize="52px"
                    borderRadius="lg"
                    objectFit="cover"
                    bg="bg.inset"
                    sx={missing(member.id_character)}
                  />
                </Tooltip>
                <PositionBadge value={member.position} top="-6px" left="-6px" />
              </Box>
              <VStack align="flex-start" spacing={1} minW={0}>
                <HStack spacing={1.5} minW={0} maxW="100%">
                  <Text fontSize="sm" fontWeight="bold" color="text.strong" noOfLines={1}>{member.character?.name || "?"}</Text>
                  {member.character?.affinity && <AffinityIcon affinity={member.character.affinity} size="14px" />}
                </HStack>
                <LinkThumbs links={member.links} owned={owned} size="24px" />
              </VStack>
            </HStack>
          ))}
        </Grid>
        {build.description && (
          <Text fontSize="sm" color="text.muted" noOfLines={1}>{build.description}</Text>
        )}
      </VStack>

      <Box gridArea="result" justifySelf="end">
        <BuildResult build={build} align="right" />
      </Box>

      <Flex
        gridArea="author"
        direction={{ base: "row", lg: "column" }}
        justify="space-between"
        align={{ base: "center", lg: "flex-end" }}
        gap={2}
        minW={0}
      >
        <BuildAuthor build={build} align="right" />
        <HStack spacing={1}>
          {canEdit && <EditBuildButton build={build} onEdit={onEdit} />}
          <Button size="sm" variant="ghost" colorScheme="purple" rightIcon={<Icon as={FiChevronRight} />} tabIndex={-1}>
            {t("components.rotationsBuildsGuide.view")}
          </Button>
        </HStack>
      </Flex>
    </Grid>
  );
};
