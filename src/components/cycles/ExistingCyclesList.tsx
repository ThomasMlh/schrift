import {
  VStack,
  HStack,
  Text,
  Button,
  Flex,
  Badge,
  Box,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
  IconButton,
  useToast,
  SimpleGrid,
  Tooltip,

  Input,
  InputGroup,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from "@chakra-ui/react";
import {
  DeleteIcon,
  DownloadIcon,
  RepeatIcon,
  SearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  EditIcon,
} from "@chakra-ui/icons";
import { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageLoader } from "../ui/PageLoader";
import type { ICycle } from "../../interfaces";
import { AlterationImage } from "../ui/AlterationImage";
import { cycleSlug } from "@/utils/cycleHelpers";
import { PublishCycleRecapButton } from "./PublishCycleRecapButton";

interface ExistingCyclesListProps {
  cycles: ICycle[];
  isLoading: boolean;
  onRefresh: () => void;
  onDownloadEvents: () => void;
  onDownloadCycleEvents: (cycle: ICycle) => void;
  onDeleteCycle: (cycleId: string) => Promise<void>;
  onEditCycle: (cycle: ICycle) => void;
}

/** Mini timeline bar showing rotations as colored segments */
const RotationTimeline = ({ rotations }: { rotations: ICycle["rotations"] }) => {
  if (!rotations || rotations.length === 0) return null;

  return (
    <Tooltip
      label={`${rotations.length} rotations`}
      placement="top"
      hasArrow
    >
      <HStack spacing="2px" w="full" h="8px" borderRadius="full" overflow="hidden">
        {rotations.map((rotation, i) => (
          <Tooltip
            key={i}
            label={`#${i + 1} ${rotation.killer} — ${rotation.period} ${rotation.attack === "R" ? "🔴" : rotation.attack === "B" ? "🔵" : rotation.attack}`}
            placement="top"
            hasArrow
            fontSize="xs"
          >
            <Box
              flex={1}
              h="full"
              bg={rotation.attack === "R" ? "red.400" : rotation.attack === "B" ? "blue.400" : "gray.400"}
              opacity={0.85}
              _hover={{ opacity: 1, transform: "scaleY(1.6)" }}
              transition="all 0.15s"
              cursor="pointer"
            />
          </Tooltip>
        ))}
      </HStack>
    </Tooltip>
  );
};

/** Expanded rotation detail rows */
const RotationDetails = ({ rotations }: { rotations: ICycle["rotations"] }) => {
  const { t } = useTranslation();
  if (!rotations || rotations.length === 0) return null;

  return (
    <Box
      maxH="280px"
      overflowY="auto"
      borderRadius="lg"
      sx={{
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-thumb": { bg: "whiteAlpha.300", borderRadius: "full" },
      }}
    >
      <VStack spacing={0} align="stretch">
        {rotations.map((rotation, index) => (
          <HStack
            key={index}
            px={3}
            py={2}
            fontSize="xs"
            spacing={3}
            _hover={{ bg: "whiteAlpha.50" }}
            borderBottom="1px solid"
            borderColor="whiteAlpha.50"
            transition="background 0.15s"
          >
            <Text
              fontWeight="bold"
              color="whiteAlpha.500"
              minW="28px"
              fontFamily="mono"
            >
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text fontWeight="semibold" flex={1} noOfLines={1}>
              {rotation.killer}
            </Text>
            <AlterationImage alteration={rotation.alteration} size="16px" />
            <Badge
              size="sm"
              px={2}
              borderRadius="full"
              colorScheme={rotation.period === "Mardi-Jeudi" ? "blue" : "purple"}
              variant="subtle"
              fontSize="2xs"
            >
              {t(`periodsShort.${rotation.period}`, rotation.period)}
            </Badge>
            {rotation.start_date && (
              <Text color="whiteAlpha.500" fontFamily="mono" fontSize="2xs">
                {rotation.start_date}
              </Text>
            )}
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

const ExistingCyclesList = ({
  cycles,
  isLoading,
  onRefresh,
  onDownloadEvents,
  onDownloadCycleEvents,
  onDeleteCycle,
  onEditCycle,
}: ExistingCyclesListProps) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cycleToDelete, setCycleToDelete] = useState<ICycle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedCycles, setExpandedCycles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const cardBg = "bg.card";
  const cardBorder = useColorModeValue("gray.200", "whiteAlpha.100");
  const headerGradient = useColorModeValue(
    "linear(to-r, blue.500, purple.500)",
    "linear(to-r, blue.400, purple.500)"
  );
  const statBg = useColorModeValue("gray.50", "transparent");

  // Computed stats
  const totalRotations = useMemo(
    () =>
      Array.isArray(cycles)
        ? cycles.reduce((acc, c) => acc + (c.rotations?.length || 0), 0)
        : 0,
    [cycles]
  );

  // Filtered cycles
  const filteredCycles = useMemo(() => {
    if (!Array.isArray(cycles)) return [];
    if (!searchQuery.trim()) return cycles;
    const q = searchQuery.toLowerCase();
    return cycles.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.rotations?.some((r) => r.killer.toLowerCase().includes(q))
    );
  }, [cycles, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedCycles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteClick = (cycle: ICycle) => {
    setCycleToDelete(cycle);
    onOpen();
  };

  const handleConfirmDelete = async () => {
    if (!cycleToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteCycle(cycleToDelete._id || "");
      toast({
        title: "Cycle supprimé",
        description: `Le cycle "${cycleToDelete.name}" a été supprimé avec succès`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setCycleToDelete(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de supprimer le cycle",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Get date range string for a cycle
  const getCycleDateRange = (cycle: ICycle): string | null => {
    if (!cycle.rotations || cycle.rotations.length === 0) return null;
    const first = cycle.rotations[0]?.start_date;
    const last = cycle.rotations[cycle.rotations.length - 1]?.end_date;
    if (!first || !last) return null;
    return `${first} → ${last}`;
  };

  return (
    <VStack spacing={5} align="stretch">
      {/* Stats Bar */}
      {Array.isArray(cycles) && cycles.length > 0 && (
        <StatGroup
          bg={statBg}
          borderRadius="xl"
          p={4}
          border="1px solid"
          borderColor={cardBorder}
        >
          <Stat textAlign="center">
            <StatLabel fontSize="xs" color="gray.500">
              Cycles
            </StatLabel>
            <StatNumber fontSize="2xl" bgGradient={headerGradient} bgClip="text">
              {cycles.length}
            </StatNumber>
          </Stat>
          <Stat textAlign="center">
            <StatLabel fontSize="xs" color="gray.500">
              Rotations totales
            </StatLabel>
            <StatNumber fontSize="2xl" bgGradient={headerGradient} bgClip="text">
              {totalRotations}
            </StatNumber>
          </Stat>
          <Stat textAlign="center">
            <StatLabel fontSize="xs" color="gray.500">
              Moyenne / cycle
            </StatLabel>
            <StatNumber fontSize="2xl" bgGradient={headerGradient} bgClip="text">
              {cycles.length > 0
                ? Math.round(totalRotations / cycles.length)
                : 0}
            </StatNumber>
          </Stat>
        </StatGroup>
      )}

      {/* Toolbar */}
      <HStack spacing={3}>
        <InputGroup size="sm" maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" boxSize={3} />
          </InputLeftElement>
          <Input
            placeholder="Rechercher un cycle ou killer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderRadius="lg"
            bg={statBg}
            border="1px solid"
            borderColor={cardBorder}
            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
          />
        </InputGroup>

        <Box flex={1} />

        <Tooltip label="Exporter tous les cycles (JSON)" hasArrow>
          <Button
            size="sm"
            leftIcon={<DownloadIcon />}
            colorScheme="green"
            variant="outline"
            borderRadius="lg"
            onClick={onDownloadEvents}
            isDisabled={!Array.isArray(cycles) || cycles.length === 0}
          >
            Tout exporter
          </Button>
        </Tooltip>

        <Tooltip label="Actualiser" hasArrow>
          <IconButton
            size="sm"
            aria-label="Actualiser"
            icon={<RepeatIcon />}
            variant="ghost"
            borderRadius="lg"
            onClick={onRefresh}
            isLoading={isLoading}
          />
        </Tooltip>
      </HStack>

      {/* Content */}
      {isLoading ? (
        <PageLoader label={t("pages.cycles.loading")} color="blue.400" height="250px" />
      ) : !Array.isArray(cycles) || cycles.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={16}
          gap={3}
          borderRadius="xl"
          border="2px dashed"
          borderColor={cardBorder}
        >
          <Text fontSize="4xl">📋</Text>
          <Text fontWeight="semibold" fontSize="lg">
            Aucun cycle créé
          </Text>
          <Text color="gray.500" fontSize="sm">
            Créez votre premier cycle avec le bouton ci-dessus
          </Text>
        </Flex>
      ) : filteredCycles.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={12}
          gap={2}
          borderRadius="xl"
          border="2px dashed"
          borderColor={cardBorder}
        >
          <Text fontSize="3xl">🔍</Text>
          <Text color="gray.500" fontSize="sm">
            Aucun résultat pour "{searchQuery}"
          </Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} alignItems="start">
          {filteredCycles.map((cycle) => {
            const isExpanded = expandedCycles.has(cycle._id || "");
            const dateRange = getCycleDateRange(cycle);

            return (
              <Box
                key={cycle._id}
                bg={cardBg}
                borderRadius="xl"
                border="1px solid"
                borderColor={cardBorder}
                overflow="hidden"
                transition="all 0.2s"
                _hover={{
                  borderColor: "blue.400",
                  shadow: "0 0 20px rgba(66, 153, 225, 0.15)",
                  transform: "translateY(-1px)",
                }}
              >
                {/* Card Header with gradient accent */}
                <Box
                  bgGradient={headerGradient}
                  h="3px"
                />

                <VStack spacing={3} p={4} align="stretch">
                  {/* Title row */}
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={0} flex={1}>
                      <HStack spacing={2} align="center">
                        <Text
                          as={Link}
                          to={`/cycle/${cycleSlug(cycle.name, cycle.year)}`}
                          fontWeight="bold"
                          fontSize="lg"
                          _hover={{ color: "blue.400" }}
                          transition="color 0.15s"
                          noOfLines={1}
                        >
                          {cycle.name} - {cycle.year}
                        </Text>
                        <Tooltip label="Voir le détail" hasArrow>
                          <Box as={Link} to={`/cycle/${cycleSlug(cycle.name, cycle.year)}`} color="gray.500" _hover={{ color: "blue.400" }}>
                            <ExternalLinkIcon boxSize={3} />
                          </Box>
                        </Tooltip>
                      </HStack>
                      {dateRange && (
                        <Text fontSize="xs" color="gray.500" fontFamily="mono">
                          {dateRange}
                        </Text>
                      )}
                    </VStack>

                    <HStack spacing={1}>
                      <Badge
                        colorScheme="blue"
                        variant="subtle"
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {cycle.rotations?.length || 0} rot.
                      </Badge>
                    </HStack>
                  </HStack>

                  {/* Timeline bar */}
                  <RotationTimeline rotations={cycle.rotations} />

                  {/* Period legend */}
                  <HStack spacing={4} fontSize="2xs" color="gray.500">
                    <HStack spacing={1}>
                      <Box w="8px" h="8px" borderRadius="full" bg="blue.400" />
                      <Text>Mar-Jeu</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Box w="8px" h="8px" borderRadius="full" bg="purple.400" />
                      <Text>Ven-Dim</Text>
                    </HStack>
                  </HStack>

                  {/* Expandable details */}
                  {isExpanded && (
                    <Box
                      mt={1}
                      borderRadius="lg"
                      bg={statBg}
                      border="1px solid"
                      borderColor={cardBorder}
                      overflow="hidden"
                      animation="fadeIn 0.2s ease-in-out"
                      sx={{
                        "@keyframes fadeIn": {
                          from: { opacity: 0, maxHeight: 0 },
                          to: { opacity: 1, maxHeight: "280px" },
                        },
                      }}
                    >
                      <RotationDetails rotations={cycle.rotations} />
                    </Box>
                  )}

                  {/* Action bar */}
                  <HStack
                    spacing={1}
                    pt={1}
                    borderTop="1px solid"
                    borderColor={cardBorder}
                  >
                    <Tooltip label={isExpanded ? "Masquer les rotations" : "Voir les rotations"} hasArrow>
                      <Button
                        size="xs"
                        variant="ghost"
                        borderRadius="lg"
                        leftIcon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        onClick={() => toggleExpand(cycle._id || "")}
                        color="gray.500"
                        _hover={{ color: "blue.400", bg: "whiteAlpha.100" }}
                      >
                        {isExpanded ? "Masquer" : "Détails"}
                      </Button>
                    </Tooltip>

                    <Box flex={1} />

                    <Tooltip label={`Exporter ${cycle.name}`} hasArrow>
                      <IconButton
                        size="xs"
                        aria-label="Exporter"
                        icon={<DownloadIcon />}
                        variant="ghost"
                        borderRadius="lg"
                        color="gray.500"
                        _hover={{ color: "green.400", bg: "whiteAlpha.100" }}
                        onClick={() => onDownloadCycleEvents(cycle)}
                        isDisabled={!cycle.rotations || cycle.rotations.length === 0}
                      />
                    </Tooltip>

                    <PublishCycleRecapButton cycle={cycle} />

                    <Tooltip label="Modifier ce cycle" hasArrow>
                      <IconButton
                        size="xs"
                        aria-label="Modifier"
                        icon={<EditIcon />}
                        variant="ghost"
                        borderRadius="lg"
                        color="gray.500"
                        _hover={{ color: "blue.400", bg: "whiteAlpha.100" }}
                        onClick={() => onEditCycle(cycle)}
                      />
                    </Tooltip>

                    <Tooltip label="Supprimer ce cycle" hasArrow>
                      <IconButton
                        size="xs"
                        aria-label="Supprimer"
                        icon={<DeleteIcon />}
                        variant="ghost"
                        borderRadius="lg"
                        color="gray.500"
                        _hover={{ color: "red.400", bg: "whiteAlpha.100" }}
                        onClick={() => handleDeleteClick(cycle)}
                      />
                    </Tooltip>
                  </HStack>
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Supprimer le cycle
            </AlertDialogHeader>

            <AlertDialogBody>
              Êtes-vous sûr de vouloir supprimer le cycle{" "}
              <strong>"{cycleToDelete?.name}"</strong> ?
              <br />
              <br />
              Cette action est <strong>irréversible</strong> et supprimera
              également :
              <br />
              • Toutes les rotations du cycle (
              {cycleToDelete?.rotations?.length || 0} rotations)
              <br />• Tous les scores associés à ce cycle
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                isDisabled={isDeleting}
                borderRadius="lg"
              >
                Annuler
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                ml={3}
                isLoading={isDeleting}
                loadingText="Suppression..."
                borderRadius="lg"
              >
                Supprimer définitivement
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export { ExistingCyclesList };