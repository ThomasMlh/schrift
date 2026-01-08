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
import { SEOHead } from "../components/SEOHead";
import { HeroSection } from "../components/HeroSection";
import { OrbFarmingGuide, RotationsBuildsGuide } from "../components/guides";

export default function GuidesPage() {
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
          <Tabs variant="soft-rounded" colorScheme="purple" isLazy>
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
