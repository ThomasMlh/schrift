import { useState } from "react";
import {
  Container, VStack, useToast, useDisclosure, Button,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import type { IRotationTemplate, ICycleRotation, ICycleFormData, ICycle, IEvent } from "../interfaces";
import type { DropResult } from '@hello-pangea/dnd';
import { ExistingCyclesList } from "./cycles/ExistingCyclesList";
import { CycleCreationModal } from "./cycles/CycleCreationModal";
import { useCycles, useRotations } from "@/hooks/useAPI";
import { useAPIMutations } from "@/hooks/useAPIMutations";
import {
  calculateRotationPeriod,
  calculateAllRotationDates,
  ensureCorrectRotationPositions,
} from "@/utils/cycleHelpers";
import { SectionHeader } from "@/components/ui/SectionHeader";

const CyclesSection = () => {
  const { deleteCycle, createCycle, updateCycle } = useAPIMutations();
  const { cycles, mutate: mutateCycles, isLoading: isLoadingCycles } = useCycles({ authenticated: true });
  const { rotations: rotationTemplates = [] } = useRotations();

  const [selectedRotations, setSelectedRotations] = useState<ICycleRotation[]>([]);
  const [cycleName, setCycleName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCycleId, setEditingCycleId] = useState<string | null>(null);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDeleteCycle = async (cycleId: string): Promise<void> => {
    await deleteCycle(cycleId);
    await mutateCycles();
  };

  const handleOpenEdit = (cycle: ICycle) => {
    setEditingCycleId(cycle._id || null);
    setCycleName(cycle.name);
    setSelectedRotations(
      (cycle.rotations || []).map((r, i) => ({
        ...r,
        position: i + 1,
      }))
    );
    setModalMode('edit');
    onOpen();
  };

  const handleOpenCreate = () => {
    setEditingCycleId(null);
    setCycleName("");
    setSelectedRotations([]);
    setModalMode('create');
    onOpen();
  };

  const addRotation = (template: IRotationTemplate) => {
    // The period is derived from the position
    const position = selectedRotations.length + 1;
    const period = position % 2 === 1 ? "Mardi-Jeudi" : "Vendredi-Dimanche";

    const newRotation: ICycleRotation = {
      start_date: "",
      end_date: "",
      period: period,
      killer: template.killer,
      attack: template.attack,
      alteration: template.alteration,
      position: position,
      rotation_id: template._id,
    };
    setSelectedRotations([...selectedRotations, newRotation]);
  };

  const removeRotation = (index: number) => {
    const newRotations = selectedRotations.filter((_, i) => i !== index);
    // Re-number positions and periods after removal
    const rotationsWithUpdatedPositions = newRotations.map((rotation, i) => ({
      ...rotation,
      position: i + 1,
      period: (i + 1) % 2 === 1 ? "Mardi-Jeudi" as const : "Vendredi-Dimanche" as const
    }));
    setSelectedRotations(rotationsWithUpdatedPositions);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newRotations = Array.from(selectedRotations);
    const [reorderedItem] = newRotations.splice(result.source.index, 1);
    newRotations.splice(result.destination.index, 0, reorderedItem);

    const rotationsWithUpdatedPositions = newRotations.map((rotation, index) => ({
      ...rotation,
      position: index + 1
    }));

    // With a full cycle (20 rotations) and a known first start date, recompute every date
    if (rotationsWithUpdatedPositions.length === 20 && rotationsWithUpdatedPositions[0]?.start_date) {
      calculateAllRotationDates(rotationsWithUpdatedPositions, rotationsWithUpdatedPositions[0].start_date);
    } else {
      // Otherwise only recompute the periods from the positions
      rotationsWithUpdatedPositions.forEach((rotation, index) => {
        rotation.period = (index + 1) % 2 === 1 ? "Mardi-Jeudi" as const : "Vendredi-Dimanche" as const;
      });
    }

    setSelectedRotations(rotationsWithUpdatedPositions);
  };

  const updateRotation = (index: number, field: keyof ICycleRotation, value: string) => {
    const newRotations = [...selectedRotations];
    newRotations[index] = { ...newRotations[index], [field]: value };

    // Changing the first start date of a full cycle shifts every date
    if (field === 'start_date' && index === 0 && selectedRotations.length === 20 && value) {
      calculateAllRotationDates(newRotations, value);
    } else if (field === 'start_date' || field === 'end_date') {
      // Other rotations: only recompute this rotation's period
      const rotation = newRotations[index];
      if (rotation.start_date && rotation.end_date) {
        const period = calculateRotationPeriod(rotation.start_date, rotation.end_date);
        newRotations[index].period = period;
      }
    }

    setSelectedRotations(newRotations);
  };


  const submitCycle = async () => {
    if (!cycleName.trim()) {
      toast({ title: "Nom requis", description: "Veuillez saisir un nom pour le cycle", status: "error", duration: 3000 });
      return;
    }
    if (selectedRotations.length !== 20) {
      toast({ title: "Rotations incomplètes", description: "Un cycle doit contenir exactement 20 rotations", status: "error", duration: 3000 });
      return;
    }
    const incompleteRotations = selectedRotations.filter(r => !r.start_date || !r.end_date);
    if (incompleteRotations.length > 0) {
      toast({ title: "Dates manquantes", description: "Toutes les rotations doivent avoir des dates de début et de fin", status: "error", duration: 3000 });
      return;
    }

    setIsSubmitting(true);
    try {
      const rotationsWithCorrectPositions = ensureCorrectRotationPositions(selectedRotations);
      const cycleData: ICycleFormData = { name: cycleName.trim(), rotations: rotationsWithCorrectPositions };

      if (modalMode === 'edit' && editingCycleId) {
        await updateCycle(editingCycleId, cycleData);
        toast({ title: "Cycle modifié", description: "Le cycle a été mis à jour avec succès", status: "success", duration: 3000 });
      } else {
        await createCycle(cycleData);
        toast({ title: "Cycle créé", description: "Le cycle a été créé avec succès", status: "success", duration: 3000 });
      }

      setCycleName("");
      setSelectedRotations([]);
      mutateCycles();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : `Erreur lors de la ${modalMode === 'edit' ? 'modification' : 'création'} du cycle`,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Downloads the events.json of a single cycle
  const downloadCycleEventsJson = (cycle: ICycle) => {
    if (!cycle.rotations || !Array.isArray(cycle.rotations) || cycle.rotations.length === 0) {
      toast({
        title: "Aucune rotation",
        description: "Ce cycle ne contient aucune rotation à exporter",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const events: IEvent[] = [];

    cycle.rotations.forEach((rotation, index) => {
      events.push({
        cycleName: cycle.name,
        rotationNumber: index + 1,
        killer: rotation.killer,
        attack: rotation.attack,
        alteration: rotation.alteration,
        start_date: rotation.start_date,
        end_date: rotation.end_date,
        period: rotation.period
      });
    });

    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `events_${cycle.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `Fichier events_${cycle.name}.json téléchargé avec ${events.length} rotations`,
      status: "success",
      duration: 3000,
    });
  };

  // Downloads the events.json of every cycle
  const downloadEventsJson = () => {
    if (!Array.isArray(cycles) || cycles.length === 0) {
      toast({
        title: "Aucun cycle",
        description: "Aucun cycle disponible pour l'export",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const events: IEvent[] = [];

    cycles.forEach((cycle) => {
      if (cycle.rotations && Array.isArray(cycle.rotations)) {
        cycle.rotations.forEach((rotation, index) => {
          events.push({
            cycleName: cycle.name,
            rotationNumber: index + 1,
            killer: rotation.killer,
            attack: rotation.attack,
            alteration: rotation.alteration,
            start_date: rotation.start_date,
            end_date: rotation.end_date,
            period: rotation.period
          });
        });
      }
    });

    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'events.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `Fichier events.json téléchargé avec ${events.length} rotations`,
      status: "success",
      duration: 3000,
    });
  };

  const availableTemplates = rotationTemplates.filter(
    template => !selectedRotations.some(rotation => rotation.rotation_id === template._id)
  );

  const handleModalSubmit = async () => {
    await submitCycle();
    if (!isSubmitting) {
      onClose();
      setCycleName("");
      setSelectedRotations([]);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <SectionHeader
          title="Gestion des cycles"
          description="Créez et gérez les cycles de rotation"
          actions={<Button
            leftIcon={<AddIcon />}
            bgGradient="linear(to-r, blue.400, purple.500)"
            color="white"
            _hover={{ bgGradient: "linear(to-r, blue.500, purple.600)", transform: "translateY(-1px)", shadow: "lg" }}
            _active={{ transform: "translateY(0)" }}
            transition="all 0.2s"
            borderRadius="xl"
            px={6}
            onClick={handleOpenCreate}
          >
            Créer un cycle
          </Button>}
        />

        <ExistingCyclesList
          cycles={cycles}
          isLoading={isLoadingCycles}
          onRefresh={mutateCycles}
          onDownloadEvents={downloadEventsJson}
          onDownloadCycleEvents={downloadCycleEventsJson}
          onDeleteCycle={handleDeleteCycle}
          onEditCycle={handleOpenEdit}
        />

        <CycleCreationModal
          isOpen={isOpen}
          onClose={onClose}
          cycleName={cycleName}
          onCycleNameChange={setCycleName}
          selectedRotations={selectedRotations}
          onSubmit={handleModalSubmit}
          isSubmitting={isSubmitting}
          rotationTemplates={availableTemplates}
          onAddRotation={addRotation}
          onDragEnd={handleDragEnd}
          onUpdateRotation={updateRotation}
          onRemoveRotation={removeRotation}
          mode={modalMode}
        />
      </VStack>
    </Container>
  );
}

export default CyclesSection;