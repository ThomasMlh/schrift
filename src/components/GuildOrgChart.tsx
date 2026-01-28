import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Card,
  CardBody,
  Flex,
  Badge,
  useColorModeValue
} from "@chakra-ui/react";
import type { IUser } from "../interfaces";
import CustomLink from "./ui/CustomLink";

interface GuildOrgChartProps {
  members: IUser[];
}

export const GuildOrgChart: React.FC<GuildOrgChartProps> = ({ members }) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("white", "gray.800");
  const shadowColor = useColorModeValue("md", "dark-lg");

  // Trier les membres par rôle
  const chef = members.find((m) => m.role === "chef");
  const sousChefs = members.filter((m) => m.role === "sous-chef");
  const regularMembers = members.filter((m) => m.role === "membre");

  const MemberCard = ({
    member,
    roleLabel
  }: {
    member: IUser;
    roleLabel: string;
  }) => (
    <Card
      bg={cardBg}
      shadow={shadowColor}
      borderWidth="1px"
      borderColor={borderColor}
      minW="200px"
      maxW="250px"
    >
      <CardBody>
        <VStack spacing={2}>
          <Avatar
            size="lg"
            name={member.global_name || member.username}
            src={
              member.avatar
                ? `https://cdn.discordapp.com/avatars/${member.discord_id}/${member.avatar}.png`
                : undefined
            }
          />
          <CustomLink to={`/joueur/${member._id}`} text={member.global_name || member.username} requireAuth={true} />
          <Badge
            colorScheme={
              roleLabel === "Chef"
                ? "purple"
                : roleLabel === "Sous-Chef"
                  ? "blue"
                  : "gray"
            }
          >
            {roleLabel}
          </Badge>
        </VStack>
      </CardBody>
    </Card>
  );

  return (
    <Flex direction="column" align="center" w="100%" gap={8} py={8}>
      {/* Chef */}
      {chef && (
        <Box>
          <MemberCard member={chef} roleLabel="Chef" />
        </Box>
      )}

      {/* Ligne de connexion vers sous-chefs */}
      {chef && sousChefs.length > 0 && (
        <Box w="2px" h="40px" bg={borderColor} />
      )}

      {/* Sous-chefs */}
      {sousChefs.length > 0 && (
        <HStack spacing={8} justify="center" wrap="wrap">
          {sousChefs.map((sousChef) => (
            <MemberCard
              key={sousChef._id}
              member={sousChef}
              roleLabel="Sous-Chef"
            />
          ))}
        </HStack>
      )}

      {/* Ligne de connexion vers membres */}
      {(chef || sousChefs.length > 0) && regularMembers.length > 0 && (
        <Box w="2px" h="40px" bg={borderColor} />
      )}

      {/* Membres */}
      {regularMembers.length > 0 && (
        <Flex
          direction="row"
          wrap="wrap"
          justify="center"
          gap={4}
          maxW="1200px"
        >
          {regularMembers.map((member) => (
            <MemberCard key={member._id} member={member} roleLabel="Membre" />
          ))}
        </Flex>
      )}

      {/* Message si aucun membre */}
      {members.length === 0 && (
        <Text color="gray.500" fontSize="lg">
          Aucun membre dans cette guilde
        </Text>
      )}
    </Flex>
  );
};
