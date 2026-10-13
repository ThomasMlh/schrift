import { useMemo } from "react";
import EmojiPicker, { Categories, EmojiStyle, Theme } from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";
import type { IDiscordEmoji } from "@/interfaces";

// French category labels; "custom" holds the Discord server emojis.
const CATEGORIES = [
  { category: Categories.CUSTOM, name: "Serveur" },
  { category: Categories.SUGGESTED, name: "Récents" },
  { category: Categories.SMILEYS_PEOPLE, name: "Smileys & personnes" },
  { category: Categories.ANIMALS_NATURE, name: "Animaux & nature" },
  { category: Categories.FOOD_DRINK, name: "Nourriture" },
  { category: Categories.TRAVEL_PLACES, name: "Voyages & lieux" },
  { category: Categories.ACTIVITIES, name: "Activités" },
  { category: Categories.OBJECTS, name: "Objets" },
  { category: Categories.SYMBOLS, name: "Symboles" },
  { category: Categories.FLAGS, name: "Drapeaux" },
];

interface DiscordEmojiPickerProps {
  serverEmojis: IDiscordEmoji[];
  isDark: boolean;
  // Receives the text to insert: the Unicode character, or the Discord token <:name:id> / <a:name:id>.
  onPick: (token: string) => void;
}

// Lazy-loaded from DiscordMessageSection: the library ships the whole Unicode emoji set, so it is
// only loaded once the picker is opened.
const DiscordEmojiPicker: React.FC<DiscordEmojiPickerProps> = ({ serverEmojis, isDark, onPick }) => {
  // The library lowercases names and only returns the id on click: look the emoji up by id to get
  // its real name and whether it is animated.
  const emojiById = useMemo(() => new Map(serverEmojis.map((e) => [e.id, e])), [serverEmojis]);
  const customEmojis = useMemo(
    () => serverEmojis.map((e) => ({ id: e.id, names: [e.name], imgUrl: e.url })),
    [serverEmojis]
  );

  const handleEmojiClick = (data: EmojiClickData) => {
    if (!data.isCustom) {
      onPick(data.emoji);
      return;
    }
    const emoji = emojiById.get(data.unified);
    if (emoji) onPick(`<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`);
  };

  return (
    <EmojiPicker
      onEmojiClick={handleEmojiClick}
      customEmojis={customEmojis}
      categories={CATEGORIES}
      theme={isDark ? Theme.DARK : Theme.LIGHT}
      emojiStyle={EmojiStyle.NATIVE}
      searchPlaceHolder="Rechercher un emoji"
      previewConfig={{ showPreview: false }}
      lazyLoadEmojis
    />
  );
};

export default DiscordEmojiPicker;
