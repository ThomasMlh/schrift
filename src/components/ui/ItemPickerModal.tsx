import {
  Box, Flex, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader,
  ModalOverlay, SimpleGrid, Spinner, Text,
} from "@chakra-ui/react";
import { useMemo, useState, type ReactNode } from "react";
import { FiSearch } from "react-icons/fi";

interface ItemPickerModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  searchPlaceholder: string;
  emptyLabel: string;
  items: T[];
  isLoading: boolean;
  getSearchText: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  onPick: (item: T) => void;
}

const normalize = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Mounted with the modal only: the search starts empty each time it opens
const PickerContent = <T extends { _id: string }>({
  searchPlaceholder, emptyLabel, items, isLoading, getSearchText, renderItem, onPick,
}: Omit<ItemPickerModalProps<T>, "isOpen" | "onClose" | "title">) => {
  const [search, setSearch] = useState("");
  const visibleItems = useMemo(() => {
    const term = normalize(search.trim());
    return term ? items.filter((item) => normalize(getSearchText(item)).includes(term)) : items;
  }, [items, search, getSearchText]);

  return (
    <>
      <Box px={6} pb={3}>
        <InputGroup>
          <InputLeftElement pointerEvents="none"><FiSearch /></InputLeftElement>
          <Input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchPlaceholder} />
        </InputGroup>
      </Box>
      <ModalBody pb={6}>
        {isLoading ? (
          <Flex justify="center" py={10}><Spinner /></Flex>
        ) : visibleItems.length === 0 ? (
          <Text py={10} textAlign="center" fontSize="sm" color="text.muted">{emptyLabel}</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
            {visibleItems.map((item) => (
              <Box
                key={item._id}
                as="button"
                type="button"
                textAlign="left"
                p={3}
                borderWidth="1px"
                borderColor="border.subtle"
                borderRadius="lg"
                _hover={{ borderColor: "purple.400" }}
                onClick={() => onPick(item)}
              >
                {renderItem(item)}
              </Box>
            ))}
          </SimpleGrid>
        )}
      </ModalBody>
    </>
  );
};

// Searchable list for the short game lists: accessories and bonus skills
export const ItemPickerModal = <T extends { _id: string }>({ isOpen, onClose, title, ...content }: ItemPickerModalProps<T>) => (
  <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <PickerContent {...content} />
    </ModalContent>
  </Modal>
);
