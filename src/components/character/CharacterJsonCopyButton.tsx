import { useState } from "react";
import { Button, Icon, useToast } from "@chakra-ui/react";
import { FiCopy } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { ICharacter } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";

// Resolves to true when the picture loads: not every unit has a quote or an archived summon visual
const imageExists = (url: string) => new Promise<boolean>((resolve) => {
  const image = new Image();
  image.onload = () => resolve(true);
  image.onerror = () => resolve(false);
  image.src = url;
});

// First URL whose picture loads, null when none does
const firstExisting = async (urls: string[]) => {
  for (const url of urls) if (await imageExists(url)) return url;
  return null;
};

// Fields of the character in database.json, pointing to the bucket, formatted to paste into the file.
// The game quote picture is the same in every language: English falls back to it without a subtitled one.
const jsonLines = async (character: ICharacter) => {
  const characterUrl = (folder: string) => `${bucketUrl}/characters/${folder}/${character._id}.png`;
  const firstSummon = character.banners?.[0];
  const candidates: [string, string[]][] = [
    ["Link", [characterUrl("thumb")]],
    ["URL Portail", firstSummon ? [`${bucketUrl}/banners/gacha_${firstSummon.gacha_group_id}.png`] : []],
    ["URL Artwork", [characterUrl("artwork")]],
    ["URL Phrase FR", [characterUrl("phrase")]],
    ["URL Phrase EN", [characterUrl("phrase-en"), characterUrl("phrase")]],
    ["URL ATK", [characterUrl("attack")]],
  ];
  const found = await Promise.all(candidates.map(async ([field, urls]) => {
    const url = await firstExisting(urls);
    return url ? [field, url] : null;
  }));
  const quotes = (["fr", "en"] as const).flatMap((language): [string, string][] => {
    const text = character.quote?.[language];
    return text ? [[`Phrase ${language.toUpperCase()}`, text]] : [];
  });
  const fields: [string, string | number | null][] = [
    ...found.filter((entry): entry is [string, string] => entry !== null),
    ...quotes,
    ["Base ID", character._id],
    ["Game ID", character.game_id ?? null],
    // Old summons are filed under group 0 in the game tables, not a summon id
    ...(firstSummon?.gacha_group_id ? [["Game Banner ID", firstSummon.gacha_group_id] as [string, number]] : []),
  ];
  // Same indentation as database.json, a comma after every field but the last one of the object
  return fields.map(([field, value], index) => `        ${JSON.stringify(field)}: ${JSON.stringify(value)}${index < fields.length - 1 ? "," : ""}`).join("\n");
};

// Admin tool: copies the bucket URLs and ids of the character for the database.json source file
export const CharacterJsonCopyButton = ({ character }: { character: ICharacter }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [isCopying, setIsCopying] = useState(false);

  const copy = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(await jsonLines(character));
      toast({ status: "success", title: t("pages.characterDetail.jsonCopied"), duration: 3000 });
    } catch {
      toast({ status: "error", title: t("pages.characterDetail.jsonCopyFailed") });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Button size="sm" variant="outline" leftIcon={<Icon as={FiCopy} />} onClick={() => void copy()} isLoading={isCopying} flexShrink={0}>
      {t("pages.characterDetail.copyJson")}
    </Button>
  );
};
