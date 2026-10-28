import { useMemo, useState } from "react";
import {
  Box, Button, Checkbox, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter,
  ModalHeader, ModalOverlay, SimpleGrid, Text, VStack,
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { GameText } from "@/interfaces";
import { gameText } from "@/utils/gameText";

export interface PickerCategory {
  id: string | number;
  label: GameText | null;
  types: { type: string; label: GameText }[];
}

// Dialog of one filter group: entries grouped by category, the character must have every checked one
export const GroupPickerModal = ({ title, categories, selected, isOpen, onClose, onChange }: {
  title: string;
  categories: PickerCategory[];
  selected: string[];
  isOpen: boolean;
  onClose: () => void;
  onChange: (types: string[]) => void;
}) => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories
      .map((category) => ({ ...category, types: category.types.filter((type) => !term || gameText(type.label, i18n.language).toLowerCase().includes(term)) }))
      .filter((category) => category.types.length > 0);
  }, [categories, search, i18n.language]);

  const toggle = (type: string, checked: boolean) => onChange(checked ? [...selected, type] : selected.filter((s) => s !== type));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <InputGroup size="sm" mb={4}>
            <InputLeftElement pointerEvents="none"><FiSearch /></InputLeftElement>
            <Input placeholder={t("components.characterFilters.search")} value={search} onChange={(e) => setSearch(e.target.value)} borderRadius="md" />
          </InputGroup>
          <VStack align="stretch" spacing={4}>
            {visible.map((category) => (
              <Box key={category.id}>
                {category.label && (
                  <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wide" mb={2}>
                    {gameText(category.label, i18n.language)}
                  </Text>
                )}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacingX={4} spacingY={1.5}>
                  {category.types.map((type) => (
                    <Checkbox
                      key={type.type}
                      size="sm"
                      colorScheme="orange"
                      isChecked={selected.includes(type.type)}
                      onChange={(e) => toggle(type.type, e.target.checked)}
                    >
                      <Text fontSize="sm">{gameText(type.label, i18n.language)}</Text>
                    </Checkbox>
                  ))}
                </SimpleGrid>
              </Box>
            ))}
            {visible.length === 0 && <Text fontSize="sm" color="text.muted">{t("components.characterFilters.nothingFound")}</Text>}
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" colorScheme="red" onClick={() => onChange([])} isDisabled={selected.length === 0}>
            {t("components.characterFilters.clearGroup")}
          </Button>
          <Button colorScheme="orange" onClick={onClose}>{t("components.characterFilters.done")}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
