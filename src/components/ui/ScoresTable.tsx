import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Flex,
  useColorMode,
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
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const containerBg = isDark ? 'gray.800' : 'white';
  const borderColor = isDark ? 'whiteAlpha.100' : 'gray.200';
  const headerBg = isDark ? 'rgba(255,255,255,0.03)' : 'gray.50';
  const rowHoverBg = isDark ? 'rgba(124,58,237,0.06)' : 'purple.50';
  const rowDivider = isDark ? 'whiteAlpha.60' : 'gray.100';

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
    <Box
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      bg={containerBg}
      overflow="hidden"
      boxShadow={isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)'}
    >
      {/* En-têtes (masqué sur mobile) */}
      <Box
        display={{ base: "none", lg: "block" }}
        bg={headerBg}
        px={4}
        py={3}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Flex align="center" gap={4}>
          <Box w="200px">
            <Text fontSize="2xs" fontWeight="semibold" letterSpacing="widest"
              textTransform="uppercase" color={isDark ? 'gray.400' : 'gray.500'}>
              Joueur
            </Text>
          </Box>
          <Box w="180px">
            <Text fontSize="2xs" fontWeight="semibold" letterSpacing="widest"
              textTransform="uppercase" color={isDark ? 'gray.400' : 'gray.500'}>
              <Icon as={CalendarIcon} mr={1} />Cycle
            </Text>
          </Box>
          <Box flex={1}>
            <Text fontSize="2xs" fontWeight="semibold" letterSpacing="widest"
              textTransform="uppercase" color={isDark ? 'gray.400' : 'gray.500'}>
              Rotation
            </Text>
          </Box>
          <Box w="140px" textAlign="center">
            <Text fontSize="2xs" fontWeight="semibold" letterSpacing="widest"
              textTransform="uppercase" color={isDark ? 'gray.400' : 'gray.500'}>
              Score
            </Text>
          </Box>
          {(isAdmin || isGuildManager) && (
            <Box w="100px" textAlign="center">
              <Text fontSize="2xs" fontWeight="semibold" letterSpacing="widest"
                textTransform="uppercase" color={isDark ? 'gray.400' : 'gray.500'}>
                Actions
              </Text>
            </Box>
          )}
        </Flex>
      </Box>

      {/* Liste des scores */}
      <VStack spacing={0} align="stretch">
        {scores.map((score, idx) => {
          const owner = getUserInfo(score.user_id);
          // Le nom/compte affichés doivent être ceux qui ont réellement produit CE score, pas le
          // compte bbs principal actuel du user — un compte peut avoir été transféré à un autre
          // user depuis (les scores restent volontairement sous l'ancien user_id, cf. account
          // transfer), ou le user peut avoir plusieurs comptes bbs dans la même guilde.
          const user = owner
            ? { ...owner, bbs_name: score.bbs_name || owner.bbs_name, bbs_id: score.bbs_id || owner.bbs_id }
            : undefined;
          const cycle = getCycleInfo(score.cycle_id);
          const rotation = getRotationInfo(score.cycle_id, score.rotation_id);

          return (
            <Box
              key={score._id}
              px={4}
              py={3}
              borderBottom={idx < scores.length - 1 ? "1px solid" : "none"}
              borderColor={rowDivider}
              bg={idx % 2 === 1 ? (isDark ? 'rgba(255,255,255,0.015)' : 'gray.50/40') : 'transparent'}
              _hover={{ bg: rowHoverBg }}
              transition="background 0.15s"
            >
                <Flex
                  direction={{ base: "column", lg: "row" }}
                  gap={{ base: 3, lg: 4 }}
                  align={{ base: "stretch", lg: "center" }}
                >
                  {/* Joueur */}
                  <Box w={{ base: "full", lg: "200px" }}>
                    <Text
                      display={{ base: "block", lg: "none" }}
                      fontSize="2xs"
                      color={isDark ? 'gray.500' : 'gray.400'}
                      mb={1}
                      fontWeight="semibold"
                      letterSpacing="widest"
                      textTransform="uppercase"
                    >
                      Joueur
                    </Text>
                    <UserDisplay user={user} />
                  </Box>

                  {/* Cycle */}
                  <Box w={{ base: "full", lg: "180px" }}>
                    <Text
                      display={{ base: "block", lg: "none" }}
                      fontSize="2xs"
                      color={isDark ? 'gray.500' : 'gray.400'}
                      mb={1}
                      fontWeight="semibold"
                      letterSpacing="widest"
                      textTransform="uppercase"
                    >
                      <Icon as={CalendarIcon} mr={1} />Cycle
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
                      fontSize="2xs"
                      color={isDark ? 'gray.500' : 'gray.400'}
                      mb={1}
                      fontWeight="semibold"
                      letterSpacing="widest"
                      textTransform="uppercase"
                    >
                      Rotation
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
                      fontSize="2xs"
                      color={isDark ? 'gray.500' : 'gray.400'}
                      mb={1}
                      fontWeight="semibold"
                      letterSpacing="widest"
                      textTransform="uppercase"
                    >
                      Score
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
                            colorScheme="purple"
                            variant="ghost"
                            borderRadius="full"
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
                            borderRadius="full"
                            aria-label="Supprimer le score"
                            onClick={() => onDeleteScore(score)}
                          />
                        </Tooltip>
                      </HStack>
                    </Box>
                  )}
                </Flex>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default ScoresTable;
