import { useEffect, useState } from "react";
import {
  Button, Checkbox, FormControl, FormHelperText, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay, Textarea, VStack, useToast,
} from "@chakra-ui/react";
import { useGuilds } from "@/hooks/useAPI";
import type { IApplication } from "@/hooks/useAPI";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useRecruitmentMutations } from "@/hooks/mutations/useRecruitmentMutations";

const welcomeTemplate = (name: string, guild: string) =>
  `Bienvenue à **${name}** dans la guilde **${guild}** ! 🎉\nN'hésite pas à te présenter et à poser tes questions ici.`;

const WELCOME_RESULTS = {
  sent: { status: "success", title: "Message de bienvenue posté" },
  no_channel: { status: "warning", title: "Pas de salon membres configuré pour cette guilde : message non posté" },
  failed: { status: "warning", title: "Le bot n'a pas pu poster le message de bienvenue" },
} as const;

// Accepts an application: guild, optional player profile and welcome message in the members channel
export const AcceptApplicationModal = ({ application, onClose }: { application: IApplication | null; onClose: () => void }) => {
  const toast = useToast();
  const { guilds } = useGuilds();
  const { acceptApplication } = useRecruitmentMutations();
  const activeGuilds = guilds.filter((g) => !g.disabled);
  const [guildId, setGuildId] = useState("");
  const [createPlayer, setCreatePlayer] = useState(true);
  const [bbsId, setBbsId] = useState("");
  const [sendWelcome, setSendWelcome] = useState(true);
  const [welcome, setWelcome] = useState("");
  const [welcomeEdited, setWelcomeEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!application) return;
    setGuildId(application.preferred_guild_id ?? "");
    setBbsId(application.bbs_id ?? "");
    setCreatePlayer(true);
    setSendWelcome(true);
    setWelcomeEdited(false);
  }, [application]);

  const guildName = activeGuilds.find((g) => g._id === guildId)?.name ?? "";
  useEffect(() => {
    if (application && !welcomeEdited) setWelcome(welcomeTemplate(application.bbs_name, guildName || "…"));
  }, [application, guildName, welcomeEdited]);

  const submit = async () => {
    if (!application) return;
    setIsSaving(true);
    try {
      const result = await acceptApplication(application._id, {
        guild_id: guildId,
        create_player: createPlayer,
        bbs_id: createPlayer ? bbsId.trim() : undefined,
        welcome_message: sendWelcome ? welcome : undefined,
      });
      toast({
        status: "success",
        title: `${application.bbs_name} accepté(e) dans ${guildName}`,
        description: result.player ? "Fiche joueur créée" : undefined,
        duration: 3000,
      });
      if (result.welcome) toast({ ...WELCOME_RESULTS[result.welcome], duration: 4000 });
      onClose();
    } catch (err) {
      toast({ status: "error", title: (err as Error).message, duration: 4000 });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={!!application} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Accepter {application?.bbs_name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Guilde</FormLabel>
              <CustomSelect
                value={guildId}
                onChange={setGuildId}
                options={activeGuilds.map((g) => ({ value: g._id ?? "", label: g.name }))}
                placeholder="Choisir une guilde"
              />
            </FormControl>

            <FormControl>
              <Checkbox colorScheme="purple" isChecked={createPlayer} onChange={(e) => setCreatePlayer(e.target.checked)}>
                Créer la fiche du joueur
              </Checkbox>
              {createPlayer && (
                <>
                  <Input mt={2} size="sm" value={bbsId} onChange={(e) => setBbsId(e.target.value)} placeholder="ID BBS" maxLength={40} />
                  <FormHelperText>
                    Compte BBS rattaché à la guilde, rôle membre. Le joueur le reliera à son Discord en se connectant.
                  </FormHelperText>
                </>
              )}
            </FormControl>

            <FormControl>
              <Checkbox colorScheme="purple" isChecked={sendWelcome} onChange={(e) => setSendWelcome(e.target.checked)}>
                Poster un message de bienvenue dans le salon membres de la guilde
              </Checkbox>
              {sendWelcome && (
                <Textarea
                  mt={2}
                  rows={3}
                  maxLength={1500}
                  value={welcome}
                  onChange={(e) => { setWelcome(e.target.value); setWelcomeEdited(true); }}
                />
              )}
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button
            colorScheme="green"
            onClick={submit}
            isLoading={isSaving}
            isDisabled={!guildId || (createPlayer && !bbsId.trim()) || (sendWelcome && !welcome.trim())}
          >
            Accepter
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
