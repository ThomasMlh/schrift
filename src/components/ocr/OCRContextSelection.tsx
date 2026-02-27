import {
  Card,
  CardBody,
  VStack,
  FormControl,
  FormLabel,
  Button,
  Text,
  Box,
  useColorModeValue,
  HStack,
  Icon,
  Alert,
  AlertIcon,
  Skeleton
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { CycleSelect } from "../ui/CycleSelect";
import { CustomSelect } from "../ui/CustomSelect";
import type { ICycle, IGuild, ICycleRotation } from "@/interfaces";
import { useScreenshotters } from "@/hooks/useAPI";
import { FiArrowRight } from "react-icons/fi";

interface OCRContextSelectionProps {
  cycles: ICycle[];
  guilds: IGuild[];
  isGuildRestricted: boolean;
  userGuildId?: string;
  onSubmit: (guildId: string, cycleId: string, rotationId: string, screenshotterId: string) => void;
}

export const OCRContextSelection = ({
  cycles,
  guilds,
  isGuildRestricted,
  userGuildId,
  onSubmit
}: OCRContextSelectionProps) => {
  const [selectedGuildId, setSelectedGuildId] = useState(
    isGuildRestricted ? userGuildId || "" : ""
  );
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [selectedRotationId, setSelectedRotationId] = useState("");
  const [selectedScreenshotterId, setSelectedScreenshotterId] = useState("");
  const { screenshotters, isLoading: loadingScreenshotters } = useScreenshotters();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (isGuildRestricted && userGuildId) {
      setSelectedGuildId(userGuildId);
    }
  }, [isGuildRestricted, userGuildId]);

  const selectedCycle = cycles.find((c) => c._id === selectedCycleId);
  const rotations = selectedCycle?.rotations || [];

  const guildOptions = guilds.map((g) => ({
    value: g._id,
    label: g.name
  }));

  const rotationOptions = rotations.map((r: ICycleRotation) => {
    const killerAttack = r.killer && r.attack ? ` - ${r.killer} ${r.attack === "R" ? "🔴" : r.attack === "B" ? "🔵" : r.attack}` : '';

    return {
      value: r.rotation_id || r._id || "",
      label: `Rotation ${r.position}${killerAttack} (du ${r.start_date} au ${r.end_date})`
    };
  });

  const screenshotterOptions = screenshotters.map((s) => ({
    value: s.id,
    label: s.label
  }));

  const canContinue = selectedGuildId && selectedCycleId && selectedRotationId && selectedScreenshotterId;

  const handleSubmit = () => {
    if (canContinue) {
      onSubmit(selectedGuildId, selectedCycleId, selectedRotationId, selectedScreenshotterId);
    }
  };

  const selectedGuildName = guilds.find((g) => g._id === selectedGuildId)?.name;

  return (
    <Card bg={bgColor} borderRadius="xl" boxShadow="lg" borderWidth="1px" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={2}>
              📊 Configuration
            </Text>
            <Text color="gray.500">
              Sélectionnez la guilde, le cycle et la rotation pour commencer
            </Text>
          </Box>

          {isGuildRestricted && userGuildId && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              Vous êtes limité à votre guilde : <strong>{selectedGuildName}</strong>
            </Alert>
          )}

          <FormControl isRequired>
            <FormLabel>Guilde</FormLabel>
            <CustomSelect
              value={selectedGuildId}
              onChange={setSelectedGuildId}
              options={guildOptions}
              placeholder="Sélectionner une guilde"
              isDisabled={isGuildRestricted}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Cycle</FormLabel>
            <CycleSelect
              cycles={cycles}
              value={selectedCycleId}
              onChange={setSelectedCycleId}
              placeholder="Sélectionner un cycle"
            />
          </FormControl>

          <FormControl isRequired isDisabled={!selectedCycleId}>
            <FormLabel>Rotation</FormLabel>
            <CustomSelect
              value={selectedRotationId}
              onChange={setSelectedRotationId}
              options={rotationOptions}
              placeholder="Sélectionner une rotation"
              isDisabled={!selectedCycleId}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Qui a pris les screenshots ?</FormLabel>
            {loadingScreenshotters ? (
              <Skeleton height="40px" borderRadius="md" />
            ) : (
              <CustomSelect
                value={selectedScreenshotterId}
                onChange={setSelectedScreenshotterId}
                options={screenshotterOptions}
                placeholder="Sélectionner la personne"
              />
            )}
          </FormControl>

          <HStack justify="flex-end">
            <Button
              colorScheme="blue"
              size="lg"
              rightIcon={<Icon as={FiArrowRight} />}
              onClick={handleSubmit}
              isDisabled={!canContinue}
            >
              Continuer
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};
