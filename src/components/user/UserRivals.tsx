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
import { FiUsers, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { UserDisplay } from "@/components/ui/UserDisplay";
import type { IUserStats } from "@/hooks/useAPI";
import type { IUser } from "@/interfaces";

interface UserRivalsProps {
  rivals: NonNullable<IUserStats["rivals"]>;
  currentUser: IUser;
  currentUserRank: number | null;
  currentUserAverage: number;
}

export const UserRivals = ({
  rivals,
  currentUser,
  currentUserRank,
  currentUserAverage
}: UserRivalsProps) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const currentUserBg = useColorModeValue(
    "linear(to-r, purple.50, pink.50)",
    "linear(to-r, purple.900, pink.900)"
  );
  const currentUserBorder = useColorModeValue("purple.400", "purple.500");
  const rankBg = useColorModeValue("gray.100", "gray.700");
  const diffBg = useColorModeValue("white", "gray.800");

  if (!rivals || rivals.length === 0) {
    return null;
  }

  // Insérer le joueur actuel au milieu de la liste
  const midpoint = Math.floor(rivals.length / 2);
  const rivalsWithCurrentUser = [
    ...rivals.slice(0, midpoint),
    {
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
    },
    ...rivals.slice(midpoint)
  ];

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🎯";
  };

  return (
    <Box>
      <HStack spacing={3} mb={2}>
        <Icon as={FiUsers} boxSize={6} color="purple.500" />
        <Heading size="md" color="purple.500">
          Rivaux au Classement
        </Heading>
      </HStack>

      <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }} mb={6}>
        Joueurs proches de votre classement
      </Text>

      <VStack spacing={2} align="stretch">
        {rivalsWithCurrentUser.map((rival) => {
          const isCurrentUser = "isCurrentUser" in rival && rival.isCurrentUser;
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
              overflow="hidden"
              boxShadow={isCurrentUser ? "lg" : "sm"}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={
                isCurrentUser
                  ? {
                      boxShadow: "xl"
                    }
                  : {
                      transform: "translateX(4px)",
                      boxShadow: "md"
                    }
              }
            >
              <Box
                bgGradient={isCurrentUser ? currentUserBg : undefined}
                bg={isCurrentUser ? undefined : cardBg}
                borderWidth={isCurrentUser ? "2px" : "1px"}
                borderColor={isCurrentUser ? currentUserBorder : borderColor}
                p={5}
                position="relative"
              >
                {/* Badge "Vous" pour le joueur actuel */}
                {isCurrentUser && (
                  <Badge
                    position="absolute"
                    top={3}
                    right={3}
                    colorScheme="purple"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontWeight="bold"
                  >
                    ✨ VOUS
                  </Badge>
                )}

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
                        <Text fontSize="xl">{getRankEmoji(rival.rank)}</Text>
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
                          } as any
                        }
                        avatarSize="lg"
                        textSize="lg"
                        asLink={!isCurrentUser}
                      />
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
                        Score moyen
                      </Text>
                      <Text
                        fontSize="2xl"
                        fontWeight="bold"
                        color={isCurrentUser ? "purple.600" : "blue.600"}
                        _dark={{
                          color: isCurrentUser ? "purple.300" : "blue.300"
                        }}
                      >
                        {(rival.averageScore / 1000000).toFixed(1)}M
                      </Text>
                    </Box>

                    {/* Différence de score */}
                    {!isCurrentUser && (
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
                          {isAbove ? "devant" : "derrière"}
                        </Badge>
                      </HStack>
                    )}
                  </VStack>
                </Flex>
              </Box>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};
