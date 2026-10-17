import { Alert, AlertIcon, Box, Button, Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useAlbum } from "@/hooks/useAPI";

// Shown to the account owner while their album is empty
export const AlbumNudge = ({ bbsId, onOpen }: { bbsId?: string; onOpen: () => void }) => {
  const { t } = useTranslation();
  const { album, isLoading } = useAlbum(bbsId);

  if (!bbsId || isLoading || !album || Object.keys(album.characters).length > 0) return null;

  return (
    <Alert status="info" borderRadius="xl" mb={6} alignItems="center">
      <AlertIcon />
      <Flex flex={1} gap={3} align="center" justify="space-between" wrap="wrap">
        <Box>
          <Text fontWeight="semibold">{t("pages.user.albumNudgeTitle")}</Text>
          <Text fontSize="sm">{t("pages.user.albumNudgeText")}</Text>
        </Box>
        <Button size="sm" colorScheme="purple" onClick={onOpen}>{t("pages.user.albumNudgeButton")}</Button>
      </Flex>
    </Alert>
  );
};
