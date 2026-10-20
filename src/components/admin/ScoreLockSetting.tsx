import { useEffect, useState } from "react";
import {
  Box, Button, Flex, HStack, Icon, NumberInput, NumberInputField, Text, useToast,
} from "@chakra-ui/react";
import { FiLock } from "react-icons/fi";
import { useScoreLockSettings } from "@/hooks/useAPI";
import { useSettingsMutations } from "@/hooks/mutations/useSettingsMutations";

// Delay after a cycle ends before leaders/officers can no longer change its scores
export const ScoreLockSetting = () => {
  const toast = useToast();
  const { lockAfterDays } = useScoreLockSettings();
  const { updateScoreLockDays } = useSettingsMutations();
  const [value, setValue] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (lockAfterDays !== undefined) setValue(lockAfterDays);
  }, [lockAfterDays]);

  const save = async () => {
    setIsSaving(true);
    try {
      await updateScoreLockDays(value);
      toast({ title: "Verrouillage des scores mis à jour", status: "success" });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Erreur lors de la mise à jour", status: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
      <Flex justify="space-between" align="center" gap={4} wrap="wrap">
        <HStack spacing={3} align="start" flex="1 1 320px">
          <Icon as={FiLock} boxSize={5} color="purple.400" mt={0.5} />
          <Box>
            <Text fontWeight="semibold" color="text.strong">Verrouillage des scores</Text>
            <Text fontSize="sm" color="text.muted">
              Nombre de jours après la fin d'un cycle pendant lesquels les chefs et sous-chefs peuvent encore
              modifier ses scores. Ensuite, seuls les admins le peuvent. 0 = jamais verrouillé.
            </Text>
          </Box>
        </HStack>
        <HStack spacing={2}>
          <NumberInput
            value={value}
            onChange={(_, n) => setValue(isNaN(n) ? 0 : n)}
            min={0}
            max={365}
            size="sm"
            w="90px"
          >
            <NumberInputField aria-label="Jours avant verrouillage" />
          </NumberInput>
          <Text fontSize="sm" color="text.muted">jours</Text>
          <Button
            size="sm"
            variant="outline"
            onClick={save}
            isLoading={isSaving}
            isDisabled={lockAfterDays === undefined || value === lockAfterDays}
          >
            Enregistrer
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};
