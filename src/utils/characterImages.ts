import type { ICharacter } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";

export type CharacterImageFolder = "thumb" | "artwork" | "phrase" | "phrase-en" | "attack" | "banner";

// Bucket URL of a character image; the version query reloads it after a re-upload instead of showing the cached one
export const characterImageUrl = (character: Pick<ICharacter, "_id" | "images_version">, folder: CharacterImageFolder) =>
  `${bucketUrl}/characters/${folder}/${character._id}.png${character.images_version ? `?v=${character.images_version}` : ""}`;

// English quote when the source has one and the site is in English, French quote otherwise
export const characterQuoteFolder = (character: Pick<ICharacter, "source_images">, language: string): CharacterImageFolder =>
  (language.startsWith("en") && character.source_images?.quote_en ? "phrase-en" : "phrase");

export const REBIRTH_STAR_URL = `${bucketUrl}/others/rebirth_star.png`;
