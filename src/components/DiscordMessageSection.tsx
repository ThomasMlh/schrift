import {
  Box, Button, Center, Flex, FormControl, FormLabel, Image, Popover, PopoverBody, PopoverContent,
  PopoverTrigger, Select, Spinner, Text, Textarea, VStack, useColorMode, useColorModeValue, useToast,
} from "@chakra-ui/react";
import { lazy, Suspense, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useDiscordChannels, useDiscordEmojis } from "@/hooks/useAPI";
import { useDiscordMutations } from "@/hooks/useAPIMutations";
import type { IDiscordChannel, IDiscordChannelMember } from "@/interfaces";

const DiscordEmojiPicker = lazy(() => import("./DiscordEmojiPicker"));

const UNCATEGORIZED_LABEL = "Sans catégorie";
const MENTION_PATTERN = /<@(\d+)>/g;
// Mention <@id> or custom emoji <:name:id> / <a:name:id> (animated), for the preview.
const PREVIEW_TOKEN_PATTERN = /<@(\d+)>|<(a?):(\w+):(\d+)>/g;

// Groups channels by Discord category, keeping the bot's order (category, then channel position,
// like the Discord sidebar).
const groupByCategory = (channels: IDiscordChannel[]): [string, IDiscordChannel[]][] => {
  const groups = new Map<string, IDiscordChannel[]>();
  for (const channel of channels) {
    const key = channel.category || UNCATEGORIZED_LABEL;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(channel);
  }
  return Array.from(groups.entries());
};

// Detects an "@" right before the cursor with no space in between, i.e. a mention being typed.
// Returns its start position and the text typed after the "@" (the filter), or null otherwise.
const detectMentionInProgress = (text: string, cursorPos: number): { start: number; query: string } | null => {
  const upToCursor = text.slice(0, cursorPos);
  const atIndex = upToCursor.lastIndexOf('@');
  if (atIndex === -1) return null;
  const between = upToCursor.slice(atIndex + 1);
  if (/\s/.test(between)) return null;
  return { start: atIndex, query: between };
};

// Renders Discord tokens readably to preview what will actually be sent: <@id> becomes "@Name"
// (resolved from the channel members) and a custom emoji becomes its image from the Discord CDN.
const renderPreview = (text: string, members: IDiscordChannelMember[]): ReactNode[] => {
  const memberById = new Map(members.map((m) => [m.id, m]));
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(PREVIEW_TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));

    const [, mentionId, animated, emojiName, emojiId] = match;
    if (mentionId) {
      const member = memberById.get(mentionId);
      parts.push(
        <Text as="span" key={key++} color="blue.300" fontWeight="semibold" bg="blue.900" px="1" borderRadius="sm">
          @{member?.display_name ?? mentionId}
        </Text>
      );
    } else {
      parts.push(
        <Image
          key={key++}
          src={`https://cdn.discordapp.com/emojis/${emojiId}.${animated ? "gif" : "png"}`}
          alt={`:${emojiName}:`}
          title={`:${emojiName}:`}
          display="inline-block"
          boxSize="22px"
          verticalAlign="middle"
          mx="1px"
        />
      );
    }
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
};

// Admin "Messages" tab: pick a Discord channel the user can access (all channels for an admin,
// only their guild channels for a leader/officer, filtered by the API) and write a free-form message,
// mentioning members inline (typing "@" opens suggestions, like Discord or Slack).
//
// A picked mention inserts the native Discord ping <@id> rather than "@Name": this avoids name
// matching bugs (e.g. non-ASCII "fancy font" names). Since <@id> is not readable as is, a preview
// below the textarea resolves each <@id> to "@Name" before sending.
const DiscordMessageSection: React.FC = () => {
  const { channels, isLoading } = useDiscordChannels();
  const { emojis } = useDiscordEmojis();
  const { sendDiscordMessage } = useDiscordMutations();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [channelId, setChannelId] = useState("");
  const [content, setContent] = useState("");
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const previewBg = useColorModeValue('gray.50', 'gray.900');

  const channelGroups = useMemo(() => groupByCategory(channels), [channels]);
  const selectedChannel = channels.find((c) => c.id === channelId) || null;
  // Only the emojis of the selected channel's server are offered.
  const serverEmojis = useMemo(
    () => (selectedChannel ? emojis.filter((e) => e.guild_id === selectedChannel.guild_id) : []),
    [emojis, selectedChannel]
  );

  const handleChannelChange = (id: string) => {
    setChannelId(id);
    setContent("");
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
    const mentionToken = `<@${member.id}> `;
    const newContent = `${content.slice(0, mentionStart)}${mentionToken}${content.slice(cursorPos)}`;

    setContent(newContent);
    setMentionStart(null);
    setMentionQuery("");

    const newCursorPos = mentionStart + mentionToken.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  // Inserts an emoji at the cursor. The textarea keeps its selection after losing focus (click in
  // the picker), so selectionStart is still reliable here.
  const insertEmoji = (token: string) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? content.length;
    setContent(`${content.slice(0, start)}${token}${content.slice(end)}`);

    const newCursorPos = start + token.length;
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(newCursorPos, newCursorPos);
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

  const handleSend = async () => {
    if (!channelId || !content.trim()) return;
    setIsSending(true);
    try {
      const mentionUserIds = [...new Set([...content.matchAll(MENTION_PATTERN)].map((m) => m[1]))];
      await sendDiscordMessage({ channel_id: channelId, content, mention_user_ids: mentionUserIds });

      toast({ title: "Message envoyé", status: "success" });
      setContent("");
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Erreur lors de l'envoi", status: "error" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={4}>
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
          <Flex justify="space-between" align="center" mb={2}>
            <FormLabel fontSize="sm" mb={0}>Message</FormLabel>
            <Popover placement="bottom-end" isLazy>
              <PopoverTrigger>
                <Button size="xs" variant="outline" isDisabled={!selectedChannel}>😀 Emoji</Button>
              </PopoverTrigger>
              <PopoverContent w="auto" border="none" bg="transparent" boxShadow="none">
                <PopoverBody p={0}>
                  <Suspense fallback={<Center w="350px" h="450px"><Spinner /></Center>}>
                    <DiscordEmojiPicker serverEmojis={serverEmojis} isDark={colorMode === "dark"} onPick={insertEmoji} />
                  </Suspense>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Flex>
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
              borderRadius="xl"
              boxShadow="md"
            >
              {mentionCandidates.map((m) => (
                <Flex
                  key={m.id}
                  px={3} py={2}
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  // onMouseDown rather than onClick: it fires before the textarea's onBlur, which would otherwise
                  // close the list before the click registers.
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

        {content.trim() && (
          <Box>
            <Text fontSize="xs" color="gray.500" mb={1}>Aperçu</Text>
            <Box
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="xl"
              bg={previewBg}
              p={3}
              fontSize="sm"
              whiteSpace="pre-wrap"
            >
              {renderPreview(content, selectedChannel?.members || [])}
            </Box>
          </Box>
        )}

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
