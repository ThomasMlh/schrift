import {
  VStack,
  Heading,
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  useColorMode,
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
import { SearchIcon, StarIcon } from "@chakra-ui/icons";
import { useAbilitySlotsGuide } from "@/hooks/useAPI";
import { useTranslation } from "react-i18next";
import { PageLoader } from "../ui/PageLoader";
import type { IGuideAbilitySlot } from "@/interfaces";

const CATEGORY_COLORS = [
  "blue", "orange", "purple", "teal", "pink", "green", "cyan", "yellow", "red", "gray",
];

const hashColor = (key: string) => {
  const sum = key.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return CATEGORY_COLORS[sum % CATEGORY_COLORS.length];
};

const StarValue = ({ value, isDark }: { value: string; isDark: boolean }) => {
  if (!value) {
    return <Text color={isDark ? "whiteAlpha.300" : "gray.300"}>—</Text>;
  }
  if (value === "Obtenu") {
    return (
      <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2}>
        ✓ {value}
      </Badge>
    );
  }
  if (value.startsWith("+")) {
    return (
      <Text fontWeight="bold" color={isDark ? "green.300" : "green.600"}>
        {value}
      </Text>
    );
  }
  if (value.includes("%")) {
    return (
      <Text fontWeight="semibold" color={isDark ? "purple.200" : "purple.700"}>
        {value}
      </Text>
    );
  }
  return <Text fontWeight="medium">{value}</Text>;
};

const AbilitySlotsGuide = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const bgColor = "bg.card";
  const borderColor = "border.subtle";
  const rowHoverBg = useColorModeValue("purple.50", "whiteAlpha.50");
  const rowStripeBg = "bg.subtle";
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const panelBg = "bg.card";

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
      color: hashColor(category),
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
      {/* Header */}
      <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
        <Box>
          <Heading size="sm" mb={1} color={isDark ? "purple.300" : "purple.600"}>
            {t("components.abilitySlotsGuide.heading")}
          </Heading>
          <Text fontSize="xs" color={mutedText}>
            {t("components.abilitySlotsGuide.description")}
          </Text>
        </Box>
        <Badge
          colorScheme="purple"
          variant={isDark ? "subtle" : "solid"}
          fontSize="sm"
          px={3}
          py={1.5}
          borderRadius="xl"
        >
          {totalRows} {t("components.abilitySlotsGuide.rowsUnit")}
        </Badge>
      </Flex>

      {/* Search */}
      <InputGroup maxW={{ base: "100%", md: "320px" }}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color={mutedText} boxSize={3.5} />
        </InputLeftElement>
        <Input
          placeholder={t("components.abilitySlotsGuide.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          bg={bgColor}
          borderColor={borderColor}
          size="sm"
          borderRadius="lg"
        />
      </InputGroup>

      {/* Category groups */}
      {groups.length === 0 && (
        <Text fontSize="sm" color={mutedText} textAlign="center" py={8}>
          {t("components.abilitySlotsGuide.noResults")}
        </Text>
      )}

      <Accordion allowMultiple defaultIndex={groups.map((_, i) => i)}>
        {groups.map(({ category, items, color }) => (
          <AccordionItem
            key={category}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
            overflow="hidden"
            mb={4}
            bg={panelBg}
          >
            <Box h="3px" bgGradient={`linear(90deg, ${color}.500, ${color}.300)`} />
            <AccordionButton
              py={3}
              _hover={{ bg: isDark ? "whiteAlpha.50" : "gray.50" }}
            >
              <HStack flex="1" spacing={3} textAlign="left">
                <Box w={2.5} h={2.5} borderRadius="full" bg={`${color}.500`} flexShrink={0} />
                <Text fontWeight="bold" fontSize="sm">
                  {category}
                </Text>
                <Badge colorScheme={color} variant="subtle" borderRadius="full" fontSize="2xs">
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
                        bg={isDark ? "whiteAlpha.50" : `${color}.50`}
                        borderColor={borderColor}
                        color={isDark ? `${color}.200` : `${color}.700`}
                      >
                        {t("components.abilitySlotsGuide.colName")}
                      </Th>
                      {["★", "★★", "★★★"].map((label) => (
                        <Th
                          key={label}
                          bg={isDark ? "whiteAlpha.50" : `${color}.50`}
                          borderColor={borderColor}
                          color={isDark ? `${color}.200` : `${color}.700`}
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
                        bg={idx % 2 === 1 ? rowStripeBg : "transparent"}
                        _hover={{ bg: rowHoverBg }}
                        transition="background 0.15s"
                      >
                        <Td borderColor={borderColor} fontSize="sm">
                          {row.name}
                        </Td>
                        <Td borderColor={borderColor} textAlign="center" fontSize="sm">
                          <StarValue value={row.star1} isDark={isDark} />
                        </Td>
                        <Td borderColor={borderColor} textAlign="center" fontSize="sm">
                          <StarValue value={row.star2} isDark={isDark} />
                        </Td>
                        <Td borderColor={borderColor} textAlign="center" fontSize="sm">
                          <StarValue value={row.star3} isDark={isDark} />
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
