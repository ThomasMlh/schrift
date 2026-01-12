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
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  Text,
  Box,
  HStack,
  IconButton,
  Badge,
  Alert,
  AlertIcon,
  useColorModeValue
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { createBuild } from "../../hooks/useAPIMutations";
import { useCharacters } from "../../hooks/useAPI";
import { CharacterSearchSelect } from "./CharacterSearchSelect";
import { SkillSearchSelect } from "./SkillSearchSelect";
import { AccessorySearchSelect } from "./AccessorySearchSelect";

interface BuildCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rotationId: string;
  onSuccess: () => void;
}

interface TeamMember {
  id_character: string;
  position: number;
  links: Array<{ id_character: string }>;
  skills?: string[];
  accessories?: Array<{ id_accessory: string; id_subeffect?: string }>;
}

const BuildCreationModal = ({ isOpen, onClose, rotationId, onSuccess }: BuildCreationModalProps) => {
  const [description, setDescription] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([
    { id_character: "", position: 1, links: [], skills: [], accessories: [] },
    { id_character: "", position: 2, links: [], skills: [], accessories: [] },
    { id_character: "", position: 3, links: [], skills: [], accessories: [] },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.700");

  // Récupérer tous les personnages
  const { characters, isLoading: isLoadingCharacters } = useCharacters({
    limit: 1000,
  });

  useEffect(() => {
    // Réinitialiser le formulaire quand la modal s'ouvre
    if (isOpen) {
      setDescription("");
      setTeam([
        { id_character: "", position: 1, links: [], skills: [], accessories: [] },
        { id_character: "", position: 2, links: [], skills: [], accessories: [] },
        { id_character: "", position: 3, links: [], skills: [], accessories: [] },
      ]);
    }
  }, [isOpen]);

  // Fonction pour obtenir tous les personnages déjà utilisés
  const getUsedCharacterIds = () => {
    const usedIds = new Set<string>();
    team.forEach((member) => {
      if (member.id_character) {
        usedIds.add(member.id_character);
      }
      member.links.forEach((link) => {
        if (link.id_character) {
          usedIds.add(link.id_character);
        }
      });
    });
    return usedIds;
  };

  // Fonction pour obtenir les personnages disponibles (non utilisés)
  const getAvailableCharacters = (excludeCurrentId?: string) => {
    const usedIds = getUsedCharacterIds();
    return characters.filter((char) => {
      // Ne pas exclure le personnage actuellement sélectionné
      if (excludeCurrentId && char._id === excludeCurrentId) {
        return true;
      }
      return !usedIds.has(char._id);
    });
  };

  const handleCharacterChange = (position: number, characterId: string) => {
    // Vérifier si le personnage est déjà utilisé ailleurs
    const usedIds = getUsedCharacterIds();
    const currentMember = team.find((m) => m.position === position);
    
    // Exclure l'ID actuel du membre pour permettre de reselectionner le même
    if (currentMember?.id_character) {
      usedIds.delete(currentMember.id_character);
    }
    
    if (characterId && usedIds.has(characterId)) {
      toast({
        title: "Personnage déjà utilisé",
        description: "Ce personnage est déjà utilisé dans une autre position ou comme link.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setTeam((prev) =>
      prev.map((member) =>
        member.position === position ? { ...member, id_character: characterId } : member
      )
    );
  };

  const handleAddLink = (position: number) => {
    setTeam((prev) =>
      prev.map((member) =>
        member.position === position && member.links.length < 3
          ? { ...member, links: [...member.links, { id_character: "" }] }
          : member
      )
    );
  };

  const handleRemoveLink = (position: number, linkIndex: number) => {
    setTeam((prev) =>
      prev.map((member) =>
        member.position === position
          ? { ...member, links: member.links.filter((_, i) => i !== linkIndex) }
          : member
      )
    );
  };

  const handleLinkChange = (position: number, linkIndex: number, characterId: string) => {
    // Vérifier si le personnage est déjà utilisé ailleurs
    const usedIds = getUsedCharacterIds();
    const currentMember = team.find((m) => m.position === position);
    
    // Exclure l'ID actuel du link pour permettre de le reselectionner
    if (currentMember?.links[linkIndex]?.id_character) {
      usedIds.delete(currentMember.links[linkIndex].id_character);
    }
    
    if (characterId && usedIds.has(characterId)) {
      toast({
        title: "Personnage déjà utilisé",
        description: "Ce personnage est déjà utilisé dans une autre position ou comme link.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setTeam((prev) =>
      prev.map((member) =>
        member.position === position
          ? {
              ...member,
              links: member.links.map((link, i) =>
                i === linkIndex ? { id_character: characterId } : link
              ),
            }
          : member
      )
    );
  };

  const handleSkillsChange = (position: number, skillIds: string[]) => {
    setTeam((prev) =>
      prev.map((member) =>
        member.position === position ? { ...member, skills: skillIds } : member
      )
    );
  };

  // Gestion des accessoires
  const handleAddAccessory = (position: number) => {
    setTeam((prev) =>
      prev.map((member) =>
        member.position === position && (member.accessories?.length || 0) < 3
          ? {
              ...member,
              accessories: [
                ...(member.accessories || []),
                { id_accessory: "", id_subeffect: undefined },
              ],
            }
          : member
      )
    );
  };

  const handleRemoveAccessory = (position: number, accessoryIndex: number) => {
    setTeam((prev) =>
      prev.map((member) =>
        member.position === position
          ? {
              ...member,
              accessories: member.accessories?.filter((_, i) => i !== accessoryIndex),
            }
          : member
      )
    );
  };

  const handleAccessoryChange = (
    position: number,
    accessoryIndex: number,
    accessory: { id_accessory: string; id_subeffect?: string }
  ) => {
    setTeam((prev) =>
      prev.map((member) => {
        if (member.position !== position) return member;

        const accessories = [...(member.accessories || [])];
        accessories[accessoryIndex] = accessory;

        return { ...member, accessories };
      })
    );
  };

  const getUsedAccessoryIds = (position: number) => {
    const member = team.find((m) => m.position === position);
    if (!member?.accessories) return [];
    return member.accessories
      .map((acc) => acc.id_accessory)
      .filter((id) => id !== "");
  };

  const handleSubmit = async () => {
    // Vérifier que l'utilisateur est connecté
    const token = localStorage.getItem('userToken');
    if (!token) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour créer un build",
        status: "error",
        duration: 5000,
      });
      return;
    }

    // Validation
    const hasAtLeastOneCharacter = team.some((member) => member.id_character !== "");
    if (!hasAtLeastOneCharacter) {
      toast({
        title: "Erreur",
        description: "Vous devez sélectionner au moins un personnage",
        status: "error",
        duration: 5000,
      });
      return;
    }

    // Filtrer les membres sans personnage et valider les links
    const filteredTeam = team
      .filter((member) => member.id_character !== "")
      .map((member) => ({
        ...member,
        links: member.links.filter((link) => link.id_character !== ""),
        skills: member.skills && member.skills.length > 0 ? member.skills : undefined,
        accessories: member.accessories
          ?.filter((acc) => acc.id_accessory !== "")
          .map((acc) => ({
            id_accessory: acc.id_accessory,
            ...(acc.id_subeffect && { id_subeffect: acc.id_subeffect }),
          })),
      }));

    setIsSubmitting(true);

    try {
      await createBuild({
        rotation_id: rotationId,
        description: description.trim(),
        team: filteredTeam,
      });

      toast({
        title: "Build créé !",
        description: "Votre build a été soumis et sera validé par un administrateur.",
        status: "success",
        duration: 5000,
      });

      onSuccess();
      onClose();
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer le build",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Créer un Build</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                Votre build sera soumis pour validation par un administrateur avant d'être visible
                publiquement.
              </Text>
            </Alert>

            <FormControl>
              <FormLabel>Description (optionnel)</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre stratégie, les atouts de cette team..."
                rows={3}
              />
            </FormControl>

            <Box>
              <Text fontWeight="bold" mb={3}>
                Composition de la Team
              </Text>

              <VStack spacing={4} align="stretch">
                {team.map((member) => (
                  <Box
                    key={member.position}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={borderColor}
                    bg={bgColor}
                  >
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Badge colorScheme="purple">Position {member.position}</Badge>
                      </HStack>

                      <FormControl isRequired={member.position === 1}>
                        <FormLabel fontSize="sm">Personnage principal</FormLabel>
                        <CharacterSearchSelect
                          characters={getAvailableCharacters(member.id_character)}
                          value={member.id_character}
                          onChange={(characterId) => handleCharacterChange(member.position, characterId)}
                          placeholder="Rechercher un personnage..."
                          isDisabled={isLoadingCharacters}
                          isLoading={isLoadingCharacters}
                        />
                      </FormControl>

                      {/* Links */}
                      {member.links.length > 0 && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            Links ({member.links.length}/3)
                          </Text>
                          <VStack spacing={2} align="stretch">
                            {member.links.map((link, linkIndex) => (
                              <HStack key={linkIndex}>
                                <Box flex={1}>
                                  <CharacterSearchSelect
                                    characters={getAvailableCharacters(link.id_character)}
                                    value={link.id_character}
                                    onChange={(characterId) =>
                                      handleLinkChange(member.position, linkIndex, characterId)
                                    }
                                    placeholder="Rechercher un link..."
                                    size="sm"
                                    isDisabled={isLoadingCharacters}
                                    isLoading={isLoadingCharacters}
                                  />
                                </Box>
                                <IconButton
                                  aria-label="Supprimer le link"
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleRemoveLink(member.position, linkIndex)}
                                />
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      {member.links.length < 3 && member.id_character && (
                        <Button
                          size="sm"
                          leftIcon={<AddIcon />}
                          variant="outline"
                          onClick={() => handleAddLink(member.position)}
                        >
                          Ajouter un link
                        </Button>
                      )}

                      {/* Skills */}
                      {member.id_character && (
                        <FormControl>
                          <FormLabel fontSize="sm">
                            Compétences bonus (optionnel, max 2)
                          </FormLabel>
                          <SkillSearchSelect
                            value={member.skills || []}
                            onChange={(skillIds) => handleSkillsChange(member.position, skillIds)}
                            placeholder="Rechercher une compétence..."
                            size="sm"
                            maxSkills={2}
                          />
                        </FormControl>
                      )}

                      {/* Accessories */}
                      {member.id_character && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            Accessoires ({(member.accessories?.length || 0)}/3)
                          </Text>
                          {member.accessories && member.accessories.length > 0 && (
                            <VStack spacing={2} align="stretch" mb={2}>
                              {member.accessories.map((accessory, accIndex) => (
                                <HStack key={accIndex} align="flex-start">
                                  <Box flex={1}>
                                    <AccessorySearchSelect
                                      value={accessory}
                                      onChange={(acc) =>
                                        handleAccessoryChange(member.position, accIndex, acc)
                                      }
                                      placeholder="Rechercher un accessoire..."
                                      excludeIds={getUsedAccessoryIds(member.position).filter(
                                        (_, idx) => idx !== accIndex
                                      )}
                                    />
                                  </Box>
                                  <IconButton
                                    aria-label="Supprimer l'accessoire"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => handleRemoveAccessory(member.position, accIndex)}
                                    mt={6}
                                  />
                                </HStack>
                              ))}
                            </VStack>
                          )}
                          {(member.accessories?.length || 0) < 3 && (
                            <Button
                              size="sm"
                              leftIcon={<AddIcon />}
                              variant="outline"
                              onClick={() => handleAddAccessory(member.position)}
                            >
                              Ajouter un accessoire
                            </Button>
                          )}
                        </Box>
                      )}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            colorScheme="orange"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Création..."
          >
            Créer le Build
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BuildCreationModal;
