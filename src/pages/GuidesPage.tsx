import {
  Container,
  Box,
  VStack,
  ButtonGroup,
  Button,
  Image,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SEOHead } from "../components/SEOHead";
import { HeroSection } from "../components/HeroSection";
import { FiBookOpen } from "react-icons/fi";
import { OrbFarmingGuide, RotationsBuildsGuide, AbilitySlotsGuide } from "../components/guides";
import { useTranslation } from "react-i18next";

const SECTION_IDS = ["rotations-builds", "orbs", "ability-slots"] as const;
type SectionId = (typeof SECTION_IDS)[number];

const GuidesPage = () => {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const bgColor = "bg.card";
  const borderColor = "border.subtle";

  const SECTIONS: { id: SectionId; icon: React.ReactElement; label: string; colorScheme: string }[] = [
    { id: "rotations-builds", icon: <span>⚔️</span>, label: t("pages.guides.tabRotationsBuilds"), colorScheme: "orange" },
    { id: "orbs", icon: <Image src="/orb.png" alt={t("pages.guides.orbIconAlt")} boxSize="18px" />, label: t("pages.guides.tabOrbs"), colorScheme: "purple" },
    { id: "ability-slots", icon: <span>🎯</span>, label: t("pages.guides.tabAbilitySlots"), colorScheme: "purple" },
  ];

  const getInitialSection = (): SectionId => {
    if (section && (SECTION_IDS as readonly string[]).includes(section)) return section as SectionId;
    return "rotations-builds";
  };

  const [activeSection, setActiveSection] = useState<SectionId>(getInitialSection);

  useEffect(() => {
    if (section && (SECTION_IDS as readonly string[]).includes(section)) {
      setActiveSection(section as SectionId);
    }
  }, [section]);

  const handleSectionChange = (id: SectionId) => {
    setActiveSection(id);
    navigate(`/guides/${id}`, { replace: true });
  };

  return (
    <>
      <SEOHead
        title={t("pages.guides.seoTitle")}
        description={t("pages.guides.seoDescription")}
        keywords="Bleach Brave Souls, guides, rotations, équipes, farming orbes, tutoriel BBS"
        url="https://bbs-schrift.fr/guides"
      />

      <Box w="100%">
        <HeroSection
          title={t("pages.guides.heroTitle")}
          description={t("pages.guides.heroDescription")}
          badge={{ text: t("pages.guides.heroBadge"), icon: FiBookOpen }}
        />

        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={8}>
          <VStack spacing={5} align="stretch">

            {/* Navigation toolbar */}
            <Box bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={3}>
              <ButtonGroup size="sm" spacing={2} isAttached display={{ base: "flex", md: "inline-flex" }} flexDir={{base: "column", md: "row"}}>
                {SECTIONS.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <Button
                      key={sec.id}
                      variant={isActive ? "solid" : "outline"}
                      colorScheme={isActive ? sec.colorScheme : "gray"}
                      leftIcon={sec.icon}
                      onClick={() => handleSectionChange(sec.id)}
                      borderRadius={{ base: "none", md: "md" }}
                    >
                      {sec.label}
                    </Button>
                  );
                })}
              </ButtonGroup>
            </Box>

            {/* Content */}
            {activeSection === "rotations-builds" && <RotationsBuildsGuide />}
            {activeSection === "orbs" && <OrbFarmingGuide />}
            {activeSection === "ability-slots" && <AbilitySlotsGuide />}

          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default GuidesPage;
