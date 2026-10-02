import {
  Box, Button, Flex, FormControl, FormLabel, Select,
  Text, Textarea, VStack, useColorModeValue, useToast,
} from "@chakra-ui/react";
import { useMemo, useRef, useState } from "react";
import { useDiscordChannels } from "@/hooks/useAPI";
import { useDiscordMutations } from "@/hooks/useAPIMutations";
import type { IDiscordChannel, IDiscordChannelMember } from "@/interfaces";

const UNCATEGORIZED_LABEL = "Sans catégorie";

// Regroupe les salons par catégorie Discord, dans l'ordre d'arrivée (déjà trié côté bot
// comme la sidebar Discord : catégorie puis position du salon dedans).
const groupByCategory = (channels: IDiscordChannel[]): [string, IDiscordChannel[]][] => {
  const groups = new Map<string, IDiscordChannel[]>();
  for (const channel of channels) {
    const key = channel.category || UNCATEGORIZED_LABEL;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(channel);
  }
  return Array.from(groups.entries());
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Repère un "@" juste avant le curseur, sans espace entre les deux : c'est une mention en
// cours de frappe. Renvoie sa position de départ et le texte tapé après le "@" (le filtre),
// ou null si le curseur n'est pas dans ce contexte (pas de "@" récent, ou espace tapé après).
const detectMentionInProgress = (text: string, cursorPos: number): { start: number; query: string } | null => {
  const upToCursor = text.slice(0, cursorPos);
  const atIndex = upToCursor.lastIndexOf('@');
  if (atIndex === -1) return null;
  const between = upToCursor.slice(atIndex + 1);
  if (/\s/.test(between)) return null;
  return { start: atIndex, query: between };
};

// Onglet admin "Messages" : choisir un salon Discord parmi ceux accessibles à
// l'utilisateur (tous pour un admin, uniquement ceux de sa/ses guildes pour un
// chef/sous-chef — filtré côté API), puis composer un message libre en mentionnant
// des membres directement dans le texte (taper "@" ouvre une liste de suggestions,
// comme sur Discord/Slack). Chaque mention choisie est affichée en "@Pseudo" dans
// la zone de texte et convertie en ping Discord natif (<@id>) au moment de l'envoi.
const DiscordMessageSection: React.FC = () => {
  const { channels, isLoading } = useDiscordChannels();
  const { sendDiscordMessage } = useDiscordMutations();
  const toast = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [channelId, setChannelId] = useState("");
  const [content, setContent] = useState("");
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string>("");
  // Pseudo (tel qu'inséré dans le texte) -> membre choisi via la liste de suggestions.
  // Sert à retrouver l'ID Discord au moment de l'envoi ; un "@Pseudo" tapé à la main sans
  // passer par la suggestion n'est PAS converti en ping (comportement prévisible).
  const [usedMentions, setUsedMentions] = useState<Map<string, IDiscordChannelMember>>(new Map());
  const [isSending, setIsSending] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');

  const channelGroups = useMemo(() => groupByCategory(channels), [channels]);
  const selectedChannel = channels.find((c) => c.id === channelId) || null;

  const handleChannelChange = (id: string) => {
    setChannelId(id);
    setContent("");
    setUsedMentions(new Map());
    setMentionStart(null);
  };

  const mentionCandidates = useMemo(() => {
    if (mentionStart === null || !selectedChannel) return [];
    const term = mentionQuery.toLowerCase();
    return selectedChannel.members
      .filter((m) => !term || m.display_name.toLowerCase().includes(term) || m.username.toLowerCase().includes(term))
      .slice(0, 8);
  }, [mentionStart, mentionQuery, selectedChannel]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    const mention = detectMentionInProgress(value, e.target.selectionStart);
    setMentionStart(mention?.start ?? null);
    setMentionQuery(mention?.query ?? "");
  };

  const insertMention = (member: IDiscordChannelMember) => {
    const textarea = textareaRef.current;
    if (mentionStart === null || !textarea) return;

    const cursorPos = textarea.selectionStart;
    const mentionText = `@${member.display_name} `;
    const newContent = `${content.slice(0, mentionStart)}${mentionText}${content.slice(cursorPos)}`;

    setContent(newContent);
    setUsedMentions((prev) => new Map(prev).set(member.display_name, member));
    setMentionStart(null);
    setMentionQuery("");

    const newCursorPos = mentionStart + mentionText.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionStart === null) return;
    if (e.key === 'Escape') {
      setMentionStart(null);
      setMentionQuery("");
    } else if ((e.key === 'Enter' || e.key === 'Tab') && mentionCandidates.length > 0) {
      e.preventDefault();
      insertMention(mentionCandidates[0]);
    }
  };

  // Remplace chaque "@Pseudo" effectivement présent dans le texte final par son ping Discord
  // natif <@id>. Si l'admin a modifié/supprimé une partie d'une mention insérée, elle ne
  // matche plus et reste du texte brut — pas de ping accidentel sur un fragment.
  const buildFinalContent = () => {
    let final = content;
    for (const [displayName, member] of usedMentions) {
      const pattern = new RegExp(`@${escapeRegExp(displayName)}\\b`, 'g');
      final = final.replace(pattern, `<@${member.id}>`);
    }
    return final;
  };

  const handleSend = async () => {
    if (!channelId || !content.trim()) return;
    setIsSending(true);
    try {
      const finalContent = buildFinalContent();
      const mentionUserIds = [...new Set([...finalContent.matchAll(/<@(\d+)>/g)].map((m) => m[1]))];

      await sendDiscordMessage({ channel_id: channelId, content: finalContent, mention_user_ids: mentionUserIds });

      toast({ title: "Message envoyé", status: "success" });
      setContent("");
      setUsedMentions(new Map());
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
            {channelGroups.map(([category, chans]) => (
              <optgroup key={category} label={category}>
                {chans.map((c) => (
                  <option key={c.id} value={c.id}>#{c.name}</option>
                ))}
              </optgroup>
            ))}
          </Select>
          {!isLoading && channels.length === 0 && (
            <Text fontSize="sm" color="gray.500" mt={1}>Aucun salon accessible.</Text>
          )}
        </FormControl>

        <FormControl position="relative">
          <FormLabel fontSize="sm">Message</FormLabel>
          <Textarea
            ref={textareaRef}
            placeholder={selectedChannel ? "Votre message... (tapez @ pour mentionner quelqu'un)" : "Choisissez d'abord un salon"}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleTextareaKeyDown}
            onBlur={() => setTimeout(() => setMentionStart(null), 150)}
            isDisabled={!selectedChannel}
            rows={5}
          />
          {mentionStart !== null && mentionCandidates.length > 0 && (
            <Box
              position="absolute"
              zIndex={10}
              bottom={0}
              transform="translateY(100%)"
              w="100%"
              maxH="200px"
              overflowY="auto"
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="md"
            >
              {mentionCandidates.map((m) => (
                <Flex
                  key={m.id}
                  px={3} py={2}
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  // onMouseDown (pas onClick) : se déclenche avant le onBlur du textarea, qui
                  // fermerait sinon la liste avant que le clic soit pris en compte.
                  onMouseDown={(e) => { e.preventDefault(); insertMention(m); }}
                >
                  <Text fontSize="sm">
                    {m.display_name} <Text as="span" color="gray.500">@{m.username}</Text>
                  </Text>
                </Flex>
              ))}
            </Box>
          )}
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
