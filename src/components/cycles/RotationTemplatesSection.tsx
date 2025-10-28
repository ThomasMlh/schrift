import {
  Card,
  CardBody,
  VStack,
  Text,
  SimpleGrid,
  Button,
  HStack,
  Badge,
  useColorModeValue,
  useToast
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import type { RotationTemplate } from "../../interfaces";
import { getAttackTypeName } from "../../utils/attackTypes";
import { AlterationImage } from "../ui/AlterationImage";

interface RotationTemplatesSectionProps {
  templates: RotationTemplate[];
  onAddRotation: (template: RotationTemplate) => void;
  selectedRotationsCount: number;
}

export function RotationTemplatesSection({
  templates,
  onAddRotation,
  selectedRotationsCount
}: RotationTemplatesSectionProps) {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  const handleAddRotation = (template: RotationTemplate) => {
    if (selectedRotationsCount >= 20) {
      toast({
        title: "Limite atteinte",
        description: "Un cycle ne peut contenir que 20 rotations maximum",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    onAddRotation(template);
  };

  return (
    <Card bg={cardBg} borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold">
            Templates de rotation disponibles
          </Text>

          {templates.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={4}>
              Aucun template disponible
            </Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {templates.map((template) => (
                <Card key={template._id} variant="outline" size="sm">
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <VStack spacing={1} align="stretch">
                        <HStack>
                          <Text fontSize="xs" color="gray.500">Killer:</Text>
                          <Badge colorScheme="green" size="sm">{template.killer}</Badge>
                        </HStack>
                        <HStack>
                          <Text fontSize="xs" color="gray.500">Attack:</Text>
                          <Badge
                            colorScheme={template.attack === "R" ? "red" : template.attack === "B" ? "blue" : "orange"}
                            size="sm"
                          >
                            {getAttackTypeName(template.attack)}
                          </Badge>
                        </HStack>
                        <HStack>
                          <Text fontSize="xs" color="gray.500">Alteration:</Text>
                          <AlterationImage
                            alteration={template.alteration}
                            size="16px"
                            showLabel={true}
                          />
                        </HStack>
                      </VStack>

                      <Button
                        size="sm"
                        leftIcon={<AddIcon />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => handleAddRotation(template)}
                        isDisabled={selectedRotationsCount >= 20}
                      >
                        Ajouter
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}