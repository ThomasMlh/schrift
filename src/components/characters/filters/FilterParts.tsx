import { useState, type ReactNode } from "react";
import { Box, Button, Flex, HStack, Icon, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "react-i18next";

// Collapsible block of the filter panel, like the in-game filter sections
export const FilterSection = ({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Box>
      <Flex
        as="button"
        type="button"
        w="100%"
        align="center"
        justify="space-between"
        px={3}
        py={2}
        bg="bg.subtle"
        borderRadius="md"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <Text fontSize="sm" fontWeight="semibold" color="text.strong">{title}</Text>
        <Icon as={FiChevronDown} color="orange.400" boxSize={5} transform={isOpen ? "rotate(180deg)" : undefined} transition="transform 0.15s" />
      </Flex>
      {isOpen && <Box pt={3} pb={1} px={1}>{children}</Box>}
    </Box>
  );
};

// One choice of a section; the active one is highlighted in orange like in the game
export const FilterChip = ({ isActive, onClick, icon, children, fullWidth }: {
  isActive: boolean;
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
}) => (
  <Button
    size="sm"
    h={fullWidth ? "auto" : "36px"}
    minH="36px"
    py={fullWidth ? 2 : undefined}
    w={fullWidth ? "100%" : undefined}
    whiteSpace={fullWidth ? "normal" : undefined}
    textAlign="center"
    borderRadius="lg"
    variant={isActive ? "solid" : "outline"}
    colorScheme={isActive ? "orange" : "gray"}
    bgGradient={isActive ? "linear(to-b, orange.400, orange.600)" : undefined}
    fontWeight="semibold"
    leftIcon={icon ? <Box display="inline-flex">{icon}</Box> : undefined}
    onClick={onClick}
    aria-pressed={isActive}
  >
    {children}
  </Button>
);

// "All" plus one chip per option, single choice
export const ChoiceRow = <T extends string>({ value, options, onChange }: {
  value: T | "";
  options: { value: T; label: string; icon?: ReactNode }[];
  onChange: (value: T | "") => void;
}) => {
  const { t } = useTranslation();
  return (
    <Wrap spacing={2}>
      <WrapItem>
        <FilterChip isActive={value === ""} onClick={() => onChange("")}>{t("components.characterFilters.all")}</FilterChip>
      </WrapItem>
      {options.map((option) => (
        <WrapItem key={option.value}>
          <FilterChip isActive={value === option.value} onClick={() => onChange(value === option.value ? "" : option.value)} icon={option.icon}>
            {option.label}
          </FilterChip>
        </WrapItem>
      ))}
    </Wrap>
  );
};

// "All" plus one chip per option, several choices at once ("All" clears them)
export const MultiChoiceRow = ({ values, options, onChange }: {
  values: string[];
  options: { value: string; label: string; icon?: ReactNode }[];
  onChange: (values: string[]) => void;
}) => {
  const { t } = useTranslation();
  const toggle = (value: string) => onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  return (
    <Wrap spacing={2}>
      <WrapItem>
        <FilterChip isActive={values.length === 0} onClick={() => onChange([])}>{t("components.characterFilters.all")}</FilterChip>
      </WrapItem>
      {options.map((option) => (
        <WrapItem key={option.value}>
          <FilterChip isActive={values.includes(option.value)} onClick={() => toggle(option.value)} icon={option.icon}>
            {option.label}
          </FilterChip>
        </WrapItem>
      ))}
    </Wrap>
  );
};

// Summary line of a group picked in a dialog: "No filter (all)" or the number of selected entries
export const GroupRow = ({ title, count, onOpen, isDisabled }: { title: string; count: number; onOpen: () => void; isDisabled?: boolean }) => {
  const { t } = useTranslation();
  return (
    <Flex align="center" justify="space-between" gap={3} px={3} py={2} bg="bg.subtle" borderRadius="md">
      <Text fontSize="sm" fontWeight="semibold" color="text.strong" noOfLines={1}>{title}</Text>
      <HStack spacing={3} flexShrink={0}>
        <Text fontSize="sm" color={count > 0 ? "orange.400" : "text.muted"} display={{ base: "none", sm: "block" }}>
          {count > 0 ? t("components.characterFilters.selected", { count }) : t("components.characterFilters.noFilter")}
        </Text>
        <Button size="sm" variant={count > 0 ? "solid" : "outline"} colorScheme={count > 0 ? "orange" : "gray"} onClick={onOpen} isDisabled={isDisabled}>
          {count > 0 ? t("components.characterFilters.edit") : t("components.characterFilters.choose")}
        </Button>
      </HStack>
    </Flex>
  );
};
