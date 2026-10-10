import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  Box,
  Text,
  HStack,
  Badge,
  Image,
  Divider,
  Flex,
  SimpleGrid,
  Grid,
  GridItem,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import { EditIcon, CheckCircleIcon, TimeIcon } from "@chakra-ui/icons";
import { useState, type ReactNode } from "react";
import { FiMaximize2 } from "react-icons/fi";
import { AttackTypeBadge } from "./AttackTypeBadge";
import { AlterationImage } from "./AlterationImage";
import { ScoreBadge } from "./ScoreBadge";
import { ImageLightbox } from "./ImageLightbox";
import { formatChrono } from "@/utils/chrono";
import { UserDisplay } from "./UserDisplay";
import { AffinityIcon } from "./AffinityIcon";
import type { IBuild } from "../../interfaces";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "react-i18next";
import { bucketUrl } from "@/utils/apiRequest";

interface BuildDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: IBuild | null;
  onEdit?: (build: IBuild) => void;
}

const POSITION_COLORS = ["purple", "blue", "teal"] as const;

// Tuile du résultat (score, chronos)
const ResultTile = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box bg="bg.subtle" borderRadius="lg" borderWidth="1px" borderColor="border.subtle" px={3} py={2.5}>
    <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wide" fontWeight="semibold">{label}</Text>
    <Box fontSize="lg" fontWeight="extrabold" color="text.strong" mt={0.5}>{children}</Box>
  </Box>
);

const downloadImage = async (src: string, filename: string) => {
  try {
    const blob = await (await fetch(src)).blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    window.open(src, "_blank");
  }
};

