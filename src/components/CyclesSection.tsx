import { useState } from "react";
import {
  Container,
  VStack,
  Text,
  useToast,
  useDisclosure,
  Button,
  HStack
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import type { IRotationTemplate, ICycleRotation, ICycleFormData, ICycle, IEvent } from "../interfaces";
import type { DropResult } from '@hello-pangea/dnd';
import { ExistingCyclesList } from "./cycles/ExistingCyclesList";
import { CycleCreationModal } from "./cycles/CycleCreationModal";
import { useCycles, useRotations } from "@/hooks/useAPI";
import { useAPIMutations } from "@/hooks/useAPIMutations";

const CyclesSection = () => {
  const { deleteCycle, createCycle } = useAPIMutations();
  // Utiliser useSWR pour les cycles et rotations (cache automatique + déduplication)
  const { cycles, mutate: mutateCycles, isLoading: isLoadingCycles } = useCycles({ authenticated: true });
  const { rotations: rotationTemplates = [] } = useRotations();
  
  const [selectedRotations, setSelectedRotations] = useState<ICycleRotation[]>([]);
  const [cycleName, setCycleName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Supprimer un cycle
  const handleDeleteCycle = async (cycleId: string): Promise<void> => {
    await deleteCycle(cycleId);
    // Recharger la liste des cycles après suppression
    await mutateCycles();
  };

  // Ajouter une rotation sélectionnée
  const addRotation = (template: IRotationTemplate) => {
    // Calculer automatiquement la période selon la position
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

  // Supprimer une rotation
  const removeRotation = (index: number) => {
    const newRotations = selectedRotations.filter((_, i) => i !== index);
    // Mettre à jour les positions et périodes après suppression
    const rotationsWithUpdatedPositions = newRotations.map((rotation, i) => ({
      ...rotation,
      position: i + 1,
      period: (i + 1) % 2 === 1 ? "Mardi-Jeudi" as const : "Vendredi-Dimanche" as const
    }));
    setSelectedRotations(rotationsWithUpdatedPositions);
  };

  // Gestion du drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newRotations = Array.from(selectedRotations);
    const [reorderedItem] = newRotations.splice(result.source.index, 1);
    newRotations.splice(result.destination.index, 0, reorderedItem);

    // Mettre à jour toutes les positions après le drag & drop
    const rotationsWithUpdatedPositions = newRotations.map((rotation, index) => ({
      ...rotation,
      position: index + 1
    }));

    // Si on a 20 rotations et que la première rotation a une date de début, recalculer toutes les dates
    if (rotationsWithUpdatedPositions.length === 20 && rotationsWithUpdatedPositions[0]?.start_date) {
      calculateAllDates(rotationsWithUpdatedPositions, rotationsWithUpdatedPositions[0].start_date);
    } else {
      // Sinon, recalculer seulement les périodes basées sur les positions
      rotationsWithUpdatedPositions.forEach((rotation, index) => {
        rotation.period = (index + 1) % 2 === 1 ? "Mardi-Jeudi" as const : "Vendredi-Dimanche" as const;
      });
    }

    setSelectedRotations(rotationsWithUpdatedPositions);
  };

  // Mettre à jour une rotation
  const updateRotation = (index: number, field: keyof ICycleRotation, value: string) => {
    const newRotations = [...selectedRotations];
    newRotations[index] = { ...newRotations[index], [field]: value };

    // Si on modifie la start_date de la première rotation et qu'on a 20 rotations
    if (field === 'start_date' && index === 0 && selectedRotations.length === 20 && value) {
      calculateAllDates(newRotations, value);
    } else if (field === 'start_date' || field === 'end_date') {
      // Pour les autres rotations, recalculer seulement la période de cette rotation
      const rotation = newRotations[index];
      if (rotation.start_date && rotation.end_date) {
        const period = calculatePeriod(rotation.start_date, rotation.end_date);
        newRotations[index].period = period;
      }
    }

    setSelectedRotations(newRotations);
  };

  // Fonction pour calculer automatiquement toutes les dates à partir de la première
  const calculateAllDates = (rotations: ICycleRotation[], firstStartDate: string) => {
    try {
      const [day, month, year] = firstStartDate.split('/');
      let currentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      // S'assurer que la première date commence bien un mardi
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 2) { // 2 = Mardi
        console.warn('La première rotation devrait commencer un mardi pour respecter la logique');
      }

      for (let i = 0; i < rotations.length; i++) {
        const isEvenPosition = (i + 1) % 2 === 0; // Position paire (2, 4, 6...)
        
        if (isEvenPosition) {
          // Positions paires : Vendredi-Dimanche
          // Trouver le prochain vendredi
          while (currentDate.getDay() !== 5) { // 5 = Vendredi
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          const startDate = formatDate(currentDate);
          
          // Dimanche = +2 jours
          const endDate = new Date(currentDate);
          endDate.setDate(currentDate.getDate() + 2);
          const formattedEndDate = formatDate(endDate);
          
          rotations[i].start_date = startDate;
          rotations[i].end_date = formattedEndDate;
          rotations[i].period = "Vendredi-Dimanche";
          
          // Préparer pour la prochaine rotation (Mardi suivant)
          currentDate = new Date(endDate);
          currentDate.setDate(endDate.getDate() + 2); // Mardi suivant
        } else {
          // Positions impaires : Mardi-Jeudi
          // Trouver le prochain mardi (ou garder si on est déjà mardi)
          while (currentDate.getDay() !== 2) { // 2 = Mardi
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          const startDate = formatDate(currentDate);
          
          // Jeudi = +2 jours
          const endDate = new Date(currentDate);
          endDate.setDate(currentDate.getDate() + 2);
          const formattedEndDate = formatDate(endDate);
          
          rotations[i].start_date = startDate;
          rotations[i].end_date = formattedEndDate;
          rotations[i].period = "Mardi-Jeudi";
          
          // Préparer pour la prochaine rotation (Vendredi suivant)
          currentDate = new Date(endDate);
          currentDate.setDate(endDate.getDate() + 1); // Vendredi suivant
        }
      }
    } catch (error) {
      console.error('Erreur lors du calcul des dates:', error);
    }
  };

  // Fonction utilitaire pour formater une date en DD/MM/YYYY
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fonction pour calculer la période basée sur les dates
  const calculatePeriod = (startDate: string, endDate: string): "Mardi-Jeudi" | "Vendredi-Dimanche" => {
    try {
      const [startDay, startMonth, startYear] = startDate.split('/');
      const [endDay, endMonth, endYear] = endDate.split('/');

      const start = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
      const end = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));

      const startDayOfWeek = start.getDay();
      const endDayOfWeek = end.getDay();

      // Mardi = 2, Jeudi = 4, Vendredi = 5, Dimanche = 0
      if (startDayOfWeek === 2 && endDayOfWeek === 4) {
        return "Mardi-Jeudi" as const;
      } else if (startDayOfWeek === 5 && endDayOfWeek === 0) {
        return "Vendredi-Dimanche" as const;
      }

      // Par défaut, retourner Mardi-Jeudi
      return "Mardi-Jeudi" as const;
    } catch {
      return "Mardi-Jeudi" as const;
    }
  };

  // Fonction utilitaire pour s'assurer que toutes les positions et périodes sont correctes
  const ensureCorrectPositions = (rotations: ICycleRotation[]): ICycleRotation[] => {
    return rotations.map((rotation, index) => ({
      ...rotation,
      position: index + 1,
      period: (index + 1) % 2 === 1 ? "Mardi-Jeudi" as const : "Vendredi-Dimanche" as const
    }));
  };

  // Soumettre le cycle
  const submitCycle = async () => {
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

    setIsSubmitting(true);
    try {
      // S'assurer que toutes les positions sont correctes avant la soumission
      const rotationsWithCorrectPositions = ensureCorrectPositions(selectedRotations);
      
      const cycleData: ICycleFormData = {
        name: cycleName.trim(),
        rotations: rotationsWithCorrectPositions
      };

      await createCycle(cycleData);

      toast({
        title: "Cycle créé",
        description: "Le cycle a été créé avec succès",
        status: "success",
        duration: 3000,
      });

      // Réinitialiser le formulaire
      setCycleName("");
      setSelectedRotations([]);

      // Recharger la liste des cycles
      mutateCycles();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création du cycle",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour télécharger le fichier events.json d'un cycle spécifique
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

    // Créer la structure des events pour ce cycle spécifique
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

    // Créer le blob et télécharger
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

  // Fonction pour télécharger le fichier events.json (tous les cycles)
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

    // Créer la structure des events avec toutes les rotations de tous les cycles
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

    // Créer le blob et télécharger
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
      // Réinitialiser le formulaire après fermeture
      setCycleName("");
      setSelectedRotations([]);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            Gestion des Cycles
          </Text>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onOpen}
          >
            Créer un cycle
          </Button>
        </HStack>

        {/* Section d'affichage des cycles existants */}
        <ExistingCyclesList
          cycles={cycles}
          isLoading={isLoadingCycles}
          onRefresh={mutateCycles}
          onDownloadEvents={downloadEventsJson}
          onDownloadCycleEvents={downloadCycleEventsJson}
          onDeleteCycle={handleDeleteCycle}
        />

        {/* Modal de création de cycle */}
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
        />
      </VStack>
    </Container>
  );
}

export default CyclesSection;