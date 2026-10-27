import { useMemo, useState } from "react";
import {
  Badge, Box, Button, Checkbox, HStack, Input, InputGroup, InputLeftElement, Popover, PopoverBody, PopoverContent,
  PopoverFooter, PopoverTrigger, Portal, Text, VStack,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { ITraitFilterCategory } from "@/interfaces";
import { useSelectTheme } from "@/hooks/useSelectTheme";
import { gameText } from "@/utils/gameText";

// The game's ability filter: abilities grouped by category, the character must have every checked one
export const TraitFilter = ({ categories, selected, onChange }: {
  categories: ITraitFilterCategory[];
  selected: string[];
  onChange: (traits: string[]) => void;
}) => {
  const { t, i18n } = useTranslation();
  const theme = useSelectTheme("default");
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories
      .map((category) => ({
        ...category,
        types: category.types.filter((type) => !term || gameText(type.label, i18n.language).toLowerCase().includes(term)),
      }))
      .filter((category) => category.types.length > 0);
  }, [categories, search, i18n.language]);

  const toggle = (type: string, checked: boolean) => onChange(checked ? [...selected, type] : selected.filter((s) => s !== type));

  return (
    <Popover placement="bottom-start" isLazy>
      <PopoverTrigger>
        <Button
          rightIcon={<ChevronDownIcon />}
          variant="outline"
          w="100%"
          h="40px"
          justifyContent="space-between"
          bg={theme.buttonBg}
          borderColor={theme.borderColor}
          _hover={{ borderColor: theme.hoverBorderColor }}
          isDisabled={categories.length === 0}
        >
          <HStack spacing={2} minW={0}>
            <Text fontSize="sm" noOfLines={1}>{t("components.charactersTable.traits")}</Text>
            {selected.length > 0 && <Badge colorScheme="purple" borderRadius="full">{selected.length}</Badge>}
          </HStack>
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent w={{ base: "calc(100vw - 32px)", sm: "380px" }} bg={theme.menuBg} borderColor={theme.menuBorderColor}>
          <PopoverBody p={3}>
            <InputGroup size="sm" mb={2}>
              <InputLeftElement pointerEvents="none"><FiSearch /></InputLeftElement>
              <Input
                placeholder={t("components.charactersTable.traitsSearch")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                borderRadius="md"
              />
            </InputGroup>
            <VStack align="stretch" spacing={3} maxH="320px" overflowY="auto" pr={1}>
              {visible.map((category) => (
                <Box key={category.id}>
                  <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wide" mb={1}>
                    {gameText(category.label, i18n.language)}
                  </Text>
                  <VStack align="stretch" spacing={1}>
                    {category.types.map((type) => (
                      <Checkbox
                        key={type.type}
                        size="sm"
                        colorScheme="purple"
                        isChecked={selected.includes(type.type)}
                        onChange={(e) => toggle(type.type, e.target.checked)}
                      >
                        <Text fontSize="sm">{gameText(type.label, i18n.language)}</Text>
                      </Checkbox>
                    ))}
                  </VStack>
                </Box>
              ))}
              {visible.length === 0 && <Text fontSize="sm" color="text.muted">{t("components.charactersTable.traitsNone")}</Text>}
            </VStack>
          </PopoverBody>
          {selected.length > 0 && (
            <PopoverFooter py={2} px={3}>
              <Button size="xs" variant="ghost" colorScheme="red" onClick={() => onChange([])}>
                {t("components.charactersTable.traitsClear")}
              </Button>
            </PopoverFooter>
          )}
        </PopoverContent>
      </Portal>
    </Popover>
  );
};
