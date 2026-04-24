import {
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Image,
  useColorModeValue
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SEOHead } from "../components/SEOHead";
import { HeroSection } from "../components/HeroSection";
import { OrbFarmingGuide, RotationsBuildsGuide } from "../components/guides";
import { useTranslation } from "react-i18next";

const GuidesPage = () => {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  
  // Mapper les sections aux index des tabs
  const sectionToIndex: { [key: string]: number } = {
    "rotations-builds": 0,
    "orbs": 1,
  };
  
  const indexToSection: { [key: number]: string } = {
    0: "rotations-builds",
    1: "orbs",
  };
  
  // Déterminer l'index initial basé sur l'URL
  const getInitialIndex = () => {
    if (section && sectionToIndex[section] !== undefined) {
      return sectionToIndex[section];
    }
    return 0; // Par défaut, rotations-builds
  };
  
  const [tabIndex, setTabIndex] = useState(getInitialIndex());
  const { t } = useTranslation();
  
  // Mettre à jour l'index quand l'URL change
  useEffect(() => {
    if (section && sectionToIndex[section] !== undefined) {
      setTabIndex(sectionToIndex[section]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);
  
  // Gérer le changement de tab
  const handleTabChange = (index: number) => {
    setTabIndex(index);
    const newSection = indexToSection[index];
    navigate(`/guides/${newSection}`, { replace: true });
  };
  
  const menuTextColor = useColorModeValue("gray.700", "whiteAlpha.800");
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
        />

        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={8}>
          <Tabs variant="soft-rounded" colorScheme="purple" isLazy index={tabIndex} onChange={handleTabChange}>
            <TabList
              mb={4}
              p={2}
              gap={2}
              overflowX="auto"
              overflowY="hidden"
              flexWrap="nowrap"
            >
              <Tab whiteSpace="nowrap" color={menuTextColor} _selected={{ color: "white", bg: "purple.500" }}>
                <Flex align="center" gap={2} >
                  {t("pages.guides.tabRotationsBuilds")}
                </Flex>
              </Tab>
              <Tab whiteSpace="nowrap" gap={2} color={menuTextColor} _selected={{ color: "white", bg: "purple.500" }}>
                <Image
                  src="/orb.png"
                  alt={t("pages.guides.orbIconAlt")}
                  boxSize="15px"
                  zIndex={1}
                />
                {t("pages.guides.tabOrbs")}
              </Tab>
            </TabList>

            <TabPanels>
              {/* Guide Rotations & Builds */}
              <TabPanel>
                <RotationsBuildsGuide />
              </TabPanel>

              {/* Guide Farm d'Orbes */}
              <TabPanel>
                <OrbFarmingGuide />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Flex>
    </>
  );
}

export default GuidesPage;