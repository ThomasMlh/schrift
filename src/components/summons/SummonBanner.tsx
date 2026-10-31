import { useState } from "react";
import { Box, Image } from "@chakra-ui/react";
import { bucketUrl } from "@/utils/apiRequest";

interface SummonBannerProps {
  groupId: number;
  language: string;
}

// Banner in the site language when the game has it, otherwise the French one; the slot stays when neither exists
export const SummonBanner = ({ groupId, language }: SummonBannerProps) => {
  const lang = language.slice(0, 2);
  const sources = [
    ...(lang !== "fr" ? [`${bucketUrl}/banners/gacha_${groupId}.${lang}.png`] : []),
    `${bucketUrl}/banners/gacha_${groupId}.png`,
  ];
  const [attempt, setAttempt] = useState(0);
  return (
    <Box sx={{ aspectRatio: "3 / 1" }} bg="bg.inset" borderRadius="md" overflow="hidden">
      {attempt < sources.length && (
        <Image
          src={sources[attempt]}
          alt=""
          w="100%"
          h="100%"
          objectFit="cover"
          loading="lazy"
          onError={() => setAttempt((a) => a + 1)}
        />
      )}
    </Box>
  );
};
