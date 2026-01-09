import {
  Card,
  CardBody,
  VStack,
  Text,
  Input,
  Button,
  HStack,
  useColorModeValue
} from "@chakra-ui/react";

interface CycleCreationFormProps {
  cycleName: string;
  onCycleNameChange: (name: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  selectedRotationsCount: number;
}

export const CycleCreationForm = ({ 
  cycleName, 
  onCycleNameChange, 
  onSubmit, 
  isSubmitting,
  selectedRotationsCount
}: CycleCreationFormProps) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const canSubmit = cycleName.trim() && selectedRotationsCount === 20;

  return (
    <Card bg={cardBg} borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold">
            Créer un nouveau cycle
          </Text>
          
          <VStack spacing={3} align="stretch">
            <VStack spacing={2} align="stretch">
              <Text fontSize="sm" fontWeight="medium">Nom du cycle</Text>
              <Input
                placeholder="Entrez le nom du cycle..."
                value={cycleName}
                onChange={(e) => onCycleNameChange(e.target.value)}
                isDisabled={isSubmitting}
              />
            </VStack>

            <HStack justify="space-between" align="center">
              <Text fontSize="sm" color="gray.500">
                {selectedRotationsCount === 20 
                  ? "✅ Toutes les rotations sont configurées" 
                  : `⚠️ ${20 - selectedRotationsCount} rotation(s) manquante(s)`
                }
              </Text>
              
              <Button
                colorScheme="blue"
                onClick={onSubmit}
                isLoading={isSubmitting}
                loadingText="Création..."
                isDisabled={!canSubmit}
                size="sm"
              >
                Créer le cycle
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}