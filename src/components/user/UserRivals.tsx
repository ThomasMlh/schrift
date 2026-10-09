import {
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  useColorModeValue,
  Icon,
  Heading,
  Flex
} from "@chakra-ui/react";
import { FiUsers, FiTrendingUp, FiTrendingDown, FiTarget } from "react-icons/fi";
import { MedalBadge } from "@/components/ui/MedalBadge";
import { useTranslation } from "react-i18next";
import { UserDisplay } from "@/components/ui/UserDisplay";
import type { IUserStats } from "@/hooks/useAPI";
import type { IUser } from "@/interfaces";

interface UserRivalsProps {
  rivals: NonNullable<IUserStats["rivals"]>;
  currentUser: IUser;
  currentUserRank: number | null;
  currentUserAverage: number;
  loggedInUserId?: string;
}

export const UserRivals = ({
  rivals,
  currentUser,
  currentUserRank,
  currentUserAverage,
  loggedInUserId
}: UserRivalsProps) => {
  const cardBg = "bg.card";
  const borderColor = "border.subtle";
  const currentUserBg = useColorModeValue(
    "linear(to-r, purple.50, pink.50)",
    "linear(to-r, purple.900, pink.900)"
  );
  const currentUserBorder = useColorModeValue("purple.400", "purple.500");
  const rankBg = "bg.inset";
  const diffBg = "bg.card";
  const { t } = useTranslation();

  if (!rivals || rivals.length === 0) {
    return null;
  }

  // Insérer le joueur du profil à sa position correcte selon le rang
  const profileEntry = {
    rank: currentUserRank || 0,
    user_id: currentUser._id,
    discord_id: currentUser.discord_id,
    global_name: currentUser.global_name,
    bbs_name: currentUser.bbs_name,
    avatar: currentUser.avatar,
    guilde_id: currentUser.guilde_id,
    guild_name: currentUser.guild_name,
    averageScore: currentUserAverage,
    scoreDifference: 0,
    isCurrentUser: true
  };
  const insertIndex = rivals.findIndex(r => r.rank > profileEntry.rank);
  const rivalsWithCurrentUser = insertIndex === -1
    ? [...rivals, profileEntry]
    : [...rivals.slice(0, insertIndex), profileEntry, ...rivals.slice(insertIndex)];

  return (
    <Box>
      <HStack spacing={3} mb={2}>
        <Icon as={FiUsers} boxSize={6} color="purple.500" />
        <Heading size="md" color="purple.500">
          {t("components.user.rivals.heading")}
        </Heading>
      </HStack>

      <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }} mb={6}>
        {t("components.user.rivals.subtitle")}
      </Text>

      <VStack spacing={2} align="stretch">
        {rivalsWithCurrentUser.map((rival) => {
          const isProfileUser = "isCurrentUser" in rival && rival.isCurrentUser;
          const isLoggedInUser = loggedInUserId === rival.user_id;
          const isAbove = rival.rank < (currentUserRank || Infinity);
          const diffColor =
            rival.scoreDifference > 0
              ? "green.500"
              : rival.scoreDifference < 0
                ? "red.500"
                : "gray.500";

          return (
            <Box
              key={rival.user_id}
              position="relative"
              borderRadius="xl"
              boxShadow={isProfileUser ? "lg" : "sm"}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              bgGradient={isProfileUser ? currentUserBg : undefined}
              bg={isProfileUser ? undefined : cardBg}
              borderWidth={isProfileUser ? "2px" : "1px"}
              borderColor={isProfileUser ? currentUserBorder : borderColor}
              p={5}
              overflow="hidden"
              _hover={
                isProfileUser
                  ? {
                      boxShadow: "xl"
                    }
                  : {
                      transform: "translateX(4px)",
                      boxShadow: "md"
                    }
              }
            >
                <Flex
                  direction={{ base: "column", md: "row" }}
                  gap={2}
                  align="center"
                >
                  {/* Section gauche : Rang + Avatar + Nom */}
                  <Flex flex={1} direction="column" gap={2}>
                    <HStack spacing={2} align="center">
                      {/* Rang avec emoji */}
                      <Flex
                        align="center"
                        justify="center"
                        minW="60px"
                        h="60px"
                        bg={rankBg}
                        borderRadius="lg"
                        fontWeight="bold"
                        fontSize="sm"
                        flexDir="column"
                        boxShadow="inner"
                      >
                        {rival.rank <= 3 ? (
                          <MedalBadge rank={rival.rank as 1 | 2 | 3} size={20} />
                        ) : (
                          <Icon as={FiTarget} boxSize={5} color="purple.400" aria-hidden />
                        )}
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          _dark={{ color: "gray.400" }}
                        >
                          #{rival.rank}
                        </Text>
                      </Flex>

                      {/* Guilde (uniquement pour les rivaux) */}
                      {rival.guild_name && (
                        <Box
                          px={3}
                          py={2}
                          borderRadius="md"
                          w="fit-content"
                        >
                          <HStack spacing={0} align="center">
                            <Text fontSize="sm">🏰</Text>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color="gray.700"
                              _dark={{ color: "gray.200" }}
                            >
                              {rival.guild_name}
                            </Text>
                          </HStack>
                        </Box>
                      )}

                      {/* Avatar et nom */}
                      <UserDisplay
                        user={
                          {
                            _id: rival.user_id,
                            discord_id: rival.discord_id,
                            global_name:
                              rival.global_name || rival.bbs_name || "Joueur",
                            bbs_name: rival.bbs_name,
                            avatar: rival.avatar,
                            guilde_id: rival.guilde_id
                          } as IUser
                        }
                        avatarSize="lg"
                        textSize="lg"
                        asLink={!isProfileUser}
                      />
                      {isLoggedInUser && (
                        <Badge
                          colorScheme="purple"
                          fontSize="xs"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontWeight="bold"
                        >
                          {t("components.user.rivals.youBadge")}
                        </Badge>
                      )}
                    </HStack>
                  </Flex>

                  {/* Section droite : Score et différence */}
                  <VStack
                    spacing={2}
                    align="flex-end"
                    minW={{ base: "full", md: "180px" }}
                  >
                    <Box textAlign="right">
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        _dark={{ color: "gray.400" }}
                        fontWeight="medium"
                        mb={1}
                      >
                        {t("components.user.rivals.labelAvgScore")}
                      </Text>
                      <Text
                        fontSize="2xl"
                        fontWeight="bold"
                        color={isProfileUser ? "purple.600" : "blue.600"}
                        _dark={{
                          color: isProfileUser ? "purple.300" : "blue.300"
                        }}
                      >
                        {(rival.averageScore / 1000000).toFixed(1)}M
                      </Text>
                    </Box>

                    {/* Différence de score */}
                    {!isProfileUser && (
                      <HStack
                        spacing={2}
                        bg={diffBg}
                        px={3}
                        py={1.5}
                        borderRadius="full"
                        borderWidth="1px"
                        borderColor={borderColor}
                      >
                        <Icon
                          as={
                            rival.scoreDifference > 0
                              ? FiTrendingUp
                              : FiTrendingDown
                          }
                          color={diffColor}
                          boxSize={4}
                        />
                        <Text fontSize="sm" color={diffColor} fontWeight="bold">
                          {rival.scoreDifference > 0 ? "+" : ""}
                          {(Math.abs(rival.scoreDifference) / 1000000).toFixed(
                            1
                          )}
                          M
                        </Text>
                        <Badge
                          colorScheme={isAbove ? "red" : "green"}
                          fontSize="xs"
                          textTransform="uppercase"
                        >
                          {isAbove ? t("components.user.rivals.positionAbove") : t("components.user.rivals.positionBelow")}
                        </Badge>
                      </HStack>
                    )}
                  </VStack>
                </Flex>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};
