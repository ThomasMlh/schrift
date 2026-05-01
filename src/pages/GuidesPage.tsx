import {
  Container,
  Box,
  Flex,
  Image,
  Text,
  VStack,
  HStack,
  Badge,
  useColorMode,
  SimpleGrid,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SEOHead } from "../components/SEOHead";
import { HeroSection } from "../components/HeroSection";
import { OrbFarmingGuide, RotationsBuildsGuide } from "../components/guides";
import { useTranslation } from "react-i18next";

interface GuideSection {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  glowColor: string;
}

const GuidesPage = () => {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const SECTIONS: GuideSection[] = [
    {
      id: "rotations-builds",
      icon: <Text fontSize="2xl">⚔️</Text>,
      label: t("pages.guides.tabRotationsBuilds"),
      description: t("pages.guides.tabRotationsBuildsDescription"),
      badge: t("pages.guides.tabRotationsBuildsBadge"),
      badgeColor: "orange",
      accentColor: isDark ? "orange.300" : "orange.500",
      glowColor: "rgba(251, 146, 60, 0.15)",
    },
    {
      id: "orbs",
      icon: <Image src="/orb.png" alt={t("pages.guides.orbIconAlt")} boxSize="28px" />,
      label: t("pages.guides.tabOrbs"),
      description: t("pages.guides.tabOrbsDescription"),
      badge: t("pages.guides.tabOrbsBadge"),
      badgeColor: "purple",
      accentColor: isDark ? "purple.300" : "purple.500",
      glowColor: "rgba(168, 85, 247, 0.15)",
    },
  ];

  const getInitialSection = () => {
    if (section && SECTIONS.find(s => s.id === section)) return section;
    return "rotations-builds";
  };

  const [activeSection, setActiveSection] = useState(getInitialSection());

  useEffect(() => {
    if (section && SECTIONS.find(s => s.id === section)) {
      setActiveSection(section);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    navigate(`/guides/${id}`, { replace: true });
  };

  const activeSectionData = SECTIONS.find(s => s.id === activeSection)!;

  return (
    <>
      <SEOHead
        title={t("pages.guides.seoTitle")}
        description={t("pages.guides.seoDescription")}
        keywords="Bleach Brave Souls, guides, rotations, équipes, farming orbes, tutoriel BBS"
        url="https://bbs-schrift.fr/guides"
      />
      <Flex w="100%" align="center" justify="center" flexDir="column">
        <HeroSection
          title={t("pages.guides.heroTitle")}
          description={t("pages.guides.heroDescription")}
          badge={{ text: t("pages.guides.heroBadge"), icon: "📖" }}
        />

        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={8}>
          <VStack spacing={6} align="stretch">

            {/* Navigation cards */}
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <Box
                    key={sec.id}
                    onClick={() => handleSectionChange(sec.id)}
                    cursor="pointer"
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={isActive
                      ? (isDark ? "whiteAlpha.300" : "gray.300")
                      : (isDark ? "whiteAlpha.100" : "gray.200")
                    }
                    bg={isActive
                      ? (isDark ? `rgba(255,255,255,0.06)` : "white")
                      : (isDark ? "rgba(255,255,255,0.02)" : "gray.50")
                    }
                    boxShadow={isActive ? `0 0 20px ${sec.glowColor}, 0 4px 12px rgba(0,0,0,0.15)` : "none"}
                    transition="all 0.2s ease"
                    _hover={{
                      borderColor: isDark ? "whiteAlpha.300" : "gray.300",
                      boxShadow: `0 0 16px ${sec.glowColor}, 0 2px 8px rgba(0,0,0,0.1)`,
                      transform: "translateY(-2px)",
                    }}
                    p={4}
                    position="relative"
                    overflow="hidden"
                  >
                    {/* Accent bar at top */}
                    {isActive && (
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        h="2px"
                        bgGradient={sec.id === "orbs"
                          ? "linear(90deg, purple.500, purple.300)"
                          : "linear(90deg, orange.500, orange.300)"
                        }
                      />
                    )}
                    <HStack spacing={4} align="center">
                      <Box
                        p={2.5}
                        borderRadius="lg"
                        bg={isActive
                          ? (sec.id === "orbs"
                            ? (isDark ? "purple.900" : "purple.50")
                            : (isDark ? "orange.900" : "orange.50"))
                          : (isDark ? "whiteAlpha.100" : "gray.100")
                        }
                        flexShrink={0}
                      >
                        {sec.icon}
                      </Box>
                      <VStack spacing={0.5} align="start" flex={1}>
                        <HStack spacing={2}>
                          <Text
                            fontWeight="bold"
                            fontSize="sm"
                            color={isActive ? sec.accentColor : (isDark ? "gray.300" : "gray.600")}
                          >
                            {sec.label}
                          </Text>
                          {isActive && (
                            <Badge colorScheme={sec.badgeColor} variant="subtle" fontSize="2xs" borderRadius="full">
                              {sec.badge}
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color={isDark ? "gray.500" : "gray.500"} noOfLines={1}>
                          {sec.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
            </SimpleGrid>

            {/* Section title */}
            <HStack spacing={3} align="center">
              <Box
                h="1px"
                flex={1}
                bg={isDark ? "whiteAlpha.100" : "gray.200"}
              />
              <HStack spacing={2}>
                {activeSectionData.icon}
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  textTransform="uppercase"
                  letterSpacing="widest"
                  color={activeSectionData.accentColor}
                >
                  {activeSectionData.label}
                </Text>
              </HStack>
              <Box
                h="1px"
                flex={1}
                bg={isDark ? "whiteAlpha.100" : "gray.200"}
              />
            </HStack>

            {/* Content */}
            <Box>
              {activeSection === "rotations-builds" && <RotationsBuildsGuide />}
              {activeSection === "orbs" && <OrbFarmingGuide />}
            </Box>

          </VStack>
        </Container>
      </Flex>
    </>
  );
}

export default GuidesPage;