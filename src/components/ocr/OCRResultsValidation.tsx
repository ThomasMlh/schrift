import {
  Card,
  CardBody,
  VStack,
  Text,
  Box,
  Button,
  useColorModeValue,
  HStack,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Image,
  NumberInput,
  NumberInputField,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from "@chakra-ui/react";
import { useState } from "react";
import { FiArrowLeft, FiCheck, FiRefreshCw } from "react-icons/fi";
import { CustomSelect } from "../ui/CustomSelect";
import type { IUser } from "@/interfaces";

interface PlayerResult {
  lineNumber: number;
  detectedName: string;
  score: number | null;
  matching: {
    bestMatch: {
      _id: string;
      user_id: string;
      bbs_id: string;
      bbs_name: string;
      global_name: string;
      avatar?: string;
      confidence: number;
      autoSelected: boolean;
    } | null;
    alternatives: Array<{
      _id: string;
      user_id: string;
      bbs_id: string;
      bbs_name: string;
      confidence: number;
    }>;
  };
  needsReview: boolean;
}

interface ScreenshotResult {
  index: number;
  filename: string;
  success: boolean;
  thumbnail?: string;
  players: PlayerResult[];
  error?: string;
}

interface OCRResultsValidationProps {
  results: ScreenshotResult[];
  guildMembers: IUser[];
  onSubmit: (scores: Array<{ user_id: string; bbs_id: string; raw_score: number; screenshot_index: number }>) => void;
  onBack: () => void;
  onReset: () => void;
  isSubmitting: boolean;
}

export const OCRResultsValidation = ({
  results,
  guildMembers,
  onSubmit,
  onBack,
  onReset,
  isSubmitting
}: OCRResultsValidationProps) => {
  // État pour gérer les modifications utilisateur (bbs_id identifie le compte précis, user_id son propriétaire)
  const [editedResults, setEditedResults] = useState<Map<string, { user_id: string; bbs_id: string; score: number }>>(
    new Map()
  );

  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = "bg.card";
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Formatage des scores avec virgules (ex: 1234567 → 1,234,567)
  const formatNumber = (value: string | number): string => {
    const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
    return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseNumber = (value: string): string => {
    return value.replace(/,/g, "");
  };

  const totalPlayers = results.reduce((sum, r) => sum + (r.players?.length || 0), 0);
  const needsReview = results.reduce(
    (sum, r) => sum + (r.players?.filter(p => p.needsReview).length || 0),
    0
  );

  // Un compte par ligne (bbs_id = valeur unique du select), pas un user par ligne — un user avec
  // plusieurs comptes dans la même guilde apparaît donc plusieurs fois, chacun sélectionnable.
  const membersWithAccount = guildMembers.filter(m => m.bbs_id);
  const memberOptions = membersWithAccount.map(m => ({
    value: m.bbs_id!,
    label: m.bbs_name || m.global_name || "Joueur"
  }));

  const getPlayerKey = (screenshotIndex: number, lineNumber: number) => {
    return `${screenshotIndex}-${lineNumber}`;
  };

  const getPlayerData = (screenshot: ScreenshotResult, player: PlayerResult) => {
    const key = getPlayerKey(screenshot.index, player.lineNumber);
    const edited = editedResults.get(key);

    if (edited) {
      return edited;
    }

    return {
      user_id: player.matching.bestMatch?.user_id || player.matching.bestMatch?._id || "",
      bbs_id: player.matching.bestMatch?.bbs_id || "",
      score: player.score || 0
    };
  };

  const handleUserChange = (screenshot: ScreenshotResult, player: PlayerResult, bbsId: string) => {
    const key = getPlayerKey(screenshot.index, player.lineNumber);
    const currentData = getPlayerData(screenshot, player);
    const member = membersWithAccount.find(m => m.bbs_id === bbsId);

    setEditedResults(new Map(editedResults.set(key, {
      ...currentData,
      user_id: member?._id || "",
      bbs_id: bbsId
    })));
  };

  const handleScoreChange = (screenshot: ScreenshotResult, player: PlayerResult, score: number) => {
    const key = getPlayerKey(screenshot.index, player.lineNumber);
    const currentData = getPlayerData(screenshot, player);
    
    setEditedResults(new Map(editedResults.set(key, {
      ...currentData,
      score
    })));
  };

  const handleSubmit = () => {
    const scores: Array<{ user_id: string; bbs_id: string; raw_score: number; screenshot_index: number }> = [];

    results.forEach(screenshot => {
      screenshot.players.forEach(player => {
        const data = getPlayerData(screenshot, player);

        if (data.user_id && data.bbs_id && data.score > 0) {
          scores.push({
            user_id: data.user_id,
            bbs_id: data.bbs_id,
            raw_score: data.score, // Le score détecté est le raw_score
            screenshot_index: screenshot.index
          });
        }
      });
    });

    onSubmit(scores);
  };

  const canSubmit = () => {
    // Vérifier que tous les joueurs ont un compte (bbs_id) et un score valide
    return results.every(screenshot =>
      screenshot.players.every(player => {
        const data = getPlayerData(screenshot, player);
        return data.user_id && data.bbs_id && data.score > 0;
      })
    );
  };

  const handleImageClick = (thumbnail: string) => {
    setFullscreenImage(thumbnail);
    onOpen();
  };

  return (
    <>
      <Card bg={bgColor} borderRadius="xl" boxShadow="lg" borderWidth="1px" borderColor={borderColor} overflow="visible">
        <CardBody overflow="visible">
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="2xl" fontWeight="bold" mb={2}>
                ✅ Validation des résultats
              </Text>
              <Text color="gray.500">
                Vérifiez et corrigez les détections avant soumission
              </Text>
            </Box>

            {/* Statistiques */}
            <Alert status={needsReview > 0 ? "warning" : "success"} borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <HStack spacing={4}>
                  <Text fontWeight="bold">
                    {totalPlayers} joueur{totalPlayers > 1 ? "s" : ""} détecté{totalPlayers > 1 ? "s" : ""}
                  </Text>
                  {needsReview > 0 && (
                    <Badge colorScheme="orange">
                      {needsReview} à réviser
                    </Badge>
                  )}
                  {needsReview === 0 && (
                    <Badge colorScheme="green">
                      Tous validés ✓
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </Alert>

            {/* Liste des screenshots avec résultats */}
            <Accordion allowMultiple defaultIndex={[0]}>
              {results.map((screenshot) => (
                <AccordionItem key={screenshot.index} borderColor={borderColor}>
                  <AccordionButton>
                    <HStack flex="1" spacing={4} wrap={"wrap"}>
                      {screenshot.thumbnail && (
                        <Image
                          src={screenshot.thumbnail}
                          w="60px"
                          h="40px"
                          objectFit="cover"
                          borderRadius="md"
                          cursor="pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (screenshot.thumbnail) {
                              handleImageClick(screenshot.thumbnail);
                            }
                          }}
                        />
                      )}
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold">Screenshot {screenshot.index + 1}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {screenshot.filename} • {screenshot.players.length} joueur
                          {screenshot.players.length > 1 ? "s" : ""}
                        </Text>
                      </Box>
                      {screenshot.players.some(p => p.needsReview) ? (
                        <Badge colorScheme="orange">⚠️ À vérifier</Badge>
                      ) : (
                        <Badge colorScheme="green">✅ Validé</Badge>
                      )}
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>

                  <AccordionPanel pb={4} overflow="visible">
                    {/* Layout mobile : cartes empilées */}
                    <Box display={{ base: "flex", md: "none" }} flexDirection="column" gap={3}>
                      {screenshot.players.map((player) => {
                        const data = getPlayerData(screenshot, player);
                        return (
                          <Box
                            key={player.lineNumber}
                            borderWidth="1px"
                            borderColor={borderColor}
                            borderRadius="md"
                            p={3}
                            bg={player.needsReview ? "orange.900" : undefined}
                          >
                            <HStack justify="space-between" mb={2}>
                              <Text fontFamily="mono" fontSize="sm" fontWeight="bold">
                                {player.detectedName || "???"}
                              </Text>
                              {player.matching.bestMatch ? (
                                <Badge
                                  colorScheme={
                                    player.matching.bestMatch.confidence > 0.90
                                      ? "green"
                                      : player.matching.bestMatch.confidence > 0.70
                                      ? "yellow"
                                      : "red"
                                  }
                                  fontSize="xs"
                                >
                                  {Math.round(player.matching.bestMatch.confidence * 100)}%
                                </Badge>
                              ) : (
                                <Badge colorScheme="red" fontSize="xs">Aucun match</Badge>
                              )}
                            </HStack>
                            <VStack spacing={2} align="stretch">
                              <CustomSelect
                                value={data.bbs_id}
                                onChange={(value) => handleUserChange(screenshot, player, value)}
                                options={memberOptions}
                                placeholder="Choisir un joueur"
                                size="sm"
                              />
                              <NumberInput
                                value={data.score}
                                onChange={(_, value) => handleScoreChange(screenshot, player, value)}
                                min={0}
                                size="sm"
                                format={formatNumber}
                                parse={parseNumber}
                              >
                                <NumberInputField placeholder="Score" />
                              </NumberInput>
                            </VStack>
                          </Box>
                        );
                      })}
                    </Box>

                    {/* Layout desktop : tableau */}
                    <Box display={{ base: "none", md: "block" }} overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Nom détecté</Th>
                            <Th>Joueur</Th>
                            <Th>Score</Th>
                            <Th>Confiance</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {screenshot.players.map((player) => {
                            const data = getPlayerData(screenshot, player);
                            return (
                              <Tr key={player.lineNumber}>
                                <Td>
                                  <Text fontFamily="mono" fontSize="sm">
                                    {player.detectedName || "???"}
                                  </Text>
                                </Td>
                                <Td>
                                  <CustomSelect
                                    value={data.bbs_id}
                                    onChange={(value) => handleUserChange(screenshot, player, value)}
                                    options={memberOptions}
                                    placeholder="Choisir un joueur"
                                    size="sm"
                                  />
                                </Td>
                                <Td>
                                  <NumberInput
                                    value={data.score}
                                    onChange={(_, value) => handleScoreChange(screenshot, player, value)}
                                    min={0}
                                    size="sm"
                                    format={formatNumber}
                                    parse={parseNumber}
                                  >
                                    <NumberInputField />
                                  </NumberInput>
                                </Td>
                                <Td>
                                  {player.matching.bestMatch && (
                                    <Badge
                                      colorScheme={
                                        player.matching.bestMatch.confidence > 0.90
                                          ? "green"
                                          : player.matching.bestMatch.confidence > 0.70
                                          ? "yellow"
                                          : "red"
                                      }
                                    >
                                      {Math.round(player.matching.bestMatch.confidence * 100)}%
                                    </Badge>
                                  )}
                                  {!player.matching.bestMatch && (
                                    <Badge colorScheme="red">Aucun match</Badge>
                                  )}
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Actions */}
            <VStack spacing={2} align="stretch" display={{ base: "flex", md: "none" }}>
              <Button
                colorScheme="green"
                size="lg"
                leftIcon={<Icon as={FiCheck} />}
                onClick={handleSubmit}
                isDisabled={!canSubmit()}
                isLoading={isSubmitting}
                loadingText="Soumission..."
                w="full"
              >
                Soumettre {totalPlayers} score{totalPlayers > 1 ? "s" : ""}
              </Button>
              <HStack spacing={2}>
                <Button
                  leftIcon={<Icon as={FiArrowLeft} />}
                  onClick={onBack}
                  isDisabled={isSubmitting}
                  flex={1}
                  size="sm"
                >
                  Retour
                </Button>
                <Button
                  leftIcon={<Icon as={FiRefreshCw} />}
                  onClick={onReset}
                  variant="outline"
                  colorScheme="red"
                  isDisabled={isSubmitting}
                  flex={1}
                  size="sm"
                >
                  Recommencer
                </Button>
              </HStack>
            </VStack>

            <HStack justify="space-between" display={{ base: "none", md: "flex" }}>
              <HStack>
                <Button
                  leftIcon={<Icon as={FiArrowLeft} />}
                  onClick={onBack}
                  isDisabled={isSubmitting}
                >
                  Retour
                </Button>
                <Button
                  leftIcon={<Icon as={FiRefreshCw} />}
                  onClick={onReset}
                  variant="outline"
                  colorScheme="red"
                  isDisabled={isSubmitting}
                >
                  Recommencer
                </Button>
              </HStack>

              <Button
                colorScheme="green"
                size="lg"
                leftIcon={<Icon as={FiCheck} />}
                onClick={handleSubmit}
                isDisabled={!canSubmit()}
                isLoading={isSubmitting}
                loadingText="Soumission..."
              >
                Soumettre {totalPlayers} score{totalPlayers > 1 ? "s" : ""}
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Modal image plein écran */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={0}>
            {fullscreenImage && (
              <Image src={fullscreenImage} w="100%" h="auto" />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
