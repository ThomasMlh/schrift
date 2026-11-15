import { Box, Image } from "@chakra-ui/react";
import { bucketUrl } from "@/utils/apiRequest";
import type { IPlayerQuestion } from "@/interfaces";

// Image, video or audio of a question, from the bucket
export const QuestionMedia = ({ media }: { media: IPlayerQuestion["media"] }) => {
  if (!media) return null;
  const src = `${bucketUrl}/${media.path}`;
  if (media.kind === "image") {
    return (
      <Box borderRadius="xl" overflow="hidden" bg="blackAlpha.800" display="flex" justifyContent="center">
        <Image src={src} alt="" maxH="420px" objectFit="contain" draggable={false} onContextMenu={(e) => e.preventDefault()} />
      </Box>
    );
  }
  if (media.kind === "video") {
    return (
      <Box borderRadius="xl" overflow="hidden" bg="black">
        <video src={src} controls autoPlay playsInline controlsList="nodownload" style={{ width: "100%", maxHeight: 420 }} />
      </Box>
    );
  }
  return <audio src={src} controls autoPlay controlsList="nodownload" style={{ width: "100%" }} />;
};
