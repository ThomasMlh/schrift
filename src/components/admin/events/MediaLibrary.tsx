import { useRef, useState } from "react";
import {
  Alert, AlertIcon, Badge, Box, Button, Grid, HStack, Image, Progress, Text, VStack, useToast,
} from "@chakra-ui/react";
import { useEventAdminActions, useEventMedia } from "@/hooks/useAPI";
import { bucketUrl } from "@/utils/apiRequest";
import { compressImage } from "@/utils/imageCompression";
import type { IQuiz } from "@/interfaces";

const readAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} Mo` : `${Math.round(bytes / 1024)} Ko`);

// Files of an event, uploaded ahead and picked by the questions
export const MediaLibrary = ({ eventId, quizzes }: { eventId: string; quizzes: IQuiz[] }) => {
  const { data: media = [], isLoading } = useEventMedia(eventId);
  const actions = useEventAdminActions();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<{ name: string; progress: number }[]>([]);

  const usedBy = (mediaId: string) => quizzes.flatMap((quiz) => quiz.questions
    .map((q, index) => (q.media_id === mediaId ? `Q${index + 1}` : null))
    .filter(Boolean));

  const upload = async (files: FileList | null) => {
    for (const file of Array.from(files ?? [])) {
      setUploads((list) => [...list, { name: file.name, progress: 0 }]);
      const progress = (ratio: number) => setUploads((list) => list.map((u) => (u.name === file.name ? { ...u, progress: ratio } : u)));
      try {
        if (file.type.startsWith("image/")) {
          await actions.uploadImage(eventId, file.name, await compressImage(await readAsDataUrl(file), 1600, 0.85));
        } else if (file.type === "audio/mpeg" || file.type === "video/mp4") {
          await actions.uploadFile(eventId, file.type === "video/mp4" ? "video" : "audio", file, progress);
        } else {
          throw new Error("Format non pris en charge : image, MP3 ou MP4");
        }
      } catch (err) {
        toast({ status: "error", title: file.name, description: (err as Error).message });
      } finally {
        setUploads((list) => list.filter((u) => u.name !== file.name));
      }
    }
    if (input.current) input.current.value = "";
  };

  const remove = async (id: string) => {
    try {
      await actions.deleteMedia(id);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      <Box borderWidth="2px" borderStyle="dashed" borderColor="border.strong" borderRadius="xl" p={4}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontWeight="bold">Ajouter des fichiers</Text>
            <Text fontSize="sm" color="text.muted">Images PNG, JPG ou WebP (converties en WebP) · Audio MP3 (10 Mo max) · Vidéo MP4 H.264, 720p conseillé (30 Mo max)</Text>
          </Box>
          <Button colorScheme="purple" onClick={() => input.current?.click()}>Choisir des fichiers</Button>
          <input ref={input} type="file" hidden multiple accept="image/png,image/jpeg,image/webp,audio/mpeg,video/mp4" onChange={(e) => upload(e.target.files)} />
        </HStack>
        {uploads.map((u) => (
          <Box key={u.name} mt={3}>
            <Text fontSize="sm" fontWeight="semibold">{u.name}</Text>
            <Progress value={u.progress * 100} size="xs" colorScheme="purple" borderRadius="full" isIndeterminate={u.progress === 0} />
          </Box>
        ))}
      </Box>

      {!isLoading && media.length === 0 && <Alert status="info" borderRadius="lg"><AlertIcon />Aucun fichier pour cet événement.</Alert>}
      <Grid templateColumns="repeat(auto-fill, minmax(180px, 1fr))" gap={3}>
        {media.map((m) => {
          const used = usedBy(m._id);
          const src = `${bucketUrl}/${m.path}`;
          return (
            <VStack key={m._id} align="stretch" spacing={2} p={2.5} borderWidth="1px" borderColor="border.subtle" borderRadius="xl" bg="bg.card">
              {m.status !== "ready" ? (
                <Box h="90px" borderRadius="md" bg="bg.subtle" display="grid" placeItems="center"><Text fontSize="xs" color="text.muted">Envoi incomplet</Text></Box>
              ) : m.kind === "image" ? (
                <Image src={src} alt="" h="90px" objectFit="cover" borderRadius="md" />
              ) : m.kind === "video" ? (
                <video src={src} controls preload="metadata" style={{ height: 90, borderRadius: 6, background: "black" }} />
              ) : (
                <audio src={src} controls preload="none" style={{ width: "100%" }} />
              )}
              <Text fontSize="sm" fontWeight="semibold" noOfLines={1} title={m.name}>{m.name}</Text>
              <HStack justify="space-between">
                <Text fontSize="xs" color="text.muted">{formatSize(m.size)}</Text>
                {used.length ? <Badge colorScheme="purple">{used.join(", ")}</Badge> : <Badge>Libre</Badge>}
              </HStack>
              <Button size="xs" variant="ghost" colorScheme="red" isDisabled={used.length > 0} onClick={() => remove(m._id)}>Supprimer</Button>
            </VStack>
          );
        })}
      </Grid>
      <Text fontSize="xs" color="text.muted">Les fichiers ont un nom aléatoire ; un joueur ne reçoit le lien d'un média qu'au moment où sa question s'affiche.</Text>
    </VStack>
  );
};
