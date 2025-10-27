import {
  Box, Container, VStack, Text, Alert, AlertIcon
} from "@chakra-ui/react";

export function CyclesSection() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Gestion des Cycles
          </Text>
          <Alert status="info">
            <AlertIcon />
            Cette section est en cours de développement. 
            Les fonctionnalités de gestion des cycles seront bientôt disponibles.
          </Alert>
        </Box>
        
        {/* Placeholder pour le futur contenu */}
        <Box 
          p={8} 
          border="2px dashed" 
          borderColor="gray.300" 
          borderRadius="md" 
          textAlign="center"
          bg="gray.50"
          _dark={{ bg: "gray.700", borderColor: "gray.600" }}
        >
          <Text color="gray.500" fontSize="lg">
            Fonctionnalités à venir :
          </Text>
          <VStack mt={4} spacing={2}>
            <Text color="gray.600" _dark={{ color: "gray.400" }}>
              • Création et gestion des cycles de jeu
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}