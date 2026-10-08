import {
  Box, Button, FormControl, FormLabel, Input, Table, Tbody, Td, Textarea, Th, Thead, Tr, useColorModeValue, useToast, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, VStack, HStack, NumberInput, NumberInputField, Alert, AlertIcon,
} from "@chakra-ui/react";
import { useState } from "react";
import { DeleteIcon, EditIcon, AddIcon } from "@chakra-ui/icons";
import { PageLoader } from "./ui/PageLoader";
import { DeleteConfirmationModal } from "./ui/DeleteConfirmationModal";
import { useOrbGuide } from "@/hooks/useAPI";
import { useOrbGuideMutations } from "@/hooks/useAPIMutations";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface OrbSource {
  _id?: string;
  title: string;
  description: string;
  amount: number;
}

const OrbGuideAdminSection = () => {
  const { orbData, isLoading, error, mutate } = useOrbGuide();
  const { saveOrbSource, deleteOrbSource } = useOrbGuideMutations();
  const [selectedOrb, setSelectedOrb] = useState<OrbSource | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = "bg.card";
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleOpenModal = (orb?: OrbSource) => {
    setSelectedOrb(orb ?? { title: "", description: "", amount: 0 });
    setIsEditing(!!orb);
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedOrb(null);
    setIsEditing(false);
    onClose();
  };

  const handleSave = async () => {
    if (!selectedOrb) return;
    setSaving(true);
    try {
      const result = await saveOrbSource(
        { title: selectedOrb.title, description: selectedOrb.description, amount: selectedOrb.amount },
        isEditing && selectedOrb._id ? selectedOrb._id : undefined
      );
      toast({ title: (result as { message: string }).message, status: "success", duration: 3000 });
      mutate();
      handleCloseModal();
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer les modifications", status: "error", duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  // Entrée en attente de confirmation de suppression
  const [toDelete, setToDelete] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = async () => {
    if (!toDelete) return;
    setSaving(true);
    try {
      const result = await deleteOrbSource(toDelete.id);
      toast({ title: (result as { message: string }).message, status: "success", duration: 3000 });
      mutate();
      setToDelete(null);
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer l'entrée", status: "error", duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <PageLoader color="purple.500" height="400px" />;
  if (error) return <Alert status="error"><AlertIcon />{error.message}</Alert>;

  const orbList = orbData?.data ?? [];

  return (
    <Box w="100%" p={4}>
      <Box mb={6}>
        <SectionHeader
          icon="📚"
          title="Guide des orbes"
          description="Sources d'orbes affichées dans le guide public."
          actions={<Button leftIcon={<AddIcon />} colorScheme="purple" onClick={() => handleOpenModal()}>Ajouter une source</Button>}
        />
      </Box>

      <Box bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="auto">
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
            {orbList.map((orb) => (
              <Tr key={orb._id}>
                <Td>{orb.title}</Td>
                <Td maxW="400px" isTruncated>{orb.description}</Td>
                <Td isNumeric fontWeight="bold">{orb.amount}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton aria-label="Modifier" icon={<EditIcon />} size="sm" colorScheme="blue" onClick={() => handleOpenModal(orb)} />
                    <IconButton aria-label="Supprimer" icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => orb._id && setToDelete({ id: orb._id, title: orb.title })} isDisabled={!orb._id} />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <DeleteConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={saving}
        title="Supprimer la source d'orbes"
        description={`Supprimer « ${toDelete?.title ?? ""} » du guide des orbes ? Cette action est définitive.`}
      />

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? "Modifier la source d'orbes" : "Ajouter une source d'orbes"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Titre (avec emoji)</FormLabel>
                <Input
                  placeholder="⚔️ Guild Quest"
                  value={selectedOrb?.title || ""}
                  onChange={(e) => setSelectedOrb(prev => prev ? { ...prev, title: e.target.value } : null)}
                  autoComplete="off"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="40 orbes pour un classement A2 par semaine..."
                  value={selectedOrb?.description || ""}
                  onChange={(e) => setSelectedOrb(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={4}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Nombre d'orbes</FormLabel>
                <NumberInput
                  min={0}
                  value={selectedOrb?.amount || 0}
                  onChange={(_, v) => setSelectedOrb(prev => prev ? { ...prev, amount: v || 0 } : null)}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>Annuler</Button>
            <Button
              colorScheme="purple"
              onClick={handleSave}
              isLoading={saving}
              isDisabled={!selectedOrb?.title || !selectedOrb?.description || !selectedOrb?.amount}
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
