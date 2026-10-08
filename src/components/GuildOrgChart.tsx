import {
  Box,
  VStack,
  Text,
  Flex,
  useColorModeValue
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { IUser } from "../interfaces";
import { UserDisplay } from "./ui/UserDisplay";

interface GuildOrgChartProps {
  members: IUser[];
}

const roleConfig = {
  Chef: {
    gradient: "linear(to-r, purple.400, pink.400)",
    glow: "purple.400",
    ringGradient: "linear-gradient(135deg, #9F7AEA, #ED64A6)",
    icon: "👑",
  },
  "Sous-Chef": {
    gradient: "linear(to-r, blue.400, cyan.400)",
    glow: "blue.400",
    ringGradient: "linear-gradient(135deg, #4299E1, #0BC5EA)",
    icon: "⭐",
  },
  Membre: {
    gradient: "linear(to-r, whiteAlpha.600, whiteAlpha.800)",
    glow: "whiteAlpha.400",
    ringGradient: "linear-gradient(135deg, #e7eaee, #ffffff)",
    icon: "",
  },
};

export const GuildOrgChart: React.FC<GuildOrgChartProps> = ({ members }) => {
  const cardBg = "bg.glass";
  const cardBorder = "border.faint";
  const connectorColor = useColorModeValue("gray.300", "whiteAlpha.200");
  const subtleText = "text.muted";
  const { t } = useTranslation();

  const chef = members.find((m) => m.role === "chef");
  const sousChefs = members.filter((m) => m.role === "sous-chef");
  const regularMembers = members.filter((m) => m.role === "membre");

  const MemberCard = ({
    member,
    roleLabel,
    isLead = false,
  }: {
    member: IUser;
    roleLabel: "Chef" | "Sous-Chef" | "Membre";
    isLead?: boolean;
  }) => {
    const config = roleConfig[roleLabel];
    return (
      <Box
        position="relative"
        role="group"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{ transform: "translateY(-4px)" }}
      >
        {/* Glow effect behind card */}
        {isLead && (
          <Box
            position="absolute"
            inset="-2px"
            borderRadius="2xl"
            bgGradient={config.gradient}
            opacity={0.15}
            filter="blur(12px)"
            transition="opacity 0.3s"
            _groupHover={{ opacity: 0.3 }}
          />
        )}
        <Box
          bg={cardBg}
          backdropFilter="blur(12px)"
          borderRadius="xl"
          borderWidth="1px"
          borderColor={isLead ? "transparent" : cardBorder}
          p={5}
          minW={isLead ? "180px" : "150px"}
          maxW="280px"
          position="relative"
          overflow="hidden"
          boxShadow={
            isLead
              ? `0 4px 20px -4px var(--chakra-colors-${config.glow.replace(".", "-")})`
              : "0 2px 12px rgba(0, 0, 0, 0.6)"
          }
          _before={
            isLead
              ? {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  borderRadius: "xl",
                  padding: "1px",
                  background: config.ringGradient,
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  pointerEvents: "none",
                }
              : undefined
          }
        >
          <VStack spacing={3}>
            {/* Role icon */}
            {config.icon && (
              <Text fontSize={isLead ? "xl" : "md"} lineHeight={1}>
                {config.icon}
              </Text>
            )}
            <UserDisplay
              user={member}
              direction="column"
              avatarSize={isLead ? "lg" : "md"}
              textSize={isLead ? "md" : "sm"}
            />
            {/* Modern role tag */}
            <Text
              fontSize="2xs"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wider"
              bgGradient={config.gradient}
              bgClip="text"
              whiteSpace="nowrap"
            >
              {roleLabel}
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  };

  const Connector = ({ height = "32px" }: { height?: string }) => (
    <Flex justify="center" w="100%">
      <Box
        w="2px"
        h={height}
        bgGradient={`linear(to-b, ${connectorColor}, transparent)`}
        opacity={0.6}
      />
    </Flex>
  );

  const HorizontalBranch = ({ count }: { count: number }) => {
    if (count <= 1) return <Connector />;
    return (
      <Flex direction="column" align="center" w="100%">
        <Box
          w="2px"
          h="24px"
          bgGradient={`linear(to-b, ${connectorColor}, ${connectorColor})`}
          opacity={0.4}
        />
        <Box
          h="2px"
          w={{ base: `${Math.min(count * 140, 600)}px`, md: `${Math.min(count * 180, 800)}px` }}
          maxW="90%"
          bgGradient={`linear(to-r, transparent, ${connectorColor}, transparent)`}
          opacity={0.4}
        />
      </Flex>
    );
  };

  return (
    <Flex direction="column" align="center" w="100%" gap={2} py={8}>
      {/* Chef */}
      {chef && (
        <MemberCard member={chef} roleLabel="Chef" isLead />
      )}

      {/* Connector to sous-chefs */}
      {chef && sousChefs.length > 0 && (
        <HorizontalBranch count={sousChefs.length} />
      )}

      {/* Sous-chefs */}
      {sousChefs.length > 0 && (
        <Flex gap={{ base: 4, md: 6 }} justify="center" wrap="wrap">
          {sousChefs.map((sc) => (
            <MemberCard key={sc.bbs_id || sc._id} member={sc} roleLabel="Sous-Chef" isLead />
          ))}
        </Flex>
      )}

      {/* Connector to members */}
      {(chef || sousChefs.length > 0) && regularMembers.length > 0 && (
        <Connector height="40px" />
      )}

      {/* Section label for regular members */}
      {regularMembers.length > 0 && (
        <Text
          fontSize="xs"
          fontWeight="semibold"
          textTransform="uppercase"
          letterSpacing="widest"
          color={subtleText}
          mb={2}
        >
          {t("pages.guilds.orgSectionMembers")} · {regularMembers.length}
        </Text>
      )}

      {/* Regular members grid */}
      {regularMembers.length > 0 && (
        <Flex wrap="wrap" justify="center" gap={4} maxW="1100px">
          {regularMembers.map((member) => (
            <MemberCard key={member.bbs_id || member._id} member={member} roleLabel="Membre" />
          ))}
        </Flex>
      )}

      {members.length === 0 && (
        <Text color="gray.500" fontSize="lg">
          {t("pages.guilds.orgNoMembers")}
        </Text>
      )}
    </Flex>
  );
};
