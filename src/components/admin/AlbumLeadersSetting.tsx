import { useState } from "react";
import { Box, Flex, HStack, Icon, Switch, Text, useToast } from "@chakra-ui/react";
import { FiBookOpen } from "react-icons/fi";
import { useAlbumSettings } from "@/hooks/useAPI";
import { useSettingsMutations } from "@/hooks/mutations/useSettingsMutations";

// Lets guild leaders and officers fill the albums of their guild's players
export const AlbumLeadersSetting = () => {
  const toast = useToast();
  const { leadersCanEdit, isLoaded } = useAlbumSettings();
  const { updateAlbumLeadersCanEdit } = useSettingsMutations();
  const [isSaving, setIsSaving] = useState(false);

  const toggle = async (value: boolean) => {
    setIsSaving(true);
    try {
      await updateAlbumLeadersCanEdit(value);
      toast({ title: value ? "Les chefs et sous-chefs peuvent modifier les albums" : "Albums modifiables par leurs propriétaires uniquement", status: "success" });
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
          <Icon as={FiBookOpen} boxSize={5} color="purple.400" mt={0.5} />
          <Box>
            <Text fontWeight="semibold" color="text.strong">Albums modifiables par les chefs</Text>
            <Text fontSize="sm" color="text.muted">
              Les chefs et sous-chefs peuvent remplir l'album des joueurs de leur guilde, depuis la page de chaque joueur.
              Les admins et les propriétaires des comptes le peuvent toujours.
            </Text>
          </Box>
        </HStack>
        <Switch
          colorScheme="purple"
          isChecked={leadersCanEdit}
          isDisabled={!isLoaded || isSaving}
          onChange={(e) => void toggle(e.target.checked)}
          aria-label="Albums modifiables par les chefs et sous-chefs"
        />
      </Flex>
    </Box>
  );
};
