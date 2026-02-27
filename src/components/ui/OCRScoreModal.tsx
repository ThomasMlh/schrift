import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  VStack,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  Box,
  Icon,
  useColorModeValue
} from "@chakra-ui/react";
import { useState } from "react";
import { FiUpload, FiCheckCircle, FiSettings } from "react-icons/fi";
import { useGuildMembers } from "@/hooks/useAPI";
import { useAuth } from "@/providers/AuthProvider";
import { OCRContextSelection } from "@/components/ocr/OCRContextSelection";
import { OCRScreenshotUploader } from "@/components/ocr/OCRScreenshotUploader";
import { OCRResultsValidation } from "@/components/ocr/OCRResultsValidation";
import type { ICycle, IGuild } from "@/interfaces";

interface ScreenshotOCRResult {
  index: number;
  filename: string;
  success: boolean;
  thumbnail?: string;
  players: Array<{
    lineNumber: number;
    detectedName: string;
    score: number | null;
    matching: {
      bestMatch: {
        _id: string;
        bbs_name: string;
        global_name: string;
        avatar?: string;
        confidence: number;
        autoSelected: boolean;
      } | null;
      alternatives: Array<{
        _id: string;
        bbs_name: string;
        confidence: number;
      }>;
    };
    needsReview: boolean;
  }>;
  error?: string;
}

interface OCRScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycles: ICycle[];
  guilds: IGuild[];
  isGuildRestricted?: boolean;
  userGuildId?: string;
}

const OCRScoreModal = ({
  isOpen,
  onClose,
  cycles,
  guilds,
  isGuildRestricted = false,
  userGuildId
}: OCRScoreModalProps) => {
  const toast = useToast();
  const { getAuthHeaders } = useAuth();
  const modalBg = useColorModeValue("white", "gray.800");

  const [currentStep, setCurrentStep] = useState(0);

  // Étape 1 : Sélection du contexte
  const [selectedGuildId, setSelectedGuildId] = useState("");
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [selectedRotationId, setSelectedRotationId] = useState("");
  const [selectedScreenshotterId, setSelectedScreenshotterId] = useState("");

  // Étape 3 : Résultats OCR
  const [ocrResults, setOcrResults] = useState<ScreenshotOCRResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const { members: guildMembers = [] } = useGuildMembers(
    selectedGuildId || undefined,
    true
  );

  const steps = [
    { title: "Configuration", description: "Guilde, cycle, rotation", icon: FiSettings },
    { title: "Screenshots", description: "Upload des images", icon: FiUpload },
    { title: "Validation", description: "Vérifier et soumettre", icon: FiCheckCircle }
  ];

  const handleContextSubmit = (guildId: string, cycleId: string, rotationId: string, screenshotterId: string) => {
    setSelectedGuildId(guildId);
    setSelectedCycleId(cycleId);
    setSelectedRotationId(rotationId);
    setSelectedScreenshotterId(screenshotterId);
    setCurrentStep(1);
  };

  const handleScreenshotsUpload = async (uploadedScreenshots: Array<{ data: string; filename: string }>) => {
    setIsProcessing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/ocr/batch-guild-ranking`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            guild_id: selectedGuildId,
            cycle_id: selectedCycleId,
            rotation_id: selectedRotationId,
            screenshotter_id: selectedScreenshotterId,
            screenshots: uploadedScreenshots
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.message || "Erreur OCR");
      }

      setOcrResults(data.data.screenshots);
      setCurrentStep(2);

      toast({
        title: "Traitement terminé",
        description: `${data.data.summary.totalPlayersDetected} joueurs détectés`,
        status: "success",
        duration: 3000
      });
    } catch (error) {
      console.error("Erreur OCR:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du traitement OCR",
        status: "error",
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitScores = async (validatedScores: Array<{ user_id: string; raw_score: number; screenshot_index: number }>) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/ocr/submit-batch`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            guild_id: selectedGuildId,
            cycle_id: selectedCycleId,
            rotation_id: selectedRotationId,
            scores: validatedScores
          })
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la soumission");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur soumission");
      }

      const rotationInfo = data.data.rotation_info;
      const isDifferential = rotationInfo?.is_differential;

      toast({
        title: "Scores enregistrés",
        description: `${data.data.inserted} score(s) ajouté(s)${isDifferential ? ' (scores différentiels calculés)' : ''}`,
        status: "success",
        duration: 5000
      });

      handleClose();
    } catch (error) {
      console.error("Erreur soumission:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la soumission",
        status: "error",
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedGuildId("");
    setSelectedCycleId("");
    setSelectedRotationId("");
    setSelectedScreenshotterId("");
    setOcrResults([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={modalBg} maxH="90vh">
        <ModalHeader>📸 Saisie automatique par OCR</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Stepper */}
            <Stepper index={currentStep} colorScheme="blue" size="sm">
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator>
                    <StepStatus
                      complete={<StepIcon />}
                      incomplete={<StepNumber />}
                      active={<Icon as={step.icon} />}
                    />
                  </StepIndicator>
                  <Box flexShrink="0">
                    <StepTitle>{step.title}</StepTitle>
                    <StepDescription>{step.description}</StepDescription>
                  </Box>
                  <StepSeparator />
                </Step>
              ))}
            </Stepper>

            {/* Contenu selon l'étape */}
            {currentStep === 0 && (
              <OCRContextSelection
                cycles={cycles}
                guilds={guilds}
                isGuildRestricted={isGuildRestricted}
                userGuildId={userGuildId}
                onSubmit={handleContextSubmit}
              />
            )}

            {currentStep === 1 && (
              <OCRScreenshotUploader
                onUpload={handleScreenshotsUpload}
                isProcessing={isProcessing}
                onBack={() => setCurrentStep(0)}
              />
            )}

            {currentStep === 2 && (
              <OCRResultsValidation
                results={ocrResults}
                guildMembers={guildMembers}
                onSubmit={handleSubmitScores}
                onBack={() => setCurrentStep(1)}
                onReset={handleReset}
                isSubmitting={isSubmitting}
              />
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default OCRScoreModal;
