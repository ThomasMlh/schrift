import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Table,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  Spinner,
  Alert,
  AlertIcon
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { DeleteIcon, EditIcon, AddIcon } from "@chakra-ui/icons";

interface OrbSource {
  _id?: string;
  title: string;
  description: string;
  amount: number;
}

interface OrbGuideResponse {
  totalOrbes: number;
  data: OrbSource[];
}

const OrbGuideAdminSection = () => {
  const [orbData, setOrbData] = useState<OrbSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrb, setSelectedOrb] = useState<OrbSource | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Fetch initial data
  useEffect(() => {
    
    fetchOrbGuide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrbGuide = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/guides/orbes`);
      if (!response.ok) throw new Error("Failed to fetch orb guide");
      const data: OrbGuideResponse = await response.json();
      setOrbData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données",
        status: "error",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (orb?: OrbSource) => {
    if (orb) {
      setSelectedOrb(orb);
      setIsEditing(true);
    } else {
      setSelectedOrb({ title: "", description: "", amount: 0 });
      setIsEditing(false);
    }
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedOrb(null);
    setIsEditing(false);
    onClose();
  };

  const handleSave = async () => {
    if (!selectedOrb) return;

    const token = localStorage.getItem("userToken");
    setSaving(true);

    try {
      let response: Response;

      if (isEditing && selectedOrb._id) {
        // PATCH - Mise à jour
        response = await fetch(
          `${apiUrl}/api/guides/orbes/${selectedOrb._id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` })
            },
            body: JSON.stringify({
              title: selectedOrb.title,
              description: selectedOrb.description,
              amount: selectedOrb.amount
            })
          }
        );
      } else {
        // POST - Ajout
        response = await fetch(`${apiUrl}/api/guides/orbes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify({
            title: selectedOrb.title,
            description: selectedOrb.description,
            amount: selectedOrb.amount
          })
        });
      }

      if (!response.ok) throw new Error("Failed to save");
      const responseData = await response.json();

      toast({
        title: responseData.message,
        status: "success",
        duration: 3000
      });

      handleCloseModal();
      fetchOrbGuide();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications",
        status: "error",
        duration: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) return;

    const token = localStorage.getItem("userToken");
    setSaving(true);

    try {
      const response = await fetch(`${apiUrl}/api/guides/orbes/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!response.ok) throw new Error(response.statusText);
      const responseData = await response.json();

      toast({
        title: responseData.message,
        status: "success",
        duration: 3000
      });

      fetchOrbGuide();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'entrée",
        status: "error",
        duration: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box w="100%" p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">📚 Gestion du Guide Orbes</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="purple"
          onClick={() => handleOpenModal()}
        >
          Ajouter une source
        </Button>
      </Flex>

      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="auto"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Titre</Th>
              <Th>Description</Th>
              <Th isNumeric>Orbes</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orbData.map((orb) => (
              <Tr key={orb._id}>
                <Td>{orb.title}</Td>
                <Td maxW="400px" isTruncated>
                  {orb.description}
                </Td>
                <Td isNumeric fontWeight="bold">
                  {orb.amount}
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Modifier"
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleOpenModal(orb)}
                    />
                    <IconButton
                      aria-label="Supprimer"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => orb._id && handleDelete(orb._id)}
                      isDisabled={!orb._id}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal d'édition/ajout */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing
              ? "Modifier la source d'orbes"
              : "Ajouter une source d'orbes"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Titre (avec emoji)</FormLabel>
                <Input
                  type="text"
                  placeholder="⚔️ Guild Quest"
                  value={selectedOrb?.title || ""}
                  onChange={(e) =>
                    setSelectedOrb((prev) =>
                      prev ? { ...prev, title: e.target.value } : null
                    )
                  }
                  autoComplete="off"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="40 orbes pour un classement A2 par semaine..."
                  value={selectedOrb?.description || ""}
                  onChange={(e) =>
                    setSelectedOrb((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  rows={4}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Nombre d'orbes</FormLabel>
                <NumberInput
                  min={0}
                  value={selectedOrb?.amount || 0}
                  onChange={(_, valueAsNumber) =>
                    setSelectedOrb((prev) =>
                      prev ? { ...prev, amount: valueAsNumber || 0 } : null
                    )
                  }
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleSave}
              isLoading={saving}
              isDisabled={
                !selectedOrb?.title ||
                !selectedOrb?.description ||
                !selectedOrb?.amount
              }
            >
              {isEditing ? "Enregistrer" : "Ajouter"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OrbGuideAdminSection;
