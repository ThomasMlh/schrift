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
  useToast,
  Text,
  Box,
  Alert,
  AlertIcon
} from "@chakra-ui/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAPIMutations } from "../../hooks/useAPIMutations";
import { DescriptionTextarea } from "./DescriptionTextarea";
import { TeamMemberCard } from "./TeamMemberCard";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "react-i18next";
import type { IBuild, IBuildTeamMember, IBuildLink, ISkill } from "@/interfaces";

interface BuildCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rotationId: string;
  onSuccess: () => void;
  buildToEdit?: IBuild;
}

interface TeamMember {
  id_character: string;
  position: number;
  links: Array<{ id_character: string }>;
  skills?: string[];
  accessories?: Array<{ id_accessory: string; id_subeffect?: string }>;
}

const BuildCreationModal = ({ isOpen, onClose, rotationId, onSuccess, buildToEdit }: BuildCreationModalProps) => {
  const { createBuild, updateBuild } = useAPIMutations();
  const { token } = useAuth();
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([
    { id_character: "", position: 1, links: [], skills: [], accessories: [] },
    { id_character: "", position: 2, links: [], skills: [], accessories: [] },
    { id_character: "", position: 3, links: [], skills: [], accessories: [] },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const isEditMode = !!buildToEdit;
  const buildId = buildToEdit?._id;

  useEffect(() => {
    // Réinitialiser ou pré-remplir le formulaire quand la modal s'ouvre
    if (isOpen) {
      if (buildToEdit) {
        // Mode édition : pré-remplir avec les données existantes
        setDescription(buildToEdit.description || "");
        
        // Préparer les 3 positions
        const editTeam: TeamMember[] = [
          { id_character: "", position: 1, links: [], skills: [], accessories: [] },
          { id_character: "", position: 2, links: [], skills: [], accessories: [] },
          { id_character: "", position: 3, links: [], skills: [], accessories: [] },
        ];
        
        // Remplir avec les données du build
        if (buildToEdit.team && Array.isArray(buildToEdit.team)) {
          buildToEdit.team.forEach((member: IBuildTeamMember) => {
            const position = member.position - 1; // Index 0-based
            if (position >= 0 && position < 3) {
              editTeam[position] = {
                id_character: member.character?._id || member.id_character || "",
                position: member.position,
                links: member.links?.map((link: IBuildLink) => ({
                  id_character: link.character?._id || link.id_character || ""
                })) || [],
                skills: member.skills?.map((skill: string | ISkill) => typeof skill === 'string' ? skill : skill._id) || [],
                accessories: member.accessories?.map((acc) => ({
                  id_accessory: acc.accessory?._id || acc.id_accessory || "",
                  id_subeffect: acc.subeffect?._id || acc.id_subeffect
                })) || []
              };
            }
          });
        }
        
        setTeam(editTeam);
      } else {
        // Mode création : réinitialiser
        setDescription("");
        setTeam([
          { id_character: "", position: 1, links: [], skills: [], accessories: [] },
          { id_character: "", position: 2, links: [], skills: [], accessories: [] },
          { id_character: "", position: 3, links: [], skills: [], accessories: [] },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, buildId]); // Ne dépendre que de l'ID au lieu de tout l'objet buildToEdit

  // Mémoriser les personnages déjà utilisés pour éviter les recalculs
  const usedCharacterIds = useMemo(() => {
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
  }, [team]);

  const handleCharacterChange = useCallback((position: number, characterId: string) => {
    setTeam((prev) => {
      // Vérifier si le personnage est déjà utilisé ailleurs
      const usedIds = new Set<string>();
      prev.forEach((member) => {
        if (member.id_character) {
          usedIds.add(member.id_character);
        }
        member.links.forEach((link) => {
          if (link.id_character) {
            usedIds.add(link.id_character);
          }
        });
      });
      
      const currentMember = prev.find((m) => m.position === position);
      
      // Exclure l'ID actuel du membre pour permettre de reselectionner le même
      if (currentMember?.id_character) {
        usedIds.delete(currentMember.id_character);
      }
      
      if (characterId && usedIds.has(characterId)) {
        toast({
          title: t("components.buildCreationModal.toastCharUsedTitle"),
          description: t("components.buildCreationModal.toastCharUsedDesc"),
          status: "warning",
          duration: 3000,
        });
        return prev; // Ne pas modifier l'état
      }

      return prev.map((member) =>
        member.position === position ? { ...member, id_character: characterId } : member
      );
    });
  }, [toast, t]);

  const handleAddLink = useCallback((position: number) => {
    setTeam((prev) =>
      prev.map((member) =>
        member.position === position && member.links.length < 3
          ? { ...member, links: [...member.links, { id_character: "" }] }
          : member
      )
    );
  }, []);

  const handleRemoveLink = useCallback((position: number, linkIndex: number) => {
    setTeam((prev) =>
      prev.map((member) =>
        member.position === position
          ? { ...member, links: member.links.filter((_, i) => i !== linkIndex) }
          : member
      )
    );
  }, []);

  const handleLinkChange = useCallback((position: number, linkIndex: number, characterId: string) => {
    setTeam((prev) => {
      // Vérifier si le personnage est déjà utilisé ailleurs
      const usedIds = new Set<string>();
      prev.forEach((member) => {
        if (member.id_character) {
          usedIds.add(member.id_character);
        }
        member.links.forEach((link) => {
          if (link.id_character) {
            usedIds.add(link.id_character);
          }
        });
      });
      
      const currentMember = prev.find((m) => m.position === position);
      
      // Exclure l'ID actuel du link pour permettre de le reselectionner
      if (currentMember?.links[linkIndex]?.id_character) {
        usedIds.delete(currentMember.links[linkIndex].id_character);
      }
      
      if (characterId && usedIds.has(characterId)) {
        toast({
          title: t("components.buildCreationModal.toastCharUsedTitle"),
          description: t("components.buildCreationModal.toastCharUsedDesc"),
          status: "warning",
          duration: 3000,
        });
        return prev; // Ne pas modifier l'état
      }

      return prev.map((member) =>
        member.position === position
          ? {
              ...member,
              links: member.links.map((link, i) =>
                i === linkIndex ? { id_character: characterId } : link
              ),
            }
          : member
      );
    });
  }, [toast, t]);

  const handleSkillsChange = useCallback((position: number, skillIds: string[]) => {
    setTeam((prev) =>
      prev.map((member) =>
        member.position === position ? { ...member, skills: skillIds } : member
      )
    );
  }, []);

  // Gestion des accessoires
  const handleAddAccessory = useCallback((position: number) => {
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
  }, []);

  const handleRemoveAccessory = useCallback((position: number, accessoryIndex: number) => {
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
  }, []);

  const handleAccessoryChange = useCallback((
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
  }, []);

  const getUsedAccessoryIds = useCallback((position: number) => {
    const member = team.find((m) => m.position === position);
    if (!member?.accessories) return [];
    return member.accessories
      .map((acc) => acc.id_accessory)
      .filter((id) => id !== "");
  }, [team]);

  // Mémoriser les exclusions pour chaque membre pour éviter de casser memo()
  const excludedIdsPerMember = useMemo(() => {
    const allUsedIds = Array.from(usedCharacterIds);
    return team.map((member) => 
      allUsedIds.filter(id => id !== member.id_character)
    );
  }, [usedCharacterIds, team]);

  const handleSubmit = async () => {
    // Vérifier que l'utilisateur est connecté
    if (!token) {
      toast({
        title: t("components.buildCreationModal.toastAuthTitle"),
        description: t(isEditMode ? "components.buildCreationModal.toastAuthDescEdit" : "components.buildCreationModal.toastAuthDescCreate"),
        status: "error",
        duration: 5000,
      });
      return;
    }

    // Validation
    const hasAtLeastOneCharacter = team.some((member) => member.id_character !== "");
    if (!hasAtLeastOneCharacter) {
      toast({
        title: t("components.buildCreationModal.toastValidationTitle"),
        description: t("components.buildCreationModal.toastValidationDesc"),
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
      if (isEditMode) {
        // Mode édition
        await updateBuild(buildToEdit._id, {
          rotation_id: rotationId,
          description: description.trim(),
          team: filteredTeam,
        });

        toast({
          title: t("components.buildCreationModal.toastSuccessEditTitle"),
          description: t("components.buildCreationModal.toastSuccessEditDesc"),
          status: "success",
          duration: 5000,
        });
      } else {
        // Mode création
        await createBuild({
          rotation_id: rotationId,
          description: description.trim(),
          team: filteredTeam,
        });

        toast({
          title: t("components.buildCreationModal.toastSuccessCreateTitle"),
          description: t("components.buildCreationModal.toastSuccessCreateDesc"),
          status: "success",
          duration: 5000,
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      const err = error as Error;
      toast({
        title: t("components.buildCreationModal.toastErrorTitle"),
        description: err.message || t(isEditMode ? "components.buildCreationModal.toastErrorDescEdit" : "components.buildCreationModal.toastErrorDescCreate"),
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader boxShadow={"lg"}>{isEditMode ? t("components.buildCreationModal.titleEdit") : t("components.buildCreationModal.titleCreate")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody py={4}>
          <VStack spacing={6} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                {isEditMode 
                  ? t("components.buildCreationModal.alertEdit")
                  : t("components.buildCreationModal.alertCreate")
                }
              </Text>
            </Alert>

            <DescriptionTextarea 
              value={description} 
              onChange={setDescription} 
            />

            <Box>
              <Text fontWeight="bold" mb={3}>
                {t("components.buildCreationModal.teamComposition")}
              </Text>

              <VStack spacing={4} align="stretch">
                {team.map((member, index) => (
                    <TeamMemberCard
                      key={member.position}
                      member={member}
                      excludedCharacterIds={excludedIdsPerMember[index] || []}
                      onCharacterChange={handleCharacterChange}
                      onAddLink={handleAddLink}
                      onRemoveLink={handleRemoveLink}
                      onLinkChange={handleLinkChange}
                      onSkillsChange={handleSkillsChange}
                      onAddAccessory={handleAddAccessory}
                      onRemoveAccessory={handleRemoveAccessory}
                      onAccessoryChange={handleAccessoryChange}
                      getUsedAccessoryIds={getUsedAccessoryIds}
                    />
                ))}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter boxShadow={"0 -6px 12px -4px rgba(0,0,0,0.15)"}>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>
            {t("components.buildCreationModal.buttonCancel")}
          </Button>
          <Button
            colorScheme="orange"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText={isEditMode ? t("components.buildCreationModal.loadingEdit") : t("components.buildCreationModal.loadingCreate")}
          >
            {isEditMode ? t("components.buildCreationModal.buttonEdit") : t("components.buildCreationModal.buttonCreate")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BuildCreationModal;
