'use client';
import {
  Container,
  Box,
  VStack,
  ButtonGroup,
  Button,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SEOHead } from "../components/SEOHead";
import { HeroSection } from "../components/HeroSection";
import { OrbFarmingGuide, RotationsBuildsGuide } from "../components/guides";
import { useTranslation } from "react-i18next";

const SECTION_IDS = ["rotations-builds", "orbs"] as const;
type SectionId = (typeof SECTION_IDS)[number];

const GuidesPage = () => {
  const params = useParams();
  const section = params?.section as string | undefined;
  const router = useRouter();
  const { t } = useTranslation();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const SECTIONS: { id: SectionId; icon: React.ReactElement; label: string; colorScheme: string }[] = [
    { id: "rotations-builds", icon: <span>⚔️</span>, label: t("pages.guides.tabRotationsBuilds"), colorScheme: "orange" },
    { id: "orbs", icon: <Image src="/orb.png" alt={t("pages.guides.orbIconAlt")} boxSize="18px" />, label: t("pages.guides.tabOrbs"), colorScheme: "purple" },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const handleSectionChange = (id: SectionId) => {
    setActiveSection(id);
    router.replace(`/guides/${id}`);
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
          badge={{ text: t("pages.guides.heroBadge"), icon: "📖" }}
        />

        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={8}>
          <VStack spacing={5} align="stretch">

            {/* Navigation toolbar */}
            <Box bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={3}>
              <ButtonGroup size="sm" isAttached>
                {SECTIONS.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <Button
                      key={sec.id}
                      variant={isActive ? "solid" : "outline"}
                      colorScheme={isActive ? sec.colorScheme : "gray"}
                      leftIcon={sec.icon}
                      onClick={() => handleSectionChange(sec.id)}
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

          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default GuidesPage;
