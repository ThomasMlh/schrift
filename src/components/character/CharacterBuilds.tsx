import { Avatar, Box, HStack, SimpleGrid, Text, useColorMode } from "@chakra-ui/react";
import type { IBuild } from "@/interfaces";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { PageLoader } from "@/components/ui/PageLoader";
import { bucketUrl } from "@/utils/apiRequest";

interface CharacterBuildsProps {
  builds: IBuild[];
  isLoading: boolean;
  onSelect: (build: IBuild) => void;
}

// Builds validés utilisant le personnage (masqué s'il n'y en a aucun)
export const CharacterBuilds = ({ builds, isLoading, onSelect }: CharacterBuildsProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  if (!isLoading && builds.length === 0) return null;

  return (
    <Box>
      <Text
        fontSize="2xs" fontWeight="semibold" letterSpacing="widest"
        textTransform="uppercase"
        color={isDark ? 'purple.400' : 'purple.600'}
        mb={4}
      >
        Builds validés ({builds.length})
      </Text>
      {isLoading ? (
        <PageLoader height="80px" />
      ) : (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={3}>
          {builds.map((build) => (
            <Box
              key={build._id}
              p={3}
              bg={isDark ? 'gray.800' : 'white'}
              borderRadius="xl"
              border="1px solid"
              borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
              cursor="pointer"
              _hover={{ borderColor: "purple.400", transform: "translateY(-2px)", boxShadow: "md" }}
              transition="all 0.15s"
              onClick={() => onSelect(build)}
            >
              <HStack spacing={1} justify="center" mb={2}>
                {build.team.map((member, i) => (
                  <Avatar
                    key={i}
                    size="sm"
                    src={member.character?._id ? `${bucketUrl}/characters/thumb/${member.character._id}.png` : undefined}
                    name={member.character?.name ?? "?"}
                    border="2px solid"
                    borderColor={["purple.400", "blue.400", "teal.400"][i]}
                  />
                ))}
              </HStack>
              {build.rotation && (
                <HStack justify="center" spacing={1} mb={1}>
                  <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} noOfLines={1}>
                    {build.rotation.killer}
                  </Text>
                  <AttackTypeBadge attackType={build.rotation.attack} size="12px" />
                </HStack>
              )}
              {build.user && (
                <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} textAlign="center" noOfLines={1}>
                  {build.user.bbs_name || build.user.global_name}
                </Text>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};
