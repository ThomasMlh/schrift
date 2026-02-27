import {
  Container,
  VStack,
  Box,
  Card,
  CardBody,
  Button,
  useToast,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Badge,
  FormControl,
  FormLabel,
  Select,
  Skeleton
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/providers/AuthProvider";

interface Screenshotter {
  id: string;
  label: string;
}

const OCRDebugPage = () => {
  const toast = useToast();
  const { getAuthHeaders } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [annotatedImage, setAnnotatedImage] = useState<string>("");
  const [extractedZones, setExtractedZones] = useState<Array<{
    index: number;
    detectedName: string;
    detectedScore: number;
    name: string;
    score: string;
  }>>([]);
  const [dimensions, setDimensions] = useState<{ width: number; height: number, confidence: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [screenshotters, setScreenshotters] = useState<Screenshotter[]>([]);
  const [selectedScreenshotterId, setSelectedScreenshotterId] = useState("");
  const [loadingScreenshotters, setLoadingScreenshotters] = useState(true);

  // Charger la liste des screenshotters depuis l'API
  useEffect(() => {
    const fetchScreenshotters = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ocr/screenshotters`);
        const data = await res.json();
        if (data.success) {
          setScreenshotters(data.data);
        }
      } catch (error) {
        console.error("Erreur chargement screenshotters:", error);
      } finally {
        setLoadingScreenshotters(false);
      }
    };
    fetchScreenshotters();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVisualize = async () => {
    if (!selectedFile || !previewUrl) {
      toast({
        title: "Aucun fichier",
        description: "Veuillez sélectionner un screenshot",
        status: "warning"
      });
      return;
    }

    if (!selectedScreenshotterId) {
      toast({
        title: "Profil manquant",
        description: "Veuillez sélectionner qui a pris le screenshot",
        status: "warning"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/ocr/debug/visualize-zones`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            screenshot: {
              data: previewUrl,
              filename: selectedFile.name
            },
            screenshotter_id: selectedScreenshotterId
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur visualisation");
      }

      setAnnotatedImage(data.data.annotatedImage);
      setExtractedZones(data.data.extractedZones);
      setDimensions(data.data.dimensions);

      toast({
        title: "Visualisation générée",
        status: "success"
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur visualisation",
        status: "error"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="OCR Debug - Schrift"
        description="Outil de debug pour l'OCR"
      />

      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg">🔍 Debug OCR - Visualisation des zones</Heading>
            <Text mt={2} color="gray.400">
              Cet outil permet de visualiser exactement où l'OCR cherche les noms et scores
            </Text>
          </Box>

          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                    id="screenshot-input"
                  />
                  <label htmlFor="screenshot-input">
                    <Button as="span" colorScheme="blue">
                      Choisir un screenshot
                    </Button>
                  </label>
                  {selectedFile && (
                    <Text ml={3} display="inline" color="gray.400">
                      {selectedFile.name}
                    </Text>
                  )}
                </Box>

                {previewUrl && (
                  <Box>
                    <Heading size="sm" mb={2}>Aperçu original</Heading>
                    <Image 
                      src={previewUrl} 
                      alt="Preview" 
                      maxH="300px" 
                      objectFit="contain"
                      border="2px solid"
                      borderColor="gray.600"
                      borderRadius="md"
                    />
                    {dimensions && (
                      <Text mt={2} fontSize="sm" color="gray.400">
                        Dimensions: {dimensions.width} × {dimensions.height}px
                      </Text>
                    )}
                  </Box>
                )}

                <FormControl isRequired>
                  <FormLabel>Qui a pris le screenshot ?</FormLabel>
                  {loadingScreenshotters ? (
                    <Skeleton height="40px" borderRadius="md" />
                  ) : (
                    <Select
                      value={selectedScreenshotterId}
                      onChange={(e) => setSelectedScreenshotterId(e.target.value)}
                      placeholder="Sélectionner la personne"
                    >
                      {screenshotters.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </Select>
                  )}
                </FormControl>

                <Button
                  colorScheme="green"
                  onClick={handleVisualize}
                  isLoading={isProcessing}
                  isDisabled={!selectedFile || !selectedScreenshotterId}
                  size="lg"
                >
                  🔍 Visualiser les zones d'extraction
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {annotatedImage && (
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Heading size="sm" mb={2}>
                      Zones marquées
                      <Badge ml={3} colorScheme="green">Nom</Badge>
                      <Badge ml={2} colorScheme="cyan">Score</Badge>
                    </Heading>
                    <Image 
                      src={annotatedImage} 
                      alt="Zones annotées" 
                      w="100%"
                      border="2px solid"
                      borderColor="gray.600"
                      borderRadius="md"
                    />
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          )}

          {extractedZones.length > 0 && (
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="sm">Zones prédéfinies</Heading>
                  <Text fontSize="sm" color="gray.400">
                    Zones calibrées pour le profil sélectionné
                  </Text>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {extractedZones.map((zone) => (
                      <Card key={zone.index} variant="outline">
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            <Box>
                              <Heading size="xs" display="inline">Joueur {zone.index}</Heading>
                            </Box>

                            {zone.detectedName && (
                              <Text fontSize="sm" fontWeight="bold" color="green.400">
                                📝 Nom: {zone.detectedName}
                              </Text>
                            )}

                            {zone.detectedScore !== undefined && (
                              <Text fontSize="sm" fontWeight="bold" color="cyan.400">
                                🎯 Score: {zone.detectedScore?.toLocaleString('fr-FR') || '0'}
                              </Text>
                            )}
                            
                            <Box>
                              <Text fontSize="sm" fontWeight="bold" mb={1}>
                                <Badge colorScheme="green">Zone Nom</Badge>
                              </Text>
                              <Image 
                                src={zone.name} 
                                alt={`Nom ${zone.detectedName || zone.index}`}
                                border="1px solid"
                                borderColor="green.500"
                                borderRadius="md"
                                sx={{ imageRendering: "crisp-edges" }}
                              />
                            </Box>
                            
                            <Box>
                              <Text fontSize="sm" fontWeight="bold" mb={1}>
                                <Badge colorScheme="cyan">Zone Score</Badge>
                              </Text>
                              <Image 
                                src={zone.score} 
                                alt={`Score ${zone.detectedScore || zone.index}`}
                                border="1px solid"
                                borderColor="cyan.500"
                                borderRadius="md"
                                sx={{ imageRendering: "crisp-edges" }}
                              />
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          )}

          {extractedZones.length > 0 && (
            <Card bg="yellow.900" borderColor="yellow.600">
              <CardBody>
                <VStack align="stretch" spacing={2}>
                  <Heading size="sm">💡 Comment ajuster les zones</Heading>
                  <Text fontSize="sm">
                    Si les zones ne correspondent pas aux bons emplacements :
                  </Text>
                  <Text fontSize="sm">
                    1. Vérifiez que les rectangles verts (nom) et cyan (score) sont bien placés
                  </Text>
                  <Text fontSize="sm">
                    2. Si non, ajustez les coordonnées du profil correspondant dans <code>/schrift-api/src/utils/ocrProcessor.js</code> (objet SCREENSHOTTER_CONFIGS)
                  </Text>
                  <Text fontSize="sm">
                    3. Les coordonnées sont relatives (0-1) : x=0.5 signifie "au milieu"
                  </Text>
                  <Text fontSize="sm">
                    4. Chaque personne a son propre profil de zones, ajustable indépendamment
                  </Text>
                  <Text fontSize="sm">
                    5. Redémarrez le serveur après modification et testez à nouveau
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </>
  );
};

export default OCRDebugPage;
