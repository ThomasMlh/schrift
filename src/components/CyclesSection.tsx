import { useState, useEffect } from "react";
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
import type { RotationTemplate, CycleRotation, CycleFormData, Cycle } from "../interfaces";
import type { DropResult } from '@hello-pangea/dnd';
import { ExistingCyclesList } from "./cycles/ExistingCyclesList";
import { CycleCreationModal } from "./cycles/CycleCreationModal";

const CyclesSection = () => {
  const [rotationTemplates, setRotationTemplates] = useState<RotationTemplate[]>([]);
  const [selectedRotations, setSelectedRotations] = useState<CycleRotation[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [cycleName, setCycleName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;



  // Charger les templates de rotation et les cycles
  useEffect(() => {
    loadRotationTemplates();
    loadCycles();
  }, []);

  const loadRotationTemplates = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/rotations`);
      if (response.ok) {
        const data = await response.json();
        setRotationTemplates(data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les templates de rotation",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors du chargement des templates",
        status: "error",
        duration: 3000,
      });
    }
  };

  const loadCycles = async () => {
    setIsLoadingCycles(true);
    try {
      const response = await fetch(`${apiUrl}/api/cycles`);
      if (response.ok) {
        const data = await response.json();

        // Vérifier si la réponse est un tableau ou un objet avec une propriété cycles
        if (Array.isArray(data)) {
          setCycles(data);
        } else if (data && Array.isArray(data.data)) {
          setCycles(data.data);
        } else {
          setCycles([]);
          toast({
            title: "Erreur",
            description: "Format de données inattendu lors du chargement des cycles",
            status: "error",
            duration: 3000,
          });
        }
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les cycles",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors du chargement des cycles",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoadingCycles(false);
    }
  };

  // Ajouter une rotation sélectionnée
  const addRotation = (template: RotationTemplate) => {
    const newRotation: CycleRotation = {
      _id: template._id,
      start_date: "",
      end_date: "",
      period: "Mardi-Jeudi",
      killer: template.killer,
      attack: template.attack,
      alteration: template.alteration
    };
    setSelectedRotations([...selectedRotations, newRotation]);
  };

  // Supprimer une rotation
  const removeRotation = (index: number) => {
    const newRotations = selectedRotations.filter((_, i) => i !== index);
    setSelectedRotations(newRotations);
  };

  // Gestion du drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newRotations = Array.from(selectedRotations);
    const [reorderedItem] = newRotations.splice(result.source.index, 1);
    newRotations.splice(result.destination.index, 0, reorderedItem);

    setSelectedRotations(newRotations);
  };

  // Mettre à jour une rotation
  const updateRotation = (index: number, field: keyof CycleRotation, value: string) => {
    const newRotations = [...selectedRotations];
    newRotations[index] = { ...newRotations[index], [field]: value };

    // Si on modifie start_date ou end_date, recalculer la période
    if (field === 'start_date' || field === 'end_date') {
      const rotation = newRotations[index];
      if (rotation.start_date && rotation.end_date) {
        // Calculer automatiquement la période basée sur les dates
        const period = calculatePeriod(rotation.start_date, rotation.end_date);
        newRotations[index].period = period;
      }
    }

    setSelectedRotations(newRotations);
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
        return "Mardi-Jeudi";
      } else if (startDayOfWeek === 5 && endDayOfWeek === 0) {
        return "Vendredi-Dimanche";
      }

      // Par défaut, retourner Mardi-Jeudi
      return "Mardi-Jeudi";
    } catch {
      return "Mardi-Jeudi";
    }
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
      const cycleData: CycleFormData = {
        name: cycleName.trim(),
        rotations: selectedRotations
      };

      const token = localStorage.getItem('userToken');
      const response = await fetch(`${apiUrl}/api/cycles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(cycleData)
      });

      if (response.ok) {
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
        loadCycles();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de la création du cycle",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors de la création du cycle",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour télécharger le fichier events.json d'un cycle spécifique
  const downloadCycleEventsJson = (cycle: Cycle) => {
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
    const events: any[] = [];

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
    const events: any[] = [];

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
    template => !selectedRotations.some(rotation => rotation._id === template._id)
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
          onRefresh={loadCycles}
          onDownloadEvents={downloadEventsJson}
          onDownloadCycleEvents={downloadCycleEventsJson}
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

export { CyclesSection };