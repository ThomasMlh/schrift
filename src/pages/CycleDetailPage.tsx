import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Icon,
  Divider,
} from "@chakra-ui/react";
import { ArrowBackIcon, CalendarIcon } from "@chakra-ui/icons";
import { FiActivity } from "react-icons/fi";

import { handleAttackType } from "../utils/attackTypes";
import { AlterationImage } from "../components/ui/AlterationImage";
import CustomLink from "@/components/ui/CustomLink";
import { useCycle } from "@/hooks/useAPI";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "react-i18next";

const CycleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Utiliser useSWR pour le cycle (cache automatique)
  const { cycle, isLoading, error: fetchError } = useCycle(id);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const headerBg = useColorModeValue(
    "linear(to-r, blue.500, purple.600)",
    "linear(to-r, blue.600, purple.700)"
  );
  const infoBg = useColorModeValue("gray.50", "gray.900");
  const rotationHoverBg = useColorModeValue("blue.50", "gray.700");
  const shadowColor = useColorModeValue("md", "dark-lg");

  useEffect(() => {
    if (fetchError) {
      setError(t("pages.cycleDetail.errorLoading"));
    }
    if (!id) {
      setError(t("pages.cycleDetail.errorMissingId"));
    }
  }, [fetchError, id]);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="lg" />
        </Flex>
      </Container>
    );
  }

  if (error || !cycle) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Alert status="error">
            <AlertIcon />
            {error || t("pages.cycleDetail.errorNotFound")}
          </Alert>
          <Button
            leftIcon={<ArrowBackIcon />}
            onClick={() => navigate("/cycles")}
          >
            {t("pages.cycleDetail.backToCycles")}
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <>
      <SEOHead
        title={`Cycle ${id} - Schrift BBS`}
        description={`Détails du cycle ${id} de la Guilde War Schrift`}
        noIndex={true}
      />
      <Box minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header avec bouton retour */}
          <HStack justify="space-between" align="center">
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => navigate("/cycles")}
              size="lg"
              _hover={{ bg: rotationHoverBg, transform: "translateX(-4px)" }}
              transition="all 0.2s"
            >
              {t("pages.cycleDetail.backToCycles")}
            </Button>
            <Badge
              colorScheme="blue"
              fontSize="lg"
              px={4}
              py={2}
              borderRadius="full"
              boxShadow="sm"
            >
              <Icon as={FiActivity} mr={2} />
              {cycle.rotations?.length || 0} rotations
            </Badge>
          </HStack>

          {/* Titre du cycle - Hero Section */}
          <Box
            bgGradient={headerBg}
            borderRadius="2xl"
            p={8}
            textAlign="center"
            color="white"
            boxShadow="2xl"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgGradient: "linear(to-br, transparent, blackAlpha.300)",
              zIndex: 0,
            }}
          >
            <VStack spacing={3} position="relative" zIndex={1}>
              <Heading size="2xl" fontWeight="extrabold" letterSpacing="tight">
                {cycle.name} - {cycle.year}
              </Heading>
              <Text fontSize="lg" opacity={0.9} fontWeight="medium">
                {t("pages.cycleDetail.subtitle")}
              </Text>
            </VStack>
          </Box>

        {/* Informations générales */}
        {cycle.rotations && cycle.rotations.length > 0 && (
          <Card
            bg={cardBg}
            borderColor={borderColor}
            borderRadius="xl"
            boxShadow={shadowColor}
            border="none"
          >
            <CardBody p={6}>
              <VStack spacing={6} align="stretch">
                <Heading size="md" fontWeight="bold" color="blue.500">
                  {t("pages.cycleDetail.infoHeading")}
                </Heading>
                <Divider />
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <Box
                    bg={infoBg}
                    p={5}
                    borderRadius="lg"
                    transition="all 0.3s"
                    _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
                  >
                    <HStack spacing={2} mb={3}>
                      <CalendarIcon color="green.500" boxSize={5} />
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={textSecondary}
                        textTransform="uppercase"
                        letterSpacing="wide"
                      >
                        {t("pages.cycleDetail.labelStartDate")}
                      </Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="bold" color="green.500">
                      {cycle.rotations[0].start_date || t("pages.cycleDetail.notDefined")}
                    </Text>
                  </Box>
                  <Box
                    bg={infoBg}
                    p={5}
                    borderRadius="lg"
                    transition="all 0.3s"
                    _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
                  >
                    <HStack spacing={2} mb={3}>
                      <CalendarIcon color="red.500" boxSize={5} />
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={textSecondary}
                        textTransform="uppercase"
                        letterSpacing="wide"
                      >
                        {t("pages.cycleDetail.labelEndDate")}
                      </Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="bold" color="red.500">
                      {cycle.rotations[cycle.rotations.length - 1].end_date ||
                        t("pages.cycleDetail.notDefined")}
                    </Text>
                  </Box>
                  <Box
                    bg={infoBg}
                    p={5}
                    borderRadius="lg"
                    transition="all 0.3s"
                    _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
                  >
                    <HStack spacing={2} mb={3}>
                      <Icon as={FiActivity} color="purple.500" boxSize={5} />
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={textSecondary}
                        textTransform="uppercase"
                        letterSpacing="wide"
                      >
                        {t("pages.cycleDetail.labelRotations")}
                      </Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="bold" color="purple.500">
                      {cycle.rotations.length}
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Liste détaillée des rotations */}
        {cycle.rotations && cycle.rotations.length > 0 && (
          <Box>
            <VStack spacing={4} align="stretch" mb={6}>
              <Heading size="md" fontWeight="bold" color="purple.500">
                {t("pages.cycleDetail.rotationsHeading")}
              </Heading>
              <Alert
                status="info"
                variant="left-accent"
                borderRadius="lg"
                bg={infoBg}
                boxShadow="sm"
              >
                <AlertIcon />
                <Text fontSize="sm" fontWeight="medium">
                  {t("pages.cycleDetail.rotationsClickTip")}
                </Text>
              </Alert>
            </VStack>
            
            <VStack spacing={4} align="stretch">
              {cycle.rotations.map((rotation, index) => (
                <Box
                  key={index}
                  bg={cardBg}
                  borderRadius="xl"
                  boxShadow={shadowColor}
                  border="2px solid"
                  borderColor={borderColor}
                  transition="all 0.3s"
                  _hover={{
                    transform: "translateX(8px)",
                    boxShadow: "2xl",
                    borderColor: "purple.400",
                    bg: rotationHoverBg,
                          _before: {
                      width: "12px",
                    },
                  }}
                  cursor="pointer"
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "6px",
                    bgGradient: "linear(to-b, purple.400, blue.500)",
                    transition: "width 0.3s",
                  }}
                >
                  <Box p={6} pl={8}>
                    <Flex
                      direction={{ base: "column", lg: "row" }}
                      gap={6}
                      align={{ base: "stretch", lg: "center" }}
                    >
                      {/* Section principale - Titre et période */}
                      <Box flex="0 0 auto" minW={{ lg: "200px" }}>
                        <VStack align="start" spacing={2}>
                          <CustomLink
                            to={`/cycle/${id}/rotation/${rotation.position}`}
                            text={`Rotation #${rotation.position}`}
                          />
                          <Badge
                            colorScheme="purple"
                            fontSize="sm"
                            px={4}
                            py={1}
                            borderRadius="full"
                            fontWeight="bold"
                          >
                            {t(`periods.${rotation.period}`, rotation.period)}
                          </Badge>
                        </VStack>
                      </Box>

                      {/* Divider horizontal pour mobile */}
                      <Divider display={{ base: "block", lg: "none" }} />
                      
                      {/* Divider vertical pour desktop */}
                      <Divider
                        orientation="vertical"
                        h="80px"
                        display={{ base: "none", lg: "block" }}
                      />

                      {/* Infos de la rotation */}
                      <Flex
                        flex={1}
                        gap={4}
                        wrap="wrap"
                        align="center"
                        justify="space-between"
                      >
                        {/* Killer */}
                        <Box
                          bg={infoBg}
                          px={4}
                          py={2}
                          borderRadius="lg"
                          minW="150px"
                        >
                          <Text
                            fontSize="xs"
                            color={textSecondary}
                            mb={1}
                            fontWeight="semibold"
                            textTransform="uppercase"
                            letterSpacing="wide"
                          >
                            {t("pages.cycleDetail.fieldKiller")}
                          </Text>
                          <Text fontSize="md" fontWeight="bold" color="green.500">
                            {rotation.killer}
                          </Text>
                        </Box>

                        {/* Type d'attaque */}
                        <Box
                          bg={infoBg}
                          px={4}
                          py={2}
                          borderRadius="lg"
                          minW="150px"
                        >
                          <Text
                            fontSize="xs"
                            color={textSecondary}
                            mb={1}
                            fontWeight="semibold"
                            textTransform="uppercase"
                            letterSpacing="wide"
                          >
                            {t("pages.cycleDetail.fieldAttack")}
                          </Text>
                          <Badge
                            colorScheme={
                              rotation.attack === "R"
                                ? "red"
                                : rotation.attack === "B"
                                ? "blue"
                                : "orange"
                            }
                            fontSize="sm"
                            fontWeight="bold"
                            px={3}
                            py={1}
                            borderRadius="md"
                          >
                            {t(`attackTypes.${rotation.attack}`, handleAttackType(rotation))}
                          </Badge>
                        </Box>

                        {/* Altération */}
                        <Box
                          bg={infoBg}
                          px={4}
                          py={2}
                          borderRadius="lg"
                          minW="150px"
                        >
                          <Text
                            fontSize="xs"
                            color={textSecondary}
                            mb={1}
                            fontWeight="semibold"
                            textTransform="uppercase"
                            letterSpacing="wide"
                          >
                            {t("pages.cycleDetail.fieldAlteration")}
                          </Text>
                          <AlterationImage
                            alteration={rotation.alteration}
                            size="28px"
                            showLabel={true}
                          />
                        </Box>

                        {/* Dates */}
                        <Box
                          bg={infoBg}
                          px={4}
                          py={2}
                          borderRadius="lg"
                          minW="200px"
                        >
                          <VStack spacing={1} align="start">
                            <HStack spacing={2}>
                              <CalendarIcon color="green.500" boxSize={3} />
                              <Text fontSize="xs" color={textSecondary} fontWeight="medium">
                                {rotation.start_date || t("pages.cycleDetail.notDefined")}
                              </Text>
                            </HStack>
                            <HStack spacing={2}>
                              <CalendarIcon color="red.500" boxSize={3} />
                              <Text fontSize="xs" color={textSecondary} fontWeight="medium">
                                {rotation.end_date || t("pages.cycleDetail.notDefined")}
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>
                      </Flex>
                    </Flex>
                  </Box>
                </Box>
              ))}
            </VStack>
          </Box>
        )}
        </VStack>
      </Container>
    </Box>
    </>
  );
};

export default CycleDetailPage;
