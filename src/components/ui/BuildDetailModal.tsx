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
  Grid,
  GridItem,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import { EditIcon, CalendarIcon, CheckCircleIcon, TimeIcon } from "@chakra-ui/icons";
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

export const BuildDetailModal = ({
  isOpen,
  onClose,
  build,
  onEdit,
}: BuildDetailModalProps) => {
  const cardBg = "bg.card";
  const cardBorder = "bg.inset";
  const sectionBg = "bg.muted";
  const headerBg = "bg.page";
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
        {/* Header with rotation info */}
        <ModalHeader bg={headerBg} borderBottomWidth="1px" borderColor={cardBorder} pb={4}>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between" align="flex-start" pr={8}>
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="bold">
                  {t("components.buildDetailModal.title")}
                </Text>
                {build?.user && <UserDisplay user={build.user} />}
              </VStack>
              {build?.isValid !== undefined && build.user?.is_admin && (
                <Badge
                  colorScheme={build.isValid ? "green" : "yellow"}
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Icon as={build.isValid ? CheckCircleIcon : TimeIcon} boxSize={3} />
                  {build.isValid
                    ? t("components.buildDetailModal.statusValid")
                    : t("components.buildDetailModal.statusPending")}
                </Badge>
              )}
            </HStack>

            {build?.rotation && (
              <HStack spacing={2} flexWrap="wrap">
                <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                  {t(`factions.${build.rotation.killer}`, build.rotation.killer)}
                </Badge>
                <Badge colorScheme="green" px={3} py={1} borderRadius="full" fontSize="sm">
                  {t(`attackTypes.${build.rotation.attack}`, build.rotation.attack)}
                </Badge>
                <Badge colorScheme="orange" px={3} py={1} borderRadius="full" fontSize="sm">
                  {t(`alterations.${build.rotation.alteration}`, build.rotation.alteration)}
                </Badge>
              </HStack>
            )}
          </VStack>
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />

        <ModalBody p={5}>
          {build && (
            <VStack align="stretch" spacing={5}>
              {/* Description */}
              {build.description && (
                <Box
                  p={4}
                  bg={sectionBg}
                  borderRadius="lg"
                  borderLeftWidth="3px"
                  borderLeftColor="blue.400"
                >
                  <Text fontSize="sm" color={mutedText} mb={1} fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                    {t("components.buildDetailModal.description")}
                  </Text>
                  <Text whiteSpace="pre-wrap">{build.description}</Text>
                </Box>
              )}

              {/* Team composition */}
              <Box>
                <Text fontWeight="bold" fontSize="md" mb={3}>
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
                                        ⚡ {skillName}
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

              {/* Dates */}
              <HStack
                spacing={4}
                p={3}
                bg={sectionBg}
                borderRadius="lg"
                flexWrap="wrap"
              >
                <HStack spacing={1.5} color={mutedText}>
                  <CalendarIcon boxSize={3} />
                  <Text fontSize="md">
                    <Text as="span" fontWeight="semibold">
                      {t("components.buildDetailModal.dateCreated")}
                    </Text>{" "}
                    {formatDate(build.created_at)}
                  </Text>
                </HStack>
                {build.updated_at && (
                  <HStack spacing={1.5} color={mutedText}>
                    <TimeIcon boxSize={3} />
                    <Text fontSize="md">
                      <Text as="span" fontWeight="semibold">
                        {t("components.buildDetailModal.dateModified")}
                      </Text>{" "}
                      {formatDate(build.updated_at)}
                    </Text>
                  </HStack>
                )}
                {build.isValid && build.validated_at && (
                  <HStack spacing={1.5} color="green.500">
                    <CheckCircleIcon boxSize={3} />
                    <Text fontSize="md">
                      <Text as="span" fontWeight="semibold">
                        {t("components.buildDetailModal.dateValidated")}
                      </Text>{" "}
                      {formatDate(build.validated_at)}
                    </Text>
                  </HStack>
                )}
              </HStack>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={cardBorder} bg={headerBg}>
          <HStack spacing={3}>
            {canEdit && onEdit && (
              <Button leftIcon={<EditIcon />} colorScheme="blue" onClick={handleEdit} size="sm">
                {t("components.buildDetailModal.buttonEdit")}
              </Button>
            )}
            <Button onClick={onClose} size="sm" variant="ghost">
              {t("components.buildDetailModal.buttonClose")}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
