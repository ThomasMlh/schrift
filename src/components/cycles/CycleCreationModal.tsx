import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Input,
  HStack,
  useToast
} from "@chakra-ui/react";
import type { ICycleRotation, IRotationTemplate } from "../../interfaces";
import { RotationTemplatesSection } from "./RotationTemplatesSection";
import { SelectedRotationsList } from "./SelectedRotationsList";
import type { DropResult } from "@hello-pangea/dnd";

interface CycleCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycleName: string;
  onCycleNameChange: (name: string) => void;
  selectedRotations: ICycleRotation[];
  onSubmit: () => void;
  isSubmitting: boolean;
  rotationTemplates: IRotationTemplate[];
  onAddRotation: (template: IRotationTemplate) => void;
  onDragEnd: (result: DropResult) => void;
  onUpdateRotation: (index: number, field: keyof ICycleRotation, value: string) => void;
  onRemoveRotation: (index: number) => void;
}

export const CycleCreationModal = ({
  isOpen,
  onClose,
  cycleName,
  onCycleNameChange,
  selectedRotations,
  onSubmit,
  isSubmitting,
  rotationTemplates,
  onAddRotation,
  onDragEnd,
  onUpdateRotation,
  onRemoveRotation
}: CycleCreationModalProps) => {
  const toast = useToast();
  const canSubmit = cycleName.trim() && selectedRotations.length === 20;

  const handleSubmit = () => {
    if (!cycleName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez saisir un nom pour le cycle",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (selectedRotations.length !== 20) {
      toast({
        title: "Rotations incomplètes",
        description: "Un cycle doit contenir exactement 20 rotations",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Vérifier que toutes les rotations ont des dates
    const incompleteRotations = selectedRotations.filter(r => !r.start_date || !r.end_date);
    if (incompleteRotations.length > 0) {
      toast({
        title: "Dates manquantes",
        description: "Toutes les rotations doivent avoir des dates de début et de fin",
        status: "error",
        duration: 3000,
      });
      return;
    }

    onSubmit();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>Créer un nouveau cycle</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <VStack spacing={2} align="stretch">
              <Text fontSize="sm" fontWeight="medium">Nom du cycle</Text>
              <Input
                placeholder="Entrez le nom du cycle..."
                value={cycleName}
                onChange={(e) => onCycleNameChange(e.target.value)}
                isDisabled={isSubmitting}
              />
            </VStack>
            <RotationTemplatesSection
              templates={rotationTemplates}
              onAddRotation={onAddRotation}
              selectedRotationsCount={selectedRotations.length}
            />
            <SelectedRotationsList
              rotations={selectedRotations}
              onDragEnd={onDragEnd}
              onUpdateRotation={onUpdateRotation}
              onRemoveRotation={onRemoveRotation}
            />
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Text fontSize="sm" color="gray.500">
              {selectedRotations.length === 20 
                ? "✅ Toutes les rotations sont configurées" 
                : `⚠️ ${20 - selectedRotations.length} rotation(s) manquante(s)`
              }
            </Text>
            <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
              Annuler
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Création..."
              isDisabled={!canSubmit}
            >
              Créer le cycle
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}