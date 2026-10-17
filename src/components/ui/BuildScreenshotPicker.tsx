import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, HStack, Icon, Image, Input, Text, VStack, useToast } from "@chakra-ui/react";
import { FiImage, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { compressImage } from "@/utils/imageCompression";

// Same width as the API conversion, with a quality that keeps text readable
const MAX_DIMENSION = 1600;
const QUALITY = 0.85;

interface BuildScreenshotPickerProps {
  // Displayed image: new screenshot (data URL) or existing one (bucket URL)
  value: string | null;
  // New screenshot (compressed data URL), or null to remove it
  onChange: (dataUrl: string | null) => void;
}

const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

// Build screenshot: drag and drop, file picker or paste (Ctrl+V)
export const BuildScreenshotPicker = ({ value, onChange }: BuildScreenshotPickerProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = useCallback(async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: t("components.buildScreenshot.notAnImage"), status: "warning", duration: 3000 });
      return;
    }
    setIsProcessing(true);
    try {
      onChange(await compressImage(await readFile(file), MAX_DIMENSION, QUALITY));
    } catch {
      toast({ title: t("components.buildScreenshot.readError"), status: "error", duration: 3000 });
    } finally {
      setIsProcessing(false);
    }
  }, [onChange, t, toast]);

  // Paste a screenshot from the clipboard while the area is shown
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      if (item) {
        e.preventDefault();
        void handleFile(item.getAsFile());
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  return (
    <VStack align="stretch" spacing={3}>
      <Box
        as="button"
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e: React.DragEvent) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        borderWidth="2px"
        borderStyle="dashed"
        borderColor={isDragging ? "purple.400" : "border.strong"}
        bg={isDragging ? "rgba(159, 122, 234, 0.08)" : "bg.subtle"}
        borderRadius="xl"
        minH="180px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
        transition="border-color 0.15s, background 0.15s"
        _hover={{ borderColor: "purple.400" }}
      >
        {value ? (
          <Image src={value} alt={t("components.buildScreenshot.preview")} maxH="320px" w="100%" objectFit="contain" />
        ) : (
          <VStack spacing={2} color="text.muted" p={6}>
            <Icon as={isProcessing ? FiImage : FiUploadCloud} boxSize={8} />
            <Text fontWeight="semibold" color="text.secondary">{t("components.buildScreenshot.dropzone")}</Text>
            <Text fontSize="sm">{t("components.buildScreenshot.hint")}</Text>
          </VStack>
        )}
      </Box>

      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        display="none"
        onChange={(e) => { void handleFile(e.target.files?.[0]); e.target.value = ""; }}
      />

      {value && (
        <HStack spacing={2}>
          <Button size="sm" variant="outline" leftIcon={<Icon as={FiUploadCloud} />} onClick={() => inputRef.current?.click()} isLoading={isProcessing}>
            {t("components.buildScreenshot.replace")}
          </Button>
          <Button size="sm" variant="ghost" colorScheme="red" leftIcon={<Icon as={FiTrash2} />} onClick={() => onChange(null)}>
            {t("components.buildScreenshot.remove")}
          </Button>
        </HStack>
      )}
    </VStack>
  );
};
