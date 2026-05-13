import {
  Container,
  VStack,
  Box,
  Flex,
  HStack,
  useColorModeValue,
  Image,
  Text,
  Icon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiUsers, FiGrid, FiChevronRight } from "react-icons/fi";
import { SEOHead } from "../components/SEOHead";
import { HeroSection } from "../components/HeroSection";
import { GuildOrgChart } from "../components/GuildOrgChart";
import { useGuilds, useAllGuildsMemberCounts } from "@/hooks/useAPI";
import type { IGuild } from "../interfaces";
import { useTranslation } from "react-i18next";

const GuildesPage = () => {
  const { guilds } = useGuilds(true);
  const [selectedGuild, setSelectedGuild] = useState<IGuild | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const bucketUrl = import.meta.env.VITE_BUCKET_URL;
  const { t } = useTranslation();

  const sidebarBg = useColorModeValue("white", "rgba(26, 32, 44, 0.8)");
  const sidebarBorder = useColorModeValue("gray.200", "whiteAlpha.100");
  const panelBg = useColorModeValue("gray.50", "rgba(26, 32, 44, 0.4)");
  const panelHeaderBg = useColorModeValue("white", "rgba(26, 32, 44, 0.8)");
  const itemHoverBg = useColorModeValue("purple.50", "whiteAlpha.50");
  const itemActiveBg = useColorModeValue("purple.50", "rgba(159, 122, 234, 0.12)");
  const countColor = useColorModeValue("gray.500", "whiteAlpha.600");
  const dividerColor = useColorModeValue("gray.100", "whiteAlpha.100");

  useEffect(() => {
    if (guilds.length > 0 && !selectedGuild) {
      setSelectedGuild(guilds[0]);
    }
  }, [guilds, selectedGuild]);

  const { memberCounts: guildMemberCounts, membersByGuild, isLoading } = useAllGuildsMemberCounts(guilds, true);
  const members = selectedGuild ? (membersByGuild[selectedGuild._id] || []) : [];
  const totalMembers = Object.values(guildMemberCounts ?? {}).reduce((acc, n) => acc + n, 0);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Guildes Schrift BBS",
    "description": "Découvrez l'organisation des guildes Schrift pour Bleach Brave Souls",
    "url": "https://bbs-schrift.fr/guildes"
  };

  return (
    <>
      <SEOHead
        title={t("pages.guilds.seoTitle")}
        description={t("pages.guilds.seoDescription")}
        keywords="Bleach Brave Souls, BBS, guildes, Schrift, organisation, membres"
        url="https://bbs-schrift.fr/guildes"
        structuredData={structuredData}
      />

      <Box w="100%">
        <HeroSection
          title={t("pages.guilds.heroTitle")}
          description={t("pages.guilds.heroDescription")}
          badge={{ text: t("pages.guilds.heroBadge"), icon: "⚔️" }}
          size="lg"
        />

        <Container maxW="container.xl" py={8}>
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={5}
            align="stretch"
            minH="600px"
          >
            {/* ── Sidebar ── */}
            <Box
              w={{ base: "100%", md: "240px" }}
              flexShrink={0}
              bg={sidebarBg}
              borderRadius="xl"
              borderWidth={1}
              borderColor={sidebarBorder}
              overflow="hidden"
              boxShadow="sm"
            >
              {/* Stats */}
              <Box px={5} py={4} borderBottomWidth={1} borderColor={dividerColor}>
                <HStack spacing={6}>
                  <VStack align="start" spacing={0}>
                    <HStack spacing={1.5}>
                      <Icon as={FiGrid} boxSize={3} color={countColor} />
                      <Text fontSize="2xs" color={countColor} textTransform="uppercase" letterSpacing="wider" fontWeight="semibold">
                        {t("pages.guilds.statsGuilds")}
                      </Text>
                    </HStack>
                    <Text
                      fontSize="2xl"
                      fontWeight="extrabold"
                      bgGradient="linear(to-r, purple.500, pink.400)"
                      bgClip="text"
                      lineHeight={1.2}
                    >
                      {guilds.length}
                    </Text>
                  </VStack>

                  <VStack align="start" spacing={0}>
                    <HStack spacing={1.5}>
                      <Icon as={FiUsers} boxSize={3} color={countColor} />
                      <Text fontSize="2xs" color={countColor} textTransform="uppercase" letterSpacing="wider" fontWeight="semibold">
                        {t("pages.guilds.statsMembers")}
                      </Text>
                    </HStack>
                    <Text
                      fontSize="2xl"
                      fontWeight="extrabold"
                      bgGradient="linear(to-r, blue.400, purple.500)"
                      bgClip="text"
                      lineHeight={1.2}
                    >
                      {isLoading ? "..." : totalMembers}
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              {/* Guild list — vertical on md+, horizontal scroll on mobile */}
              <Box
                overflowX={{ base: "auto", md: "hidden" }}
                overflowY={{ base: "hidden", md: "auto" }}
              >
                <Flex
                  direction={{ base: "row", md: "column" }}
                  w={{ base: "100%", md: "auto" }}
                  minW={{ base: "max-content", md: "auto" }}
                >
                  {guilds.map((guild) => {
                    const isSelected = selectedGuild?._id === guild._id;
                    return (
                      <Box
                        key={guild._id}
                        as="button"
                        onClick={() => setSelectedGuild(guild)}
                        px={4}
                        py={3}
                        borderBottomWidth={{ base: 0, md: "1px" }}
                        borderRightWidth={{ base: "1px", md: 0 }}
                        borderColor={dividerColor}
                        bg={isSelected ? itemActiveBg : "transparent"}
                        _hover={{ bg: isSelected ? itemActiveBg : itemHoverBg }}
                        transition="background 0.15s"
                        position="relative"
                        textAlign="left"
                        flex={{ base: 1, md: "none" }}
                        minW={{ base: "80px", md: "auto" }}
                        w={{ base: "auto", md: "100%" }}
                      >
                        {/* Active indicator */}
                        {isSelected && (
                          <Box
                            position="absolute"
                            left={{ base: 0, md: 0 }}
                            top={{ base: 0, md: 0 }}
                            bottom={{ base: 0, md: 0 }}
                            right={{ base: 0, md: "auto" }}
                            w={{ base: "100%", md: "3px" }}
                            h={{ base: "3px", md: "100%" }}
                            bgGradient="linear(to-b, purple.400, pink.400)"
                          />
                        )}

                        <HStack spacing={3} justify="space-between">
                          <HStack spacing={3}>
                            <Box w="32px" h="32px" flexShrink={0}>
                              {!imageErrors[guild._id] ? (
                                <Image
                                  src={`${bucketUrl}/guilds/${guild.name}.png`}
                                  alt={guild.name}
                                  w="32px"
                                  h="32px"
                                  objectFit="contain"
                                  onError={() =>
                                    setImageErrors((prev) => ({
                                      ...prev,
                                      [guild._id]: true,
                                    }))
                                  }
                                />
                              ) : (
                                <Flex
                                  w="32px"
                                  h="32px"
                                  align="center"
                                  justify="center"
                                  bgGradient="linear(to-br, purple.500, pink.400)"
                                  borderRadius="md"
                                >
                                  <Text fontSize="xs" color="white" fontWeight="bold">
                                    {guild.name.charAt(0)}
                                  </Text>
                                </Flex>
                              )}
                            </Box>
                            <Text
                              fontSize="sm"
                              fontWeight={isSelected ? "bold" : "medium"}
                              color={isSelected ? "purple.300" : undefined}
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              {guild.name}
                            </Text>
                          </HStack>

                          <Icon
                            as={FiChevronRight}
                            color="purple.400"
                            boxSize={4}
                            opacity={isSelected ? 1 : 0}
                            transition="opacity 0.15s"
                            display={{ base: "none", md: "block" }}
                          />
                        </HStack>
                      </Box>
                    );
                  })}
                </Flex>
              </Box>
            </Box>

            {/* ── Main panel ── */}
            <Box
              flex={1}
              bg={panelBg}
              borderRadius="xl"
              borderWidth={1}
              borderColor={sidebarBorder}
              overflow="hidden"
              boxShadow="sm"
            >
              {/* Panel header */}
              {selectedGuild && (
                <Box
                  px={8}
                  py={4}
                  borderBottomWidth={1}
                  borderColor={dividerColor}
                  bg={panelHeaderBg}
                >
                  <HStack spacing={4}>
                    {!imageErrors[selectedGuild._id] && (
                      <Image
                        src={`${bucketUrl}/guilds/${selectedGuild.name}.png`}
                        alt={selectedGuild.name}
                        h="32px"
                        w="auto"
                        onError={() =>
                          setImageErrors((prev) => ({
                            ...prev,
                            [selectedGuild._id]: true,
                          }))
                        }
                      />
                    )}
                    <VStack align="start" spacing={0}>
                      <Text fontSize="md" fontWeight="bold">
                        Schrift {selectedGuild.name}
                      </Text>
                      <Text fontSize="xs" color={countColor}>
                        {guildMemberCounts?.[selectedGuild._id] || 0}{" "}
                        {t("pages.guilds.memberPlural")}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}

              {/* Org chart */}
              <Box px={4} minH="500px">
                {isLoading ? (
                  <Flex justify="center" align="center" h="400px">
                    <Text fontSize="md" color="gray.500" fontWeight="medium">
                      {t("pages.guilds.loading")}
                    </Text>
                  </Flex>
                ) : (
                  <GuildOrgChart members={members} />
                )}
              </Box>
            </Box>
          </Flex>
        </Container>
      </Box>
    </>
  );
};

export default GuildesPage;
