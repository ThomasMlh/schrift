import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  VStack,
  Flex,
  Text,
  Image,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";

interface ImageLightboxProps {
  src: string | null;
  label: string;
  characterName: string;
  // Text shown under the image, e.g. the translation of a quote
  caption?: string;
  onClose: () => void;
  onDownload: (src: string, filename: string) => void;
}

export const ImageLightbox = ({ src, label, characterName, caption, onClose, onDownload }: ImageLightboxProps) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={!!src} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="transparent" boxShadow="none" mx={4}>
        <ModalCloseButton
          color="white"
          bg="blackAlpha.600"
          borderRadius="full"
          top={2}
          right={2}
          zIndex={10}
          _hover={{ bg: "blackAlpha.800" }}
        />
        <ModalBody p={0}>
          <VStack spacing={0}>
            {label && (
              <Flex
                w="100%"
                justify="space-between"
                align="center"
                px={4}
                py={2}
                bg="blackAlpha.700"
                borderTopRadius="xl"
              >
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  letterSpacing="widest"
                  textTransform="uppercase"
                  color="whiteAlpha.700"
                >
                  {label}
                </Text>
                <Tooltip label={t("pages.characterDetail.tooltipDownload")}>
                  <IconButton
                    aria-label={t("pages.characterDetail.tooltipDownload")}
                    icon={<DownloadIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    borderRadius="full"
                    onClick={() =>
                      src && onDownload(src, `${characterName}-${label}.png`)
                    }
                  />
                </Tooltip>
              </Flex>
            )}
            {src && (
              <Image
                src={src}
                alt={label}
                maxH="85vh"
                w="auto"
                maxW="100%"
                objectFit="contain"
                borderBottomRadius={caption ? undefined : "xl"}
              />
            )}
            {src && caption && (
              <Text w="100%" px={6} py={4} bg="blackAlpha.800" borderBottomRadius="xl" color="white" fontSize="lg" fontStyle="italic" textAlign="center">
                « {caption} »
              </Text>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
