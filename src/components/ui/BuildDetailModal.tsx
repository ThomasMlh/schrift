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
  useColorModeValue,
} from "@chakra-ui/react";
import { UserDisplay } from "./UserDisplay";
import { AffinityIcon } from "./AffinityIcon";
import type { IBuild } from "../../interfaces";

interface BuildDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: IBuild | null;
}

export const BuildDetailModal = ({ isOpen, onClose, build }: BuildDetailModalProps) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const linkBgColor = useColorModeValue("gray.50", "gray.700");

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Détails du Build</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {build && (
            <VStack align="stretch" spacing={4}>
              {/* Utilisateur */}
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Créé par :
                </Text>
                {build.user ? (
                  <UserDisplay user={build.user} />
                ) : (
                  <Text color="gray.500">Utilisateur anonyme</Text>
                )}
              </Box>

              {/* Rotation */}
              {build.rotation && (
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Rotation :
                  </Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="blue">{build.rotation.killer}</Badge>
                    <Badge colorScheme="green">{build.rotation.attack}</Badge>
                    <Badge colorScheme="orange">{build.rotation.alteration}</Badge>
                  </HStack>
                </Box>
              )}

              {/* Description */}
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Description :
                </Text>
                <Text whiteSpace="pre-wrap">{build.description || "Aucune description"}</Text>
              </Box>

              {/* Statut */}
              {build.isValid !== undefined && build.user?.is_admin && (
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Statut :
                  </Text>
                  <Badge colorScheme={build.isValid ? "green" : "gray"} fontSize="md" p={2}>
                    {build.isValid ? "✓ Validé" : "⏱ En attente de validation"}
                  </Badge>
                </Box>
              )}

              {/* Team */}
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Composition de la team :
                </Text>
                <VStack align="stretch" spacing={3}>
                  {build.team?.map((member, index) => (
                    <Box
                      key={index}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={borderColor}
                    >
                      <HStack spacing={3} mb={2} justify="space-between">
                        <HStack spacing={3}>
                          <Badge colorScheme="purple">Position {member.position}</Badge>
                          <Avatar
                            size="sm"
                            src={member.character?.link || member.character?.image}
                            name={member.character?.name || "?"}
                            bg="gray.200"
                          />
                          <Text fontWeight="medium">
                            {member.character?.name || `Personnage ${member.id_character}`}
                          </Text>
                        </HStack>
                        {member.character?.affinity && (
                          <AffinityIcon affinity={member.character.affinity} size="20px" />
                        )}
                      </HStack>
                      
                      {/* Skills */}
                      {member.skills && member.skills.length > 0 && (
                        <Box ml={4} mt={2}>
                          <Text fontSize="sm" fontWeight="medium" mb={1}>
                            Compétences :
                          </Text>
                          <HStack spacing={2} flexWrap="wrap">
                            {member.skills.map((skill, skillIndex) => {
                              const skillName = typeof skill === 'string' ? skill : skill.name;
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
                            Accessoires :
                          </Text>
                          <VStack align="stretch" spacing={1}>
                            {member.accessories.map((acc, accIndex) => (
                              <HStack key={accIndex} spacing={2}>
                                <Badge colorScheme="cyan" fontSize="xs" px={2} py={1}>
                                  {acc.accessory?.name || acc.id_accessory}
                                </Badge>
                                {acc.subeffect && (
                                  <>
                                    <Text fontSize="xs" color="gray.500">→</Text>
                                    <Badge colorScheme="teal" fontSize="xs" px={2} py={1}>
                                      {acc.subeffect.name}
                                    </Badge>
                                  </>
                                )}
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      )}
                      
                      {/* Links */}
                      {member.links && member.links.length > 0 && (
                        <Box ml={4} mt={2}>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            Links :
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
                                    src={link.character?.link || link.character?.image}
                                    name={link.character?.name || "?"}
                                    bg="gray.200"
                                  />
                                  <VStack align="start" spacing={0} flex={1}>
                                    <HStack spacing={2} align="center">
                                      <Text fontSize="sm" fontWeight="medium">
                                        {link.character?.name || `Personnage ${link.id_character}`}
                                      </Text>
                                      {link.character?.affinity && (
                                        <AffinityIcon affinity={link.character.affinity} size="14px" />
                                      )}
                                    </HStack>
                                    {link.character?.soul_traits && link.character.soul_traits.map((trait, traitIdx) => (
                                      <Text 
                                        key={traitIdx}
                                        fontSize="xs" 
                                        color="gray.500"
                                        mt={1}
                                        noOfLines={2}
                                      >
                                        {trait}
                                      </Text>
                                    ))}
                                  </VStack>
                                </HStack>
                              </Box>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* Dates */}
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Dates :
                </Text>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm">
                    <strong>Créé :</strong> {formatDate(build.created_at)}
                  </Text>
                  {build.updated_at && (
                    <Text fontSize="sm">
                      <strong>Modifié :</strong> {formatDate(build.updated_at)}
                    </Text>
                  )}
                  {build.isValid && (
                    <Text fontSize="sm">
                      <strong>Validé :</strong> {formatDate(build.validated_at)}
                    </Text>
                  )}
                </VStack>
              </Box>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Fermer</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
