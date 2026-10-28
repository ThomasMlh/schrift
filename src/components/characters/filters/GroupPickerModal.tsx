import { useMemo, useState } from "react";
import {
  Box, Button, Divider, Flex, HStack, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Switch, Text, VStack,
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { GameText } from "@/interfaces";
import { gameText } from "@/utils/gameText";
import { FilterChip, FilterSection } from "./FilterParts";

export interface PickerCategory {
  id: string | number;
  label: GameText | null;
  types: { type: string; label: GameText }[];
}

// Dialog of one filter group, like the game: perfect / partial match, "All", collapsible categories of
// two-column buttons, several entries at once
export const GroupPickerModal = ({ title, categories, selected, isPartial, isOpen, onClose, onChange, onPartialChange }: {
  title: string;
  categories: PickerCategory[];
  selected: string[];
  isPartial: boolean;
  isOpen: boolean;
  onClose: () => void;
  onChange: (types: string[]) => void;
  onPartialChange: (partial: boolean) => void;
}) => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories
      .map((category) => ({ ...category, types: category.types.filter((type) => !term || gameText(type.label, i18n.language).toLowerCase().includes(term)) }))
      .filter((category) => category.types.length > 0);
  }, [categories, search, i18n.language]);

  const toggle = (type: string) => onChange(selected.includes(type) ? selected.filter((s) => s !== type) : [...selected, type]);
  const reset = () => {
    onChange([]);
    onPartialChange(false);
  };

  const buttons = (types: PickerCategory["types"]) => (
    <SimpleGrid columns={2} spacing={2}>
      {types.map((type) => (
        <FilterChip key={type.type} fullWidth isActive={selected.includes(type.type)} onClick={() => toggle(type.type)}>
          {gameText(type.label, i18n.language)}
        </FilterChip>
      ))}
    </SimpleGrid>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader pr={14}>
          <Flex align="center" justify="space-between" gap={3}>
            <Text>{title}</Text>
            <Button size="sm" colorScheme="red" variant="outline" onClick={reset} isDisabled={selected.length === 0 && !isPartial}>
              {t("components.characterFilters.reset")}
            </Button>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex align="center" justify="space-between" gap={3} wrap="wrap" mb={3}>
            <Text fontSize="sm" fontWeight="semibold" color="text.strong">{t("components.characterFilters.matching")}</Text>
            <HStack spacing={3}>
              <Text fontSize="sm" fontWeight="semibold" color={isPartial ? "text.muted" : "green.400"}>{t("components.characterFilters.perfect")}</Text>
              <Switch
                colorScheme="orange"
                isChecked={isPartial}
                onChange={(e) => onPartialChange(e.target.checked)}
                aria-label={t("components.characterFilters.matching")}
              />
              <Text fontSize="sm" fontWeight="semibold" color={isPartial ? "green.400" : "text.muted"}>{t("components.characterFilters.partial")}</Text>
            </HStack>
          </Flex>
          <Text fontSize="xs" color="text.muted" mb={3}>
            {isPartial ? t("components.characterFilters.partialHint") : t("components.characterFilters.perfectHint")}
          </Text>
          <Divider mb={4} />

          <SimpleGrid columns={2} spacing={2} mb={4}>
            <FilterChip fullWidth isActive={selected.length === 0} onClick={() => onChange([])}>{t("components.characterFilters.all")}</FilterChip>
          </SimpleGrid>

          <InputGroup size="sm" mb={4}>
            <InputLeftElement pointerEvents="none"><FiSearch /></InputLeftElement>
            <Input placeholder={t("components.characterFilters.search")} value={search} onChange={(e) => setSearch(e.target.value)} borderRadius="md" />
          </InputGroup>

          <VStack align="stretch" spacing={3}>
            {visible.map((category) => (category.label ? (
              <FilterSection key={category.id} title={gameText(category.label, i18n.language)}>{buttons(category.types)}</FilterSection>
            ) : (
              <Box key={category.id}>{buttons(category.types)}</Box>
            )))}
            {visible.length === 0 && <Text fontSize="sm" color="text.muted">{t("components.characterFilters.nothingFound")}</Text>}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="orange" onClick={onClose}>
            {selected.length > 0 ? t("components.characterFilters.doneCount", { count: selected.length }) : t("components.characterFilters.done")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
