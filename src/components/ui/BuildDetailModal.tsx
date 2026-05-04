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
  Avatar,
  Image,
  useColorModeValue,
  Stack
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { UserDisplay } from "./UserDisplay";
import { AffinityIcon } from "./AffinityIcon";
import type { IBuild } from "../../interfaces";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "react-i18next";

interface BuildDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: IBuild | null;
  onEdit?: (build: IBuild) => void;
}

export const BuildDetailModal = ({
  isOpen,
  onClose,
  build,
  onEdit
}: BuildDetailModalProps) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const linkBgColor = useColorModeValue("gray.50", "gray.700");
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const bucketUrl = import.meta.env.VITE_BUCKET_URL;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Vérifier si l'utilisateur peut éditer ce build
  const canEdit = build && currentUser && (
    build.user_id === currentUser._id || currentUser.is_admin
  );

  const handleEdit = () => {
    if (build && onEdit) {
      onEdit(build);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("components.buildDetailModal.title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {build && (
            <VStack align="stretch" spacing={4}>
              {/* Utilisateur */}
              <Box>
                <Text fontWeight="bold" mb={2}>
                  {t("components.buildDetailModal.createdBy")}
                </Text>
                {build.user ? (
                  <UserDisplay user={build.user} />
                ) : (
                  <Text color="gray.500">{t("components.buildDetailModal.anonymousUser")}</Text>
                )}
              </Box>

              {/* Rotation */}
              {build.rotation && (
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    {t("components.buildDetailModal.rotation")}
                  </Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="blue">{t(`factions.${build.rotation.killer}`, build.rotation.killer)}</Badge>
                    <Badge colorScheme="green">{t(`attackTypes.${build.rotation.attack}`, build.rotation.attack)}</Badge>
                    <Badge colorScheme="orange">
                      {t(`alterations.${build.rotation.alteration}`, build.rotation.alteration)}
                    </Badge>
                  </HStack>
                </Box>
              )}

              {/* Description */}
              <Box>
                <Text fontWeight="bold" mb={2}>
                  {t("components.buildDetailModal.description")}
                </Text>
                <Text whiteSpace="pre-wrap">
                  {build.description || t("components.buildDetailModal.noDescription")}
                </Text>
              </Box>

              {/* Statut */}
              {build.isValid !== undefined && build.user?.is_admin && (
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    {t("components.buildDetailModal.status")}
                  </Text>
                  <Badge
                    colorScheme={build.isValid ? "green" : "gray"}
                    fontSize="md"
                    p={2}
                  >
                    {build.isValid ? t("components.buildDetailModal.statusValid") : t("components.buildDetailModal.statusPending")}
                  </Badge>
                </Box>
              )}

              {/* Team */}
              <Box>
                <Text fontWeight="bold" mb={2}>
                  {t("components.buildDetailModal.teamComposition")}
                </Text>
                <Stack
                  direction={{ base: "column", xl: "row" }}
                  justify="space-around"
                  align="stretch"
                  spacing={3}
                >
                  {build.team?.map((member, index) => (
                    <Box
                      key={index}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={borderColor}
                    >
                      <VStack spacing={3} mb={2} justify="flex-start">
                        <Badge colorScheme="purple">
                          {t("components.buildDetailModal.position", { pos: member.position })}
                        </Badge>
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            src={`${bucketUrl}/characters/thumb/${member.character?._id}.png`}
                            name={member.character?.name || "?"}
                            bg="gray.200"
                          />
                          <Text fontWeight="medium">
                            {member.character?.name ||
                              t("components.buildDetailModal.characterFallback", { id: member.id_character })}
                          </Text>
                          {member.character?.affinity && (
                            <AffinityIcon
                              affinity={member.character.affinity}
                              size="20px"
                            />
                          )}
                        </HStack>
                      </VStack>

                      {/* Skills */}
                      {member.skills && member.skills.length > 0 && (
                        <Box ml={4} mt={2}>
                          <Text fontSize="sm" fontWeight="medium" mb={1}>
                            {t("components.buildDetailModal.skills")}
                          </Text>
                          <HStack spacing={2} flexWrap="wrap">
                            {member.skills.map((skill, skillIndex) => {
                              const skillName =
                                typeof skill === "string" ? skill : skill.name;
                              return (
                                <Badge
                                  key={skillIndex}
                                  colorScheme="purple"
                                  fontSize="xs"
                                  px={3}
                                  py={1}
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
                        <Box ml={4} mt={2}>
                          <Text fontSize="sm" fontWeight="medium" mb={1}>
                            {t("components.buildDetailModal.accessories")}
                          </Text>
                          <VStack align="stretch" spacing={2}>
                            {member.accessories.map((acc, accIndex) => (
                              <Stack
                                direction={{ base: "column", md: "row" }}
                                key={accIndex}
                                spacing={1}
                              >
                                <HStack spacing={1.5}>
                                  {acc.accessory?.code && (
                                    <Image
                                      src={`${bucketUrl}/accessories/${acc.accessory.code}/thumb.png`}
                                      alt={acc.accessory.name}
                                      boxSize="22px"
                                      borderRadius="sm"
                                      objectFit="contain"
                                      fallback={<Box boxSize="22px" />}
                                    />
                                  )}
                                  <Badge
                                    colorScheme="cyan"
                                    fontSize="xs"
                                    px={2}
                                    py={1}
                                    w={"max-content"}
                                  >
                                    {acc.accessory?.name}
                                  </Badge>
                                </HStack>
                                {acc.subeffect && (
                                  <>
                                    <Text
                                      fontSize="xs"
                                      color="gray.500"
                                      display={{ base: "none", md: "block" }}
                                    >
                                      →
                                    </Text>
                                    <Badge
                                      colorScheme="teal"
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                      w={"max-content"}
                                    >
                                      {acc.subeffect.name}
                                    </Badge>
                                  </>
                                )}
                              </Stack>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      {/* Links */}
                      {member.links && member.links.length > 0 && (
                        <Box ml={4} mt={2}>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            {t("components.buildDetailModal.links")}
                          </Text>
                          <VStack align="stretch" spacing={2}>
                            {member.links.map((link, linkIndex) => (
                              <Box
                                key={linkIndex}
                                p={2}
                                borderRadius="md"
                                bg={linkBgColor}
                              >
                                <HStack spacing={2} align="start">
                                  <Avatar
                                    size="xs"
                                    src={`${bucketUrl}/characters/thumb/${link.character?._id}.png`}
                                    name={link.character?.name || "?"}
                                    bg="gray.200"
                                  />
                                  <VStack align="start" spacing={0} flex={1}>
                                    <HStack spacing={2} align="center">
                                      <Text fontSize="sm" fontWeight="medium">
                                        {link.character?.name ||
                                          t("components.buildDetailModal.characterFallback", { id: link.id_character })}
                                      </Text>
                                      {link.character?.affinity && (
                                        <AffinityIcon
                                          affinity={link.character.affinity}
                                          size="14px"
                                        />
                                      )}
                                    </HStack>
                                    {link.character?.soul_traits &&
                                      link.character.soul_traits.map(
                                        (trait, traitIdx) => (
                                          <Text
                                            key={traitIdx}
                                            fontSize="xs"
                                            color="gray.500"
                                            mt={1}
                                            noOfLines={2}
                                          >
                                            {trait}
                                          </Text>
                                        )
                                      )}
                                  </VStack>
                                </HStack>
                              </Box>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Dates */}
              <Box>
                <Text fontWeight="bold" mb={2}>
                  {t("components.buildDetailModal.dates")}
                </Text>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm">
                    <strong>{t("components.buildDetailModal.dateCreated")}</strong> {formatDate(build.created_at)}
                  </Text>
                  {build.updated_at && (
                    <Text fontSize="sm">
                      <strong>{t("components.buildDetailModal.dateModified")}</strong> {formatDate(build.updated_at)}
                    </Text>
                  )}
                  {build.isValid && (
                    <Text fontSize="sm">
                      <strong>{t("components.buildDetailModal.dateValidated")}</strong> {formatDate(build.validated_at)}
                    </Text>
                  )}
                </VStack>
              </Box>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            {canEdit && onEdit && (
              <Button
                leftIcon={<EditIcon />}
                colorScheme="blue"
                onClick={handleEdit}
              >
                {t("components.buildDetailModal.buttonEdit")}
              </Button>
            )}
            <Button onClick={onClose}>{t("components.buildDetailModal.buttonClose")}</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