export const BuildDetailModal = ({
  isOpen,
  onClose,
  build,
  onEdit,
}: BuildDetailModalProps) => {
  const cardBg = "bg.card";
  const cardBorder = "border.subtle";
  const sectionBg = "bg.muted";
  const linkCardBg = "bg.muted";
  const mutedText = "text.muted";
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canEdit =
    build &&
    currentUser &&
    (build.user_id === currentUser._id || currentUser.is_admin);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const screenshotUrl = build?.screenshot ? `${bucketUrl}/builds/${build.screenshot}` : null;
  const hasResult = build != null && (build.score != null || build.time_normal_wave != null || build.time_extra_wave != null);

  const handleEdit = () => {
    if (build && onEdit) {
      onEdit(build);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" overflow="hidden">
        {/* En-tête : rotation, auteur et statut */}
        <ModalHeader borderBottomWidth="1px" borderColor="border.subtle" pb={4}>
          <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} gap={3} pr={8} direction={{ base: "column", md: "row" }}>
            <Box minW={0}>
              {build?.rotation ? (
                <HStack spacing={2} flexWrap="wrap">
                  <AttackTypeBadge attackType={build.rotation.attack} size="14px" />
                  <Text fontSize="xl" fontWeight="extrabold" color="text.strong">
                    {t(`factions.${build.rotation.killer}`, build.rotation.killer)}
                  </Text>
                  {build.rotation.alteration && (
                    <HStack spacing={1.5}>
                      <AlterationImage alteration={build.rotation.alteration} size="18px" />
                      <Text fontSize="sm" fontWeight="medium" color="text.secondary">
                        {t(`alterations.${build.rotation.alteration}`, build.rotation.alteration)}
                      </Text>
                    </HStack>
                  )}
                </HStack>
              ) : (
                <Text fontSize="xl" fontWeight="extrabold">{t("components.buildDetailModal.title")}</Text>
              )}
              <HStack spacing={3} mt={1} fontSize="sm" fontWeight="normal" color="text.muted" flexWrap="wrap">
                {build?.user && <UserDisplay user={build.user} avatarSize="xs" textSize="sm" />}
                <Text>{formatDate(build?.created_at)}</Text>
              </HStack>
            </Box>
            {build && canEdit && (
              <Badge
                colorScheme={build.isValid ? "green" : "yellow"}
                variant="subtle"
                px={2.5}
                py={1}
                borderRadius="full"
                display="flex"
                alignItems="center"
                gap={1}
                flexShrink={0}
              >
                <Icon as={build.isValid ? CheckCircleIcon : TimeIcon} boxSize={3} />
                {build.isValid
                  ? t("components.buildDetailModal.statusValid")
                  : t("components.buildDetailModal.statusPending")}
              </Badge>
            )}
          </Flex>
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />

        <ModalBody p={5}>
          {build && (
            <VStack align="stretch" spacing={5}>
              {/* Résultat : score et chronos */}
              {hasResult && (
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                  {build.score != null && (
                    <ResultTile label={t("components.buildDetailModal.score")}>
                      <ScoreBadge score={build.score} fontSize="md" commas />
                    </ResultTile>
                  )}
                  {build.time_normal_wave != null && (
                    <ResultTile label={t("components.buildDetailModal.timeNormalWave")}>
                      {formatChrono(build.time_normal_wave)}
                    </ResultTile>
                  )}
                  {build.time_extra_wave != null && (
                    <ResultTile label={t("components.buildDetailModal.timeExtraWave")}>
                      {formatChrono(build.time_extra_wave)}
                    </ResultTile>
                  )}
                </SimpleGrid>
              )}

              {/* Capture d'écran */}
              {screenshotUrl && (
                <Box
                  as="button"
                  onClick={() => setLightboxOpen(true)}
                  borderRadius="xl"
                  overflow="hidden"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  bg="bg.inset"
                  position="relative"
                  role="group"
                  aria-label={t("components.buildDetailModal.screenshotOpen")}
                >
                  <Image src={screenshotUrl} alt={t("components.buildDetailModal.screenshot")} w="100%" maxH="420px" objectFit="contain" />
                  <HStack
                    position="absolute"
                    bottom={2}
                    right={2}
                    spacing={1}
                    px={2}
                    py={1}
                    borderRadius="md"
                    bg="blackAlpha.700"
                    color="white"
                    fontSize="xs"
                    opacity={0.85}
                    _groupHover={{ opacity: 1 }}
                  >
                    <Icon as={FiMaximize2} />
                    <Text>{t("components.buildDetailModal.screenshotOpen")}</Text>
                  </HStack>
                </Box>
              )}

              {/* Team composition */}
              <Box>
                <Text fontWeight="bold" color="text.strong" mb={3}>
                  {t("components.buildDetailModal.teamComposition")}
                </Text>
                <Grid
                  templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                  gap={4}
                >
                  {build.team?.map((member, index) => {
                    const positionColor = POSITION_COLORS[(member.position - 1) % POSITION_COLORS.length];
                    return (
                      <GridItem key={index}>
                        <Box
                          bg={cardBg}
                          borderWidth="1px"
                          borderColor={cardBorder}
                          borderRadius="xl"
                          overflow="hidden"
                          h="100%"
                          boxShadow="sm"
                          _hover={{ boxShadow: "md", borderColor: `${positionColor}.300` }}
                          transition="all 0.2s"
                        >
                          {/* Character header */}
                          <Box position="relative">
                            <Image
                              src={`${bucketUrl}/characters/full/${member.character?._id}.png`}
                              alt={member.character?.name || ""}
                              w="100%"
                              h="200px"
                              objectFit="cover"
                              objectPosition="middle"
                              fallbackSrc={`${bucketUrl}/characters/thumb/${member.character?._id}.png`}
                              bg={sectionBg}
                            />
                            <Box
                              position="absolute"
                              bottom={0}
                              left={0}
                              right={0}
                              h="70px"
                              bgGradient="linear(to-t, blackAlpha.800, transparent)"
                            />
                            <Badge
                              position="absolute"
                              top={2}
                              left={2}
                              colorScheme={positionColor}
                              borderRadius="full"
                              px={2}
                              py={0.5}
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              #{member.position}
                            </Badge>
                            <HStack
                              position="absolute"
                              bottom={2}
                              left={3}
                              right={3}
                              spacing={2}
                            >
                              <Text
                                color="white"
                                fontWeight="bold"
                                fontSize="sm"
                                noOfLines={1}
                                flex={1}
                                textShadow="0 1px 3px rgba(0,0,0,0.8)"
                              >
                                {member.character?.name ||
                                  t("components.buildDetailModal.characterFallback", {
                                    id: member.id_character,
                                  })}
                              </Text>
                              {member.character?.affinity && (
                                <AffinityIcon affinity={member.character.affinity} size="18px" />
                              )}
                            </HStack>
                          </Box>

                          <VStack align="stretch" spacing={0} divider={<Divider />}>
                            {/* Skills */}
                            {member.skills && member.skills.length > 0 && (
                              <Box p={3}>
                                <Text fontSize="xs" fontWeight="semibold" color={mutedText} textTransform="uppercase" letterSpacing="wide" mb={2}>
                                  {t("components.buildDetailModal.skills")}
                                </Text>
                                <HStack spacing={1.5} flexWrap="wrap">
                                  {member.skills.map((skill, skillIndex) => {
                                    const skillName =
                                      typeof skill === "string" ? skill : skill.name;
                                    return (
                                      <Badge
                                        key={skillIndex}
                                        colorScheme="purple"
                                        fontSize="xs"
                                        px={2}
                                        py={0.5}
                                        borderRadius="md"
                                      >
                                        {skillName}
                                      </Badge>
                                    );
                                  })}
                                </HStack>
                              </Box>
                            )}

                            {/* Accessories */}
                            {member.accessories && member.accessories.length > 0 && (
                              <Box p={3}>
                                <Text fontSize="xs" fontWeight="semibold" color={mutedText} textTransform="uppercase" letterSpacing="wide" mb={2}>
                                  {t("components.buildDetailModal.accessories")}
                                </Text>
                                <VStack align="stretch" spacing={1.5}>
                                  {member.accessories.map((acc, accIndex) => (
                                    <HStack key={accIndex} spacing={2} align="center">
                                      <Box flexShrink={0}>
                                        {acc.accessory?.code ? (
                                          <Image
                                            src={`${bucketUrl}/accessories/${acc.accessory.code}/thumb.png`}
                                            alt={acc.accessory?.name}
                                            boxSize="28px"
                                            borderRadius="md"
                                            objectFit="contain"
                                            fallback={<Box boxSize="28px" borderRadius="md" bg={sectionBg} />}
                                          />
                                        ) : (
                                          <Box boxSize="28px" borderRadius="md" bg={sectionBg} />
                                        )}
                                      </Box>
                                      <VStack align="start" spacing={0} flex={1} minW={0}>
                                        <Text fontSize="md" fontWeight="medium" noOfLines={1}>
                                          {acc.accessory?.name ?? "—"}
                                        </Text>
                                        {acc.subeffect && (
                                          <Text fontSize="sm" color={mutedText} noOfLines={1}>
                                            ↳ {acc.subeffect.name}
                                          </Text>
                                        )}
                                      </VStack>
                                    </HStack>
                                  ))}
                                </VStack>
                              </Box>
                            )}

                            {/* Links */}
                            {member.links && member.links.length > 0 && (
                              <Box p={3}>
                                <Text fontSize="xs" fontWeight="semibold" color={mutedText} textTransform="uppercase" letterSpacing="wide" mb={2}>
                                  {t("components.buildDetailModal.links")}
                                </Text>
                                <VStack align="stretch" spacing={1.5}>
                                  {member.links.map((link, linkIndex) => (
                                    <HStack
                                      key={linkIndex}
                                      p={2}
                                      bg={linkCardBg}
                                      borderRadius="md"
                                      spacing={2}
                                    >
                                      <Image
                                        src={`${bucketUrl}/characters/thumb/${link.character?._id}.png`}
                                        alt={link.character?.name || ""}
                                        boxSize="28px"
                                        borderRadius="full"
                                        objectFit="cover"
                                        bg="gray.200"
                                        fallback={<Box boxSize="28px" borderRadius="full" bg="gray.200" />}
                                      />
                                      <VStack align="start" spacing={0} flex={1} minW={0}>
                                        <HStack spacing={1}>
                                          <Text fontSize="md" fontWeight="semibold" noOfLines={1}>
                                            {link.character?.name ||
                                              t("components.buildDetailModal.characterFallback", {
                                                id: link.id_character,
                                              })}
                                          </Text>
                                          {link.character?.affinity && (
                                            <AffinityIcon affinity={link.character.affinity} size="12px" />
                                          )}
                                        </HStack>
                                        {link.character?.soul_traits?.slice(0, 1).map((trait, traitIdx) => (
                                          <Tooltip key={traitIdx} label={trait} hasArrow placement="top">
                                            <Text fontSize="sm" color={mutedText} noOfLines={1}>
                                              {trait}
                                            </Text>
                                          </Tooltip>
                                        ))}
                                      </VStack>
                                    </HStack>
                                  ))}
                                </VStack>
                              </Box>
                            )}
                          </VStack>
                        </Box>
                      </GridItem>
                    );
                  })}
                </Grid>
              </Box>

              {/* Notes */}
              {build.description && (
                <Box p={4} bg="bg.subtle" borderRadius="lg" borderWidth="1px" borderColor="border.subtle">
                  <Text fontSize="xs" color="text.muted" mb={1} fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                    {t("components.buildDetailModal.description")}
                  </Text>
                  <Text whiteSpace="pre-wrap" color="text.body">{build.description}</Text>
                </Box>
              )}

              {build.updated_at && build.updated_at !== build.created_at && (
                <Text fontSize="xs" color="text.muted">
                  {t("components.buildDetailModal.dateModified")} {formatDate(build.updated_at)}
                </Text>
              )}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor="border.subtle">
          <HStack spacing={3}>
            {canEdit && onEdit && (
              <Button leftIcon={<EditIcon />} colorScheme="purple" onClick={handleEdit} size="sm">
                {t("components.buildDetailModal.buttonEdit")}
              </Button>
            )}
            <Button onClick={onClose} size="sm" variant="ghost">
              {t("components.buildDetailModal.buttonClose")}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
      <ImageLightbox
        src={lightboxOpen ? screenshotUrl : null}
        label={t("components.buildDetailModal.screenshot")}
        characterName={build?.rotation ? t(`factions.${build.rotation.killer}`, build.rotation.killer) : "build"}
        onClose={() => setLightboxOpen(false)}
        onDownload={downloadImage}
      />
    </Modal>
  );
};
