import {
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Flex,
  Image
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SEOHead } from "../components/SEOHead";
import { HeroSection } from "../components/HeroSection";
import { OrbFarmingGuide, RotationsBuildsGuide } from "../components/guides";

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
  
  // Mettre à jour l'index quand l'URL change
  useEffect(() => {
    if (section && sectionToIndex[section] !== undefined) {
      setTabIndex(sectionToIndex[section]);
    }
  }, [section]);
  
  // Gérer le changement de tab
  const handleTabChange = (index: number) => {
    setTabIndex(index);
    const newSection = indexToSection[index];
    navigate(`/guides/${newSection}`, { replace: true });
  };
  
  return (
    <>
      <SEOHead
        title="Guides - Schrift BBS"
        description="Guides complets pour Bleach Brave Souls : rotations, équipes recommandées, farming d'orbes et plus encore."
        keywords="Bleach Brave Souls, guides, rotations, équipes, farming orbes, tutoriel BBS"
        url="https://bbs-schrift.fr/guides"
      />
      <Flex w="100%" align="center" justify="center" flexDir="column">
        <HeroSection
          title="📚 Guides BBS"
          description="Découvrez nos guides complets pour améliorer votre expérience de jeu"
        />

        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={8}>
          <Tabs variant="soft-rounded" colorScheme="purple" isLazy index={tabIndex} onChange={handleTabChange}>
            <TabList
              mb={4}
              gap={2}
              overflowX="auto"
              overflowY="hidden"
              flexWrap="nowrap"
            >
              <Tab whiteSpace="nowrap">
                <Flex align="center" gap={2}>
                  🔄 Rotations & Builds
                  <Badge colorScheme="orange" fontSize="xs">
                    WIP
                  </Badge>
                </Flex>
              </Tab>
              <Tab whiteSpace="nowrap" gap={2}>
                <Image
                  src="/orb.png"
                  alt="Icône Orbe"
                  boxSize="15px"
                  zIndex={1}
                />
                Farm d'Orbes
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