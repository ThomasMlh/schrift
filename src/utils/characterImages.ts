import type { ICharacter } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";

export type CharacterImageFolder = "thumb" | "artwork" | "phrase/fr" | "phrase/en" | "attack";

// Bucket URL of a character image; the version query reloads it after a re-upload instead of showing the cached one
export const characterImageUrl = (character: Pick<ICharacter, "_id" | "images_version">, folder: CharacterImageFolder) =>
  `${bucketUrl}/characters/${folder}/${character._id}.png${character.images_version ? `?v=${character.images_version}` : ""}`;

// Quote picture with its translation written on it, one per language
export const characterQuoteFolder = (language: string): CharacterImageFolder =>
  (language.startsWith("en") ? "phrase/en" : "phrase/fr");

export const REBIRTH_STAR_URL = `${bucketUrl}/others/rebirth_star.png`;

// Game frame of a 6-star unit, drawn behind its cut-out thumbnail
export const CHARACTER_FRAME_URL = `${bucketUrl}/rmfs/fr/Thumbnail/ch_frame_bg6.png`;
