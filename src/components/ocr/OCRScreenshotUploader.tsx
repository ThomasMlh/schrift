import {
  Card,
  CardBody,
  VStack,
  Text,
  Box,
  Button,
  useColorModeValue,
  HStack,
  Icon,
  SimpleGrid,
  Image,
  IconButton,
  Badge,
  Alert,
  AlertIcon
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { FiUpload, FiX, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { compressImage } from "../../utils/imageCompression";
import { PageLoader } from "../ui/PageLoader";

interface OCRScreenshotUploaderProps {
  onUpload: (screenshots: Array<{ data: string; filename: string }>) => void;
  isProcessing: boolean;
  onBack: () => void;
}

export const OCRScreenshotUploader = ({
  onUpload,
  isProcessing,
  onBack
}: OCRScreenshotUploaderProps) => {
  const [screenshots, setScreenshots] = useState<Array<{ data: string; filename: string; preview: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const dropzoneBg = useColorModeValue("gray.50", "gray.700");
  const dropzoneBorder = useColorModeValue("gray.300", "gray.600");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    processFiles(Array.from(files));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    processFiles(Array.from(files));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processFiles = async (files: File[]) => {
    const maxFiles = 10;
    const maxSize = 10 * 1024 * 1024; // 10MB (avant compression)

    if (screenshots.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} screenshots autorisés`);
      return;
    }

    const newScreenshots: Array<{ data: string; filename: string; preview: string }> = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} n'est pas une image`);
        continue;
      }

      if (file.size > maxSize) {
        alert(`${file.name} est trop volumineux (max 10MB)`);
        continue;
      }

      const rawDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("Erreur lecture fichier"));
        reader.readAsDataURL(file);
      });

      // Compresser l'image pour rester sous la limite Vercel (4.5MB total)
      const compressedData = await compressImage(rawDataUrl, 1400, 0.7);

      newScreenshots.push({
        data: compressedData,
        filename: file.name,
        preview: compressedData
      });
    }

    setScreenshots((prev) => [...prev, ...newScreenshots]);
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    onUpload(
      screenshots.map((s) => ({ data: s.data, filename: s.filename }))
    );
  };

  return (
    <Card bg={bgColor} borderRadius="xl" boxShadow="lg" borderWidth="1px" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={2}>
              📸 Upload des screenshots
            </Text>
            <Text color="gray.500">
              Glissez-déposez ou cliquez pour sélectionner les screenshots de classement
            </Text>
          </Box>

          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">💡 Conseils pour un meilleur résultat :</Text>
              <Text fontSize="sm">
                • Capture le classement complet (jusqu'à 5 joueurs par screenshot)
              </Text>
              <Text fontSize="sm">
                • Assurez-vous que les noms et scores sont bien visibles
              </Text>
              <Text fontSize="sm">
                • Formats acceptés : JPG, PNG, WebP (max 5MB par image)
              </Text>
            </VStack>
          </Alert>

          {/* Drop zone */}
          <Box
            borderWidth="2px"
            borderStyle="dashed"
            borderColor={dropzoneBorder}
            borderRadius="lg"
            bg={dropzoneBg}
            p={8}
            textAlign="center"
            cursor="pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            _hover={{ borderColor: "blue.500", bg: useColorModeValue("blue.50", "blue.900") }}
            transition="all 0.2s"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
            <Icon as={FiUpload} boxSize={12} color="blue.500" mb={4} />
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Glissez vos screenshots ici
            </Text>
            <Text color="gray.500">
              ou cliquez pour sélectionner (max 10 images)
            </Text>
          </Box>

          {/* Preview grid */}
          {screenshots.length > 0 && (
            <Box>
              <HStack justify="space-between" mb={4}>
                <Text fontWeight="bold">
                  {screenshots.length} screenshot{screenshots.length > 1 ? "s" : ""} sélectionné{screenshots.length > 1 ? "s" : ""}
                </Text>
                <Badge colorScheme="blue" fontSize="md">
                  ~{screenshots.length * 5} joueurs max
                </Badge>
              </HStack>

              <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                {screenshots.map((screenshot, index) => (
                  <Box
                    key={index}
                    position="relative"
                    borderRadius="md"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <Image
                      src={screenshot.preview}
                      alt={screenshot.filename}
                      objectFit="cover"
                      h="150px"
                      w="100%"
                    />
                    <IconButton
                      aria-label="Supprimer"
                      icon={<FiX />}
                      size="sm"
                      colorScheme="red"
                      position="absolute"
                      top={2}
                      right={2}
                      onClick={() => handleRemoveScreenshot(index)}
                    />
                    <Box
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      bg="blackAlpha.700"
                      p={2}
                    >
                      <Text fontSize="xs" color="white" noOfLines={1}>
                        {screenshot.filename}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {isProcessing && (
            <PageLoader
              label="🔍 Analyse des screenshots en cours..."
              subtitle="Détection des noms et scores par OCR"
              color="blue.500"
              height="220px"
            />
          )}

          <HStack justify="space-between">
            <Button
              leftIcon={<Icon as={FiArrowLeft} />}
              onClick={onBack}
              isDisabled={isProcessing}
            >
              Retour
            </Button>
            <Button
              colorScheme="blue"
              size="lg"
              rightIcon={<Icon as={FiArrowRight} />}
              onClick={handleUpload}
              isDisabled={screenshots.length === 0 || isProcessing}
              isLoading={isProcessing}
              loadingText="Traitement..."
            >
              Analyser {screenshots.length} screenshot{screenshots.length > 1 ? "s" : ""}
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};
