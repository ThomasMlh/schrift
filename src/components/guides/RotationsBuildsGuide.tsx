import {
  VStack,
  Box,
  Text,
  Badge,
  useColorModeValue,
  Flex,
  Divider,
} from "@chakra-ui/react";

const RotationsBuildsGuide = () => {
  return (
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
          Cette section est en cours de développement. Le contenu sera bientôt
          disponible avec des guides détaillés sur les rotations Guild Quest et
          les meilleures compositions d'équipes.
        </Text>
      </Box>

      <Divider my={8} />
    </VStack>
  );
}

export { RotationsBuildsGuide };