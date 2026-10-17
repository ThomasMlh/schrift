import {
  Container,
  Box,
  VStack,
  Image,
  Icon,
  Tabs,
  TabList,
  Tab,
} from "@chakra-ui/react";
import { FiLayers, FiStar } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SEOHead } from "../components/SEOHead";
import { HeroSection } from "../components/HeroSection";
import { OrbFarmingGuide, RotationsBuildsGuide, AbilitySlotsGuide } from "../components/guides";
import { useTranslation } from "react-i18next";

const SECTION_IDS = ["rotations-builds", "orbs", "ability-slots"] as const;
type SectionId = (typeof SECTION_IDS)[number];

const GuidesPage = () => {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();


  const SECTIONS: { id: SectionId; icon: React.ReactElement; label: string }[] = [
    { id: "rotations-builds", icon: <Icon as={FiLayers} />, label: t("pages.guides.tabRotationsBuilds") },
    { id: "orbs", icon: <Image src="/orb.png" alt={t("pages.guides.orbIconAlt")} boxSize="18px" />, label: t("pages.guides.tabOrbs") },
    { id: "ability-slots", icon: <Icon as={FiStar} />, label: t("pages.guides.tabAbilitySlots") },
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
        />

        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={8}>
          <VStack spacing={5} align="stretch">

            {/* Guide navigation (scrolls horizontally on mobile) */}
            <Box overflowX="auto" mx={{ base: -4, md: 0 }} px={{ base: 4, md: 0 }}>
              <Tabs
                index={SECTION_IDS.indexOf(activeSection)}
                onChange={(i) => handleSectionChange(SECTION_IDS[i])}
                variant="soft-rounded"
                colorScheme="purple"
                size="sm"
              >
                <TabList gap={1} w="max-content">
                  {SECTIONS.map((sec) => (
                    <Tab key={sec.id} color="text.secondary" fontWeight="semibold" gap={2} whiteSpace="nowrap">
                      {sec.icon}
                      {sec.label}
                    </Tab>
                  ))}
                </TabList>
              </Tabs>
            </Box>

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
