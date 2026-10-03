import { FormControl, FormLabel, HStack, Switch, Text, Tooltip, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { usePodiumSettings } from "@/hooks/useAPI";
import { useSettingsMutations } from "@/hooks/useAPIMutations";

// Réglage global : publication automatique du récap (capture du podium + bilan écrit) dans le
// salon général de chaque guilde active, le lendemain de la fin d'un cycle.
export const CycleRecapAutoSwitch = () => {
  const { autoCycleRecap, isLoading } = usePodiumSettings();
  const { updateAutoCycleRecap } = useSettingsMutations();
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      await updateAutoCycleRecap(enabled);
      toast({
        title: enabled ? "Récap automatique activé" : "Récap automatique désactivé",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Erreur lors de la mise à jour", status: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Tooltip
      label="Le lendemain de la fin d'un cycle, le bot publie la capture du podium et le bilan du cycle dans le salon général de chaque guilde active (une seule fois par cycle)."
      hasArrow
    >
      <FormControl as={HStack} spacing={2} w="auto">
        <Switch
          id="auto-cycle-recap"
          colorScheme="purple"
          isChecked={autoCycleRecap}
          isDisabled={isLoading || isSaving}
          onChange={(e) => handleChange(e.target.checked)}
        />
        <FormLabel htmlFor="auto-cycle-recap" mb={0} fontSize="sm" cursor="pointer">
          <Text as="span">📣 Récap automatique de fin de cycle</Text>
        </FormLabel>
      </FormControl>
    </Tooltip>
  );
};
