import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Card,
  CardBody,
  Flex,
  useColorModeValue,
  Tooltip,
  Icon
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CalendarIcon, TimeIcon } from "@chakra-ui/icons";
import type { IScore, IUser, ICycle } from "../../interfaces";
import { AttackTypeBadge } from "./AttackTypeBadge";
import { UserDisplay } from "./UserDisplay";
import CustomLink from "./CustomLink";
import { AlterationImage } from "./AlterationImage";
import { ScoreBadge } from "./ScoreBadge";

interface ScoresTableProps {
  scores: IScore[];
  users: IUser[];
  cycles: ICycle[];
  isAdmin: boolean;
  isGuildManager: boolean;
  onEditScore: (score: IScore) => void;
  onDeleteScore: (score: IScore) => void;
}

const ScoresTable: React.FC<ScoresTableProps> = ({
  scores,
  users,
  cycles,
  isAdmin,
  isGuildManager,
  onEditScore,
  onDeleteScore
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardHoverBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerBg = useColorModeValue("gray.100", "gray.700");

  // Obtenir les informations d'un utilisateur
  const getUserInfo = (userId: string) => {
    return users.find((user) => user._id === userId);
  };

  // Obtenir les informations d'un cycle
  const getCycleInfo = (cycleId: string) => {
    return cycles.find((cycle) => cycle._id === cycleId);
  };

  // Obtenir les informations d'une rotation
  const getRotationInfo = (cycleId: string, rotationId: string) => {
    const cycle = getCycleInfo(cycleId);
    return cycle?.rotations.find(
      (rotation) => rotation.rotation_id === rotationId
    );
  };

  return (
    <Box>
      {/* En-têtes (masqué sur mobile) */}
      <Box
        display={{ base: "none", lg: "block" }}
        bg={headerBg}
        px={4}
        py={3}
        borderRadius="md"
        mb={3}
      >
        <Flex align="center" gap={4}>
          <Box w="200px">
            <Text
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
            >
              Joueur
            </Text>
          </Box>
          <Box w="180px">
            <Text
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
            >
              <Icon as={CalendarIcon} mr={1} />
              Cycle
            </Text>
          </Box>
          <Box flex={1}>
            <Text
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
            >
              Rotation
            </Text>
          </Box>
          <Box w="140px" textAlign="center">
            <Text
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
            >
              Score
            </Text>
          </Box>
          {(isAdmin || isGuildManager) && (
            <Box w="100px" textAlign="center">
              <Text
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
              >
                Actions
              </Text>
            </Box>
          )}
        </Flex>
      </Box>

      {/* Liste des scores */}
      <VStack spacing={2} align="stretch">
        {scores.map((score) => {
          const user = getUserInfo(score.user_id);
          const cycle = getCycleInfo(score.cycle_id);
          const rotation = getRotationInfo(score.cycle_id, score.rotation_id);

          return (
            <Card
              key={score._id}
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{
                bg: cardHoverBg,
                transform: "translateY(-1px)",
                shadow: "md"
              }}
              transition="all 0.2s"
            >
              <CardBody p={4}>
                <Flex
                  direction={{ base: "column", lg: "row" }}
                  gap={{ base: 3, lg: 4 }}
                  align={{ base: "stretch", lg: "center" }}
                >
                  {/* Joueur */}
                  <Box w={{ base: "full", lg: "200px" }}>
                    <Text
                      display={{ base: "block", lg: "none" }}
                      fontSize="xs"
                      color="gray.500"
                      mb={1}
                      fontWeight="medium"
                    >
                      JOUEUR
                    </Text>
                    <UserDisplay user={user} />
                  </Box>

                  {/* Cycle */}
                  <Box w={{ base: "full", lg: "180px" }}>
                    <Text
                      display={{ base: "block", lg: "none" }}
                      fontSize="xs"
                      color="gray.500"
                      mb={1}
                      fontWeight="medium"
                    >
                      <Icon as={CalendarIcon} mr={1} />
                      CYCLE
                    </Text>
                    <VStack spacing={1} align="start">
                      <CustomLink
                        to={`/cycle/${cycle?._id}`}
                        text={cycle?.name || "Cycle inconnu"}
                        textSize="sm"
                      />
                      {cycle?.year && (
                        <Badge colorScheme="purple" fontSize="xs">
                          {cycle.year}
                        </Badge>
                      )}
                    </VStack>
                  </Box>

                  {/* Rotation */}
                  <Box flex={{ base: "1", lg: "1" }}>
                    <Text
                      display={{ base: "block", lg: "none" }}
                      fontSize="xs"
                      color="gray.500"
                      mb={1}
                      fontWeight="medium"
                    >
                      ROTATION
                    </Text>
                    {rotation ? (
                      <VStack spacing={1} align="start">
                        <HStack spacing={2}>
                          <CustomLink
                            to={`/cycle/${cycle?._id}/rotation/${rotation.position}`}
                            text={`#${rotation.position} ${rotation.killer}`}
                            textSize="xs"
                          />
                          <AttackTypeBadge
                            attackType={rotation.attack}
                            size="16px"
                          />
                          {rotation.alteration && (
                            <AlterationImage
                              alteration={rotation.alteration}
                              size="16px"
                            />
                          )}
                        </HStack>
                        <Badge colorScheme="blue" fontSize="xs">
                          {rotation.period}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                          {rotation.start_date} → {rotation.end_date}
                        </Text>
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        Rotation inconnue
                      </Text>
                    )}
                  </Box>

                  {/* Score */}
                  <Box
                    w={{ base: "full", lg: "140px" }}
                    textAlign={{ base: "left", lg: "center" }}
                  >
                    <Text
                      display={{ base: "block", lg: "none" }}
                      fontSize="xs"
                      color="gray.500"
                      mb={1}
                      fontWeight="medium"
                    >
                      SCORE
                    </Text>
                    <VStack spacing={1}>
                      <ScoreBadge score={score.score} fontSize="lg"/>
                      <Tooltip
                        label={
                          score.created_at
                            ? new Date(score.created_at).toLocaleString("fr-FR")
                            : "Date inconnue"
                        }
                      >
                        <HStack spacing={1}>
                          <Icon as={TimeIcon} boxSize={3} color="gray.400" />
                          <Text fontSize="xs" color="gray.500">
                            {score.created_at
                              ? new Date(score.created_at).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    day: "2-digit",
                                    month: "short"
                                  }
                                )
                              : "-"}
                          </Text>
                        </HStack>
                      </Tooltip>
                    </VStack>
                  </Box>

                  {/* Actions */}
                  {(isAdmin || isGuildManager) && (
                    <Box w={{ base: "full", lg: "100px" }} textAlign="center">
                      <HStack
                        spacing={2}
                        justify={{ base: "flex-start", lg: "center" }}
                      >
                        <Tooltip label="Modifier">
                          <IconButton
                            size="sm"
                            icon={<EditIcon />}
                            colorScheme="blue"
                            variant="ghost"
                            aria-label="Modifier le score"
                            onClick={() => onEditScore(score)}
                          />
                        </Tooltip>
                        <Tooltip label="Supprimer">
                          <IconButton
                            size="sm"
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            variant="ghost"
                            aria-label="Supprimer le score"
                            onClick={() => onDeleteScore(score)}
                          />
                        </Tooltip>
                      </HStack>
                    </Box>
                  )}
                </Flex>
              </CardBody>
            </Card>
          );
        })}
      </VStack>
    </Box>
  );
};

export default ScoresTable;
