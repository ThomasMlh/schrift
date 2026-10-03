import { useMemo } from "react";
import EmojiPicker, { Categories, EmojiStyle, Theme } from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";
import type { IDiscordEmoji } from "@/interfaces";

// Libellés FR des catégories ; "custom" regroupe les emojis du serveur Discord.
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
  // Reçoit le texte à insérer : le caractère Unicode, ou le jeton Discord <:nom:id> / <a:nom:id>.
  onPick: (token: string) => void;
}

// Chargé à la demande (React.lazy) depuis DiscordMessageSection : la librairie embarque toute
// la base d'emojis Unicode, inutile de l'imposer tant que le sélecteur n'est pas ouvert.
const DiscordEmojiPicker: React.FC<DiscordEmojiPickerProps> = ({ serverEmojis, isDark, onPick }) => {
  // La librairie passe les noms en minuscules et ne renvoie que l'id au clic : on retrouve
  // l'emoji d'origine par son id pour avoir le vrai nom et savoir s'il est animé.
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
