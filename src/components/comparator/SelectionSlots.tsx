import type { ReactNode } from "react";
import { Box, Button, Flex, HStack, Icon, IconButton, Text } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { FiPlus } from "react-icons/fi";

export interface SlotItem {
  id: string;
  color: string;
  content: ReactNode;
}

interface SelectionSlotsProps {
  title: string;
  items: SlotItem[];
  max: number;
  onRemove: (id: string) => void;
  removeLabel: string;
  addLabel: string;
  // Champ de recherche / sélection pour ajouter un élément
  children: ReactNode;
  // Id du conteneur du champ d'ajout : un emplacement vide met le focus dessus
  addFieldId: string;
}

// Emplacements de sélection du comparateur : un emplacement par élément choisi, dans la couleur
// qu'il aura sur les graphiques, et des emplacements vides qui renvoient au champ d'ajout.
export const SelectionSlots = ({
  title, items, max, onRemove, removeLabel, addLabel, children, addFieldId,
}: SelectionSlotsProps) => {
  const focusAddField = () => {
    const field = document.querySelector<HTMLInputElement>(`#${addFieldId} input, #${addFieldId} button`);
    field?.focus();
    field?.click();
  };

  return (
    <Box bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border.subtle" p={4}>
      <HStack justify="space-between" mb={3}>
        <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color="text.muted">
          {title}
        </Text>
        <Text fontSize="xs" fontWeight="semibold" color={items.length >= max ? "orange.400" : "text.muted"}>
          {items.length} / {max}
        </Text>
      </HStack>

      <Flex gap={2} wrap="wrap">
        {items.map((item) => (
          <HStack
            key={item.id}
            spacing={2}
            pl={3}
            pr={1}
            py={1.5}
            borderRadius="lg"
            borderWidth="2px"
            borderColor={item.color}
            bg={`${item.color}1F`}
            maxW="100%"
            minW={0}
          >
            <Box minW={0}>{item.content}</Box>
            <IconButton
              icon={<CloseIcon boxSize={2} />}
              aria-label={removeLabel}
              size="xs"
              variant="ghost"
              onClick={() => onRemove(item.id)}
            />
          </HStack>
        ))}
        {Array.from({ length: Math.max(0, max - items.length) }).map((_, i) => (
          <Button
            key={`empty-${i}`}
            variant="outline"
            borderStyle="dashed"
            borderWidth="2px"
            borderRadius="lg"
            color="text.muted"
            h="44px"
            minW="120px"
            leftIcon={<Icon as={FiPlus} />}
            onClick={focusAddField}
          >
            {addLabel}
          </Button>
        ))}
      </Flex>

      {items.length < max && (
        <Box id={addFieldId} mt={3}>
          {children}
        </Box>
      )}
    </Box>
  );
};
