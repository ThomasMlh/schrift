import {
  Box, Button, Flex, FormControl, FormLabel, Heading, Input, Select, Table, Tbody, Td, Text,
  Th, Thead, Tr, useColorModeValue, useToast, IconButton, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure,
  VStack, HStack, Alert, AlertIcon
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { DeleteIcon, EditIcon, AddIcon } from "@chakra-ui/icons";
import { PageLoader } from "./ui/PageLoader";
import { DeleteConfirmationModal } from "./ui/DeleteConfirmationModal";
import { useAbilitySlotsGuide } from "@/hooks/useAPI";
import { useAbilitySlotsGuideMutations } from "@/hooks/useAPIMutations";
import type { IGuideAbilitySlot } from "@/interfaces";

type AbilitySlotRow = Partial<IGuideAbilitySlot> & { category: string; name: string; star1: string; star2: string; star3: string };

const EMPTY_ROW: AbilitySlotRow = { category: "", name: "", star1: "", star2: "", star3: "" };

const NEW_CATEGORY_VALUE = "__new__";

const AbilitySlotsAdminSection = () => {
  const { abilitySlotsData, isLoading, error, mutate } = useAbilitySlotsGuide();
  const { saveAbilitySlotRow, deleteAbilitySlotRow } = useAbilitySlotsGuideMutations();
  const [selectedRow, setSelectedRow] = useState<AbilitySlotRow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<IGuideAbilitySlot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const existingCategories = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    (abilitySlotsData?.data ?? []).forEach((row) => {
      if (!seen.has(row.category)) {
        seen.add(row.category);
        ordered.push(row.category);
      }
    });
    return ordered;
  }, [abilitySlotsData]);

  const handleOpenModal = (row?: IGuideAbilitySlot) => {
    setSelectedRow(row ? { ...row } : { ...EMPTY_ROW });
    setIsEditing(!!row);
    setIsNewCategory(row ? !existingCategories.includes(row.category) : existingCategories.length === 0);
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setIsEditing(false);
    setIsNewCategory(false);
    onClose();
  };

  const handleCategorySelectChange = (value: string) => {
    if (value === NEW_CATEGORY_VALUE) {
      setIsNewCategory(true);
      setSelectedRow(prev => prev ? { ...prev, category: "" } : null);
    } else {
      setIsNewCategory(false);
      setSelectedRow(prev => prev ? { ...prev, category: value } : null);
    }
  };

  const handleSave = async () => {
    if (!selectedRow) return;
    setSaving(true);
    try {
      const result = await saveAbilitySlotRow(
        {
          category: selectedRow.category,
          name: selectedRow.name,
          star1: selectedRow.star1,
          star2: selectedRow.star2,
          star3: selectedRow.star3,
        },
        isEditing && selectedRow._id ? selectedRow._id : undefined
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

  const handleOpenDeleteModal = (row: IGuideAbilitySlot) => {
    setRowToDelete(row);
    onDeleteOpen();
  };

  const handleCloseDeleteModal = () => {
    setRowToDelete(null);
    onDeleteClose();
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete?._id) return;
    setIsDeleting(true);
    try {
      const result = await deleteAbilitySlotRow(rowToDelete._id);
      toast({ title: (result as { message: string }).message, status: "success", duration: 3000 });
      mutate();
      handleCloseDeleteModal();
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer la ligne", status: "error", duration: 3000 });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <PageLoader color="purple.500" height="400px" />;
  if (error) return <Alert status="error"><AlertIcon />{error.message}</Alert>;

  const rows = abilitySlotsData?.data ?? [];

  return (
    <Box w="100%" p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">🎯 Gestion des Emplacements de capacités</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="purple" onClick={() => handleOpenModal()}>
          Ajouter une ligne
        </Button>
      </Flex>

      <Text fontSize="sm" color="gray.500" mb={4}>
        L'ordre d'affichage est calculé automatiquement : une nouvelle ligne est ajoutée à la
        suite des autres lignes de sa catégorie (ou en fin de tableau pour une nouvelle catégorie).
      </Text>

      <Box bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Catégorie</Th>
              <Th>Nom</Th>
              <Th>★</Th>
              <Th>★★</Th>
              <Th>★★★</Th>
              <Th isNumeric>Ordre</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={row._id}>
                <Td>{row.category}</Td>
                <Td>{row.name}</Td>
                <Td>{row.star1 || "—"}</Td>
                <Td>{row.star2 || "—"}</Td>
                <Td>{row.star3 || "—"}</Td>
                <Td isNumeric>{row.order}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton aria-label="Modifier" icon={<EditIcon />} size="sm" colorScheme="blue" onClick={() => handleOpenModal(row)} />
                    <IconButton aria-label="Supprimer" icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => handleOpenDeleteModal(row)} isDisabled={!row._id} />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? "Modifier la ligne" : "Ajouter une ligne"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Catégorie</FormLabel>
                {existingCategories.length > 0 && !isNewCategory ? (
                  <Select
                    placeholder="Choisir une catégorie"
                    value={selectedRow?.category || ""}
                    onChange={(e) => handleCategorySelectChange(e.target.value)}
                  >
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value={NEW_CATEGORY_VALUE}>+ Nouvelle catégorie...</option>
                  </Select>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    <Input
                      placeholder="Aptitude augmentée"
                      value={selectedRow?.category || ""}
                      onChange={(e) => setSelectedRow(prev => prev ? { ...prev, category: e.target.value } : null)}
                      autoComplete="off"
                    />
                    {existingCategories.length > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        alignSelf="flex-start"
                        onClick={() => handleCategorySelectChange(existingCategories[0])}
                      >
                        ← Choisir une catégorie existante
                      </Button>
                    )}
                  </VStack>
                )}
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Nom</FormLabel>
                <Input
                  placeholder="Attaque"
                  value={selectedRow?.name || ""}
                  onChange={(e) => setSelectedRow(prev => prev ? { ...prev, name: e.target.value } : null)}
                  autoComplete="off"
                />
              </FormControl>
              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>★</FormLabel>
                  <Input
                    placeholder="8-40"
                    value={selectedRow?.star1 || ""}
                    onChange={(e) => setSelectedRow(prev => prev ? { ...prev, star1: e.target.value } : null)}
                    autoComplete="off"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>★★</FormLabel>
                  <Input
                    placeholder="48-80"
                    value={selectedRow?.star2 || ""}
                    onChange={(e) => setSelectedRow(prev => prev ? { ...prev, star2: e.target.value } : null)}
                    autoComplete="off"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>★★★</FormLabel>
                  <Input
                    placeholder="96-160"
                    value={selectedRow?.star3 || ""}
                    onChange={(e) => setSelectedRow(prev => prev ? { ...prev, star3: e.target.value } : null)}
                    autoComplete="off"
                  />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>Annuler</Button>
            <Button
              colorScheme="purple"
              onClick={handleSave}
              isLoading={saving}
              isDisabled={!selectedRow?.category || !selectedRow?.name}
            >
              {isEditing ? "Enregistrer" : "Ajouter"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Supprimer la ligne"
        description="Êtes-vous sûr de vouloir supprimer cette ligne du tableau des emplacements de capacités ? Cette action est irréversible."
        itemDetails={
          rowToDelete ? (
            <Text fontSize="sm">
              <strong>Catégorie :</strong> {rowToDelete.category}<br />
              <strong>Nom :</strong> {rowToDelete.name}
            </Text>
          ) : undefined
        }
      />
    </Box>
  );
};

export default AbilitySlotsAdminSection;
