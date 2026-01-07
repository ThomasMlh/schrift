import {
  Container,
  VStack,
  Heading,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  useColorModeValue,
  Divider,
  Flex,
  Image
} from "@chakra-ui/react";
import { SEOHead } from "../components/SEOHead";
import { HeroSection } from "../components/HeroSection";

export default function GuidesPage() {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("purple.500", "purple.300");

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
                <VStack spacing={6} align="stretch">
                  <Box
                    p={4}
                    bg={useColorModeValue("orange.50", "orange.900")}
                    borderRadius="md"
                    borderWidth="2px"
                    borderColor={useColorModeValue("orange.200", "orange.600")}
                  >
                    <Flex align="center" gap={2} mb={2}>
                      <Badge colorScheme="orange" fontSize="lg">
                        🚧 EN CONSTRUCTION
                      </Badge>
                    </Flex>
                    <Text fontSize="sm">
                      Cette section est en cours de développement. Le contenu
                      sera bientôt disponible avec des guides détaillés sur les
                      rotations Guild Quest et les meilleures compositions
                      d'équipes.
                    </Text>
                  </Box>

                  <Divider my={8} />
                </VStack>
              </TabPanel>

              {/* Guide Farm d'Orbes */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Flex align="center" gap={4}>
                    <Box flex={1}>
                      <Heading size="lg" mb={2} color={accentColor}>
                        Guide du Farm d'Orbes
                      </Heading>
                      <Text
                        fontSize="sm"
                        color={useColorModeValue("gray.600", "gray.400")}
                      >
                        Voici toutes les sources d'orbes mensuelles récurrentes.
                        Le total peut atteindre{" "}
                        <strong>2 854 orbes/mois</strong> sans compter les
                        sources ponctuelles.
                      </Text>
                    </Box>
                  </Flex>

                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {/* QG */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">⚔️ Guild Quest</Heading>
                          <Badge colorScheme="purple" fontSize="md">
                            880
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">
                          40 orbes pour un classement A2 par semaine (50 A1, 80
                          S3, 90 S2, 100 S1), 90 orbes pour un score de 520m
                          obtenu.
                        </Text>
                      </CardBody>
                    </Card>

                    {/* Tour */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">🗼 Tour (Senkaimon)</Heading>
                          <Badge colorScheme="blue" fontSize="md">
                            360
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">
                          90 orbes par tour (en moyenne 4 tours par mois).
                        </Text>
                      </CardBody>
                    </Card>

                    {/* Résurrection */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">🔄 Résurrection</Heading>
                          <Badge colorScheme="green" fontSize="md">
                            225
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">
                          3 résurrections par mois à 75 orbes chacune à
                          condition de les avoir forcément.
                        </Text>
                      </CardBody>
                    </Card>

                    {/* EAP */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">⚡ Epic Raid (EAP)</Heading>
                          <Badge colorScheme="orange" fontSize="md">
                            345
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">
                          2 EAP (50 orbes aux 600k, 5 orbes quête extrême, 9
                          quêtes 2 difficultés 5 orbes par réussite), 35 orbes
                          pour le perso 4★, 5 orbes pour finir les ordres de
                          quête.
                        </Text>
                      </CardBody>
                    </Card>

                    {/* Brave Bonus */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">🎁 Brave Bonus</Heading>
                          <Badge colorScheme="cyan" fontSize="md">
                            200
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">
                          50 orbes tous les 7j si niveau 5 (125 si niveau 10).
                        </Text>
                      </CardBody>
                    </Card>

                    {/* Raid */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">🐉 Raid</Heading>
                          <Badge colorScheme="red" fontSize="md">
                            150
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">
                          1 raid par mois (moyenne entre raid normal).
                        </Text>
                      </CardBody>
                    </Card>

                    {/* Arène */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">🏟️ Arène</Heading>
                          <Badge colorScheme="pink" fontSize="md">
                            175
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">
                          2 arènes par mois : 25 orbes à 400 médailles, 100
                          orbes à 2000 médailles, 25 orbes d'ordre.
                        </Text>
                      </CardBody>
                    </Card>

                    {/* Tâches journalières */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">📅 Tâches journalières</Heading>
                          <Badge colorScheme="teal" fontSize="md">
                            150
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">5 orbes par jour (30j).</Text>
                      </CardBody>
                    </Card>

                    {/* Tâches hebdomadaires */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">📆 Tâches hebdomadaires</Heading>
                          <Badge colorScheme="purple" fontSize="md">
                            20
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">
                          5 orbes par semaine pour voir une pub.
                        </Text>
                      </CardBody>
                    </Card>

                    {/* Connexion */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">🎯 Connexion</Heading>
                          <Badge colorScheme="yellow" fontSize="md">
                            105
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">
                          90 orbes réparties dans le mois, 15 le jour d'Ichigo.
                        </Text>
                      </CardBody>
                    </Card>

                    {/* Brave Battle */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">⚔️ Brave Battle</Heading>
                          <Badge colorScheme="red" fontSize="md">
                            125
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">
                          25 orbes 200 médailles, 100 orbes 1000 médailles
                          chacune.
                        </Text>
                      </CardBody>
                    </Card>

                    {/* Suppression de limite */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">🔓 Suppression de limite</Heading>
                          <Badge colorScheme="green" fontSize="md">
                            50
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">1 quête par mois (25 + 25).</Text>
                      </CardBody>
                    </Card>

                    {/* Histoire secondaire */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">📖 Histoire secondaire</Heading>
                          <Badge colorScheme="blue" fontSize="md">
                            60
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">
                          Valeur moyenne d'une quête de 5 niveaux (5 orbes par
                          réussite), 1 personnage 4★ non obtenu par le passé.
                        </Text>
                      </CardBody>
                    </Card>

                    {/* Orbes pub */}
                    <Card
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={cardBorder}
                      shadow="md"
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">📺 Orbes pub</Heading>
                          <Badge colorScheme="gray" fontSize="md">
                            9
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={2}>
                        <Text fontSize="sm">
                          À condition de drop 3 fois dans le mois les 3 orbes
                          pub (c'est un taux, on est loin de ce taux).
                        </Text>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Total */}
                  <Box
                    mt={6}
                    p={6}
                    bg={useColorModeValue("purple.50", "purple.900")}
                    borderRadius="lg"
                    borderWidth="2px"
                    borderColor={useColorModeValue("purple.200", "purple.600")}
                  >
                    <Flex
                      justify="space-between"
                      align="center"
                      flexWrap="wrap"
                      gap={4}
                    >
                      <Box>
                        <Heading size="md" mb={2}>
                          📊 Total mensuel récurrent
                        </Heading>
                        <Text
                          fontSize="sm"
                          color={useColorModeValue("gray.600", "gray.300")}
                        >
                          Sans compter les sources ponctuelles (nouveaux persos,
                          story, events spéciaux)
                        </Text>
                      </Box>
                      <Badge colorScheme="purple" fontSize="3xl" px={6} py={3}>
                        2 854 orbes
                      </Badge>
                    </Flex>
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Flex>
    </>
  );
}
