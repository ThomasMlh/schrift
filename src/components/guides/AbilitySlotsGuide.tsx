import {
  VStack,
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  HStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { StarIcon } from "@chakra-ui/icons";
import { FiCheck, FiSearch } from "react-icons/fi";
import { useAbilitySlotsGuide } from "@/hooks/useAPI";
import { useTranslation } from "react-i18next";
import { PageLoader } from "../ui/PageLoader";
import type { IGuideAbilitySlot } from "@/interfaces";

const StarValue = ({ value }: { value: string }) => {
  if (!value) {
    return <Text color="text.muted">—</Text>;
  }
  if (value === "Obtenu") {
    return (
      <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2} display="inline-flex" alignItems="center" gap={1}>
        <Icon as={FiCheck} aria-hidden /> {value}
      </Badge>
    );
  }
  if (value.startsWith("+")) {
    return <Text fontWeight="bold" color="green.400">{value}</Text>;
  }
  if (value.includes("%")) {
    return <Text fontWeight="semibold" color="accent">{value}</Text>;
  }
  return <Text fontWeight="medium">{value}</Text>;
};

const AbilitySlotsGuide = () => {
  const borderColor = "border.subtle";

  const { t } = useTranslation();
  const { abilitySlotsData, isLoading: loading, error } = useAbilitySlotsGuide();
  const [search, setSearch] = useState("");

  const groups = useMemo(() => {
    const rows = abilitySlotsData?.data ?? [];
    const query = search.trim().toLowerCase();
    const filtered = query
      ? rows.filter(
          (row: IGuideAbilitySlot) =>
            row.name.toLowerCase().includes(query) ||
            row.category.toLowerCase().includes(query)
        )
      : rows;

    const byCategory = new Map<string, IGuideAbilitySlot[]>();
    filtered.forEach((row: IGuideAbilitySlot) => {
      const list = byCategory.get(row.category) ?? [];
      list.push(row);
      byCategory.set(row.category, list);
    });

    return Array.from(byCategory.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [abilitySlotsData, search]);

  if (loading) {
    return <PageLoader color="purple.500" height="400px" />;
  }

  if (error) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        minH="200px"
        borderRadius="md"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          {t("components.abilitySlotsGuide.errorTitle")}
        </AlertTitle>
        <AlertDescription maxWidth="sm">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!abilitySlotsData) {
    return null;
  }

  const totalRows = abilitySlotsData.data.length;

  return (
    <VStack spacing={6} align="stretch">
      {/* En-tête et recherche (la recherche reste visible au défilement) */}
      <Box
        position="sticky"
        // Sous la barre de navigation, elle-même collante en haut de page
        top="calc(var(--sait, 0px) + 64px)"
        zIndex={2}
        bg="bg.card"
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        p={4}
      >
        <Flex align={{ base: "stretch", md: "center" }} justify="space-between" direction={{ base: "column", md: "row" }} gap={3}>
          <Box>
            <HStack spacing={2} mb={1}>
              <Text fontWeight="bold" color="text.strong">{t("components.abilitySlotsGuide.heading")}</Text>
              <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2}>
                {totalRows} {t("components.abilitySlotsGuide.rowsUnit")}
              </Badge>
            </HStack>
            <Text fontSize="sm" color="text.secondary">{t("components.abilitySlotsGuide.description")}</Text>
          </Box>
          <InputGroup maxW={{ base: "100%", md: "300px" }} flexShrink={0}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="text.muted" />
            </InputLeftElement>
            <Input
              placeholder={t("components.abilitySlotsGuide.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              borderRadius="lg"
            />
          </InputGroup>
        </Flex>
      </Box>

      {/* Category groups */}
      {groups.length === 0 && (
        <Text fontSize="sm" color="text.muted" textAlign="center" py={8}>
          {t("components.abilitySlotsGuide.noResults")}
        </Text>
      )}

      <Accordion allowMultiple defaultIndex={groups.map((_, i) => i)}>
        {groups.map(({ category, items }) => (
          <AccordionItem
            key={category}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
            overflow="hidden"
            mb={4}
            bg="bg.card"
          >
            <AccordionButton py={3} _hover={{ bg: "bg.hover" }}>
              <HStack flex="1" spacing={3} textAlign="left">
                <Text fontWeight="bold" fontSize="sm" color="text.strong">
                  {category}
                </Text>
                <Badge colorScheme="purple" variant="subtle" borderRadius="full" fontSize="2xs">
                  {items.length}
                </Badge>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel p={0}>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead position="sticky" top={0} zIndex={1}>
                    <Tr>
                      <Th
                        bg="bg.subtle"
                        borderColor={borderColor}
                      >
                        {t("components.abilitySlotsGuide.colName")}
                      </Th>
                      {["★", "★★", "★★★"].map((label) => (
                        <Th
                          key={label}
                          bg="bg.subtle"
                          borderColor={borderColor}
                          textAlign="center"
                        >
                          <HStack justify="center" spacing={0.5}>
                            {label.split("").map((_, i) => (
                              <StarIcon key={i} boxSize={2.5} color="yellow.400" />
                            ))}
                          </HStack>
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {items.map((row, idx) => (
                      <Tr
                        key={row._id}
                        bg={idx % 2 === 1 ? "bg.subtle" : "transparent"}
                        _hover={{ bg: "bg.hover" }}
                        transition="background 0.15s"
                      >
                        <Td borderColor={borderColor} fontSize="sm">
                          {row.name}
                        </Td>
                        <Td borderColor={borderColor} textAlign="center" fontSize="sm">
                          <StarValue value={row.star1} />
                        </Td>
                        <Td borderColor={borderColor} textAlign="center" fontSize="sm">
                          <StarValue value={row.star2} />
                        </Td>
                        <Td borderColor={borderColor} textAlign="center" fontSize="sm">
                          <StarValue value={row.star3} />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </VStack>
  );
};

export default AbilitySlotsGuide;
