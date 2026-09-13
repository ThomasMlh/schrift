import {
  IconButton, Tooltip, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, VStack, Box, Text, ButtonGroup, Button, useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import type { ICycle } from "@/interfaces";
import { useGuilds } from "@/hooks/useAPI";
import { usePodiumMutations } from "@/hooks/useAPIMutations";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface PublishCycleRecapButtonProps {
  cycle: ICycle;
}

// Publie manuellement le podium final d'un cycle (capture d'écran, même mécanisme que le
// récap automatique par rotation) dans le salon général d'une guilde ou de toutes.
export const PublishCycleRecapButton: React.FC<PublishCycleRecapButtonProps> = ({ cycle }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { guilds } = useGuilds(true);
  const { publishCycleRecap } = usePodiumMutations();
  const toast = useToast();

  const [guildName, setGuildName] = useState("");
  const [rankingType, setRankingType] = useState<"average" | "max">("average");
  const [isPublishing, setIsPublishing] = useState(false);

  const guildOptions = [{ value: "", label: "Toutes les guildes actives" }, ...guilds.map((g) => ({ value: g.name, label: g.name }))];

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const data = await publishCycleRecap({
        cycleName: cycle.name,
        year: cycle.year,
        rankingType,
        guildName: guildName || undefined,
      });
      const requested = data.results.filter((r) => r.status === "requested").length;
      const skipped = data.results.filter((r) => r.status === "skipped");
      toast({
        title: `Récap demandé pour ${requested} guilde(s)`,
        description: skipped.length > 0 ? `Ignoré (pas de salon configuré) : ${skipped.map((s) => s.guild).join(", ")}` : undefined,
        status: skipped.length > 0 ? "warning" : "success",
        duration: 5000,
      });
      onClose();
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Erreur lors de la publication", status: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <Tooltip label="Publier le récap podium sur Discord" hasArrow>
        <IconButton
          size="xs"
          aria-label="Publier le récap Discord"
          icon={<Text fontSize="0.85rem">📣</Text>}
          variant="ghost"
          borderRadius="lg"
          color="gray.500"
          _hover={{ color: "purple.400", bg: "whiteAlpha.100" }}
          onClick={onOpen}
        />
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Publier le récap de {cycle.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm" color="gray.500">
                Envoie une capture d'écran du podium final du cycle dans le salon général de la/les
                guilde(s) choisie(s). Rien n'est appliqué ni modifié, juste une notification Discord.
              </Text>
              <Box>
                <Text fontSize="sm" mb={1}>Guilde</Text>
                <CustomSelect
                  value={guildName}
                  onChange={setGuildName}
                  options={guildOptions}
                  allowDeselect={false}
                  size="md"
                />
              </Box>
              <Box>
                <Text fontSize="sm" mb={1}>Classement</Text>
                <ButtonGroup size="sm" isAttached variant="outline" w="100%">
                  <Button flex={1} colorScheme={rankingType === "average" ? "blue" : undefined} variant={rankingType === "average" ? "solid" : "outline"} onClick={() => setRankingType("average")}>
                    Moyenne
                  </Button>
                  <Button flex={1} colorScheme={rankingType === "max" ? "blue" : undefined} variant={rankingType === "max" ? "solid" : "outline"} onClick={() => setRankingType("max")}>
                    Max
                  </Button>
                </ButtonGroup>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Annuler</Button>
            <Button colorScheme="purple" onClick={handlePublish} isLoading={isPublishing}>
              Publier
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
