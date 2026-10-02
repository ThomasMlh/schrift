import {
  Box, Button, Flex, FormControl, FormLabel, Input, Select, Tag, TagCloseButton, TagLabel,
  Text, Textarea, VStack, Wrap, useColorModeValue, useToast,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useDiscordChannels } from "@/hooks/useAPI";
import { useDiscordMutations } from "@/hooks/useAPIMutations";
import type { IDiscordChannelMember } from "@/interfaces";

// Onglet admin "Messages" : choisir un salon Discord parmi ceux accessibles à
// l'utilisateur (tous pour un admin, uniquement ceux de sa/ses guildes pour un
// chef/sous-chef — filtré côté API), composer un message libre, et mentionner
// explicitement des membres du salon. Les mentions sont ajoutées en tête du
// message sous forme de pings Discord natifs (<@id>), reconnus par Discord peu
// importe où ils apparaissent dans le texte.
const DiscordMessageSection: React.FC = () => {
  const { channels, isLoading } = useDiscordChannels();
  const { sendDiscordMessage } = useDiscordMutations();
  const toast = useToast();

  const [channelId, setChannelId] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<IDiscordChannelMember[]>([]);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');

  const selectedChannel = channels.find((c) => c.id === channelId) || null;

  // Changer de salon invalide les destinataires choisis : ils n'ont de sens que pour le salon où ils ont été pris.
  const handleChannelChange = (id: string) => {
    setChannelId(id);
    setSelectedMembers([]);
    setMemberFilter("");
  };

  const filteredMembers = useMemo(() => {
    if (!selectedChannel) return [];
    const term = memberFilter.trim().toLowerCase();
    return selectedChannel.members.filter((m) =>
      !selectedMembers.some((s) => s.id === m.id) &&
      (!term || m.display_name.toLowerCase().includes(term) || m.username.toLowerCase().includes(term))
    );
  }, [selectedChannel, memberFilter, selectedMembers]);

  const addMember = (member: IDiscordChannelMember) => {
    setSelectedMembers((prev) => [...prev, member]);
    setMemberFilter("");
  };

  const removeMember = (id: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSend = async () => {
    if (!channelId || !content.trim()) return;
    setIsSending(true);
    try {
      const mentions = selectedMembers.map((m) => `<@${m.id}>`).join(' ');
      const finalContent = mentions ? `${mentions}\n${content.trim()}` : content.trim();

      await sendDiscordMessage({
        channel_id: channelId,
        content: finalContent,
        mention_user_ids: selectedMembers.map((m) => m.id),
      });

      toast({ title: "Message envoyé", status: "success" });
      setContent("");
      setSelectedMembers([]);
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Erreur lors de l'envoi", status: "error" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} p={4}>
      <VStack align="stretch" spacing={4}>
        <FormControl>
          <FormLabel fontSize="sm">Salon Discord</FormLabel>
          <Select
            placeholder={isLoading ? "Chargement..." : "Choisir un salon"}
            value={channelId}
            onChange={(e) => handleChannelChange(e.target.value)}
            isDisabled={isLoading}
          >
            {channels.map((c) => (
              <option key={c.id} value={c.id}>#{c.name}</option>
            ))}
          </Select>
          {!isLoading && channels.length === 0 && (
            <Text fontSize="sm" color="gray.500" mt={1}>Aucun salon accessible.</Text>
          )}
        </FormControl>

        {selectedChannel && (
          <FormControl position="relative">
            <FormLabel fontSize="sm">Mentionner des membres (optionnel)</FormLabel>
            {selectedMembers.length > 0 && (
              <Wrap mb={2}>
                {selectedMembers.map((m) => (
                  <Tag key={m.id} colorScheme="purple" borderRadius="full">
                    <TagLabel>@{m.display_name}</TagLabel>
                    <TagCloseButton onClick={() => removeMember(m.id)} />
                  </Tag>
                ))}
              </Wrap>
            )}
            <Input
              placeholder="Rechercher un membre du salon..."
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              onFocus={() => setIsMemberListOpen(true)}
              // Délai pour laisser le clic sur un résultat se déclencher avant la fermeture
              onBlur={() => setTimeout(() => setIsMemberListOpen(false), 150)}
            />
            {isMemberListOpen && filteredMembers.length > 0 && (
              <Box
                position="absolute"
                zIndex={10}
                mt={1}
                w="100%"
                maxH="200px"
                overflowY="auto"
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
                boxShadow="md"
              >
                {filteredMembers.slice(0, 20).map((m) => (
                  <Flex
                    key={m.id}
                    px={3} py={2}
                    cursor="pointer"
                    _hover={{ bg: hoverBg }}
                    onClick={() => addMember(m)}
                  >
                    <Text fontSize="sm">
                      {m.display_name} <Text as="span" color="gray.500">@{m.username}</Text>
                    </Text>
                  </Flex>
                ))}
              </Box>
            )}
          </FormControl>
        )}

        <FormControl>
          <FormLabel fontSize="sm">Message</FormLabel>
          <Textarea
            placeholder="Votre message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />
        </FormControl>

        <Flex justify="flex-end">
          <Button
            colorScheme="blue"
            onClick={handleSend}
            isLoading={isSending}
            isDisabled={!channelId || !content.trim()}
          >
            Envoyer
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default DiscordMessageSection;
