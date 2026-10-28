import { useState } from "react";
import {
  Box, Button, Checkbox, Flex, HStack, Icon, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text,
  useDisclosure, useToast,
} from "@chakra-ui/react";
import { FiGift } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { IGuildRaffle } from "@/interfaces";
import { useRaffleMutations } from "@/hooks/mutations/useRaffleMutations";
import { parseFrenchDate } from "@/utils/raffle";

// Winner of the month, or the button that draws it once the month is over
export const RaffleDrawPanel = ({ raffle }: { raffle: IGuildRaffle }) => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const { draw, cancelDraw } = useRaffleMutations();
  const confirm = useDisclosure();
  const [announce, setAnnounce] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setIsBusy(true);
    try {
      await action();
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setIsBusy(false);
    }
  };

  const handleDraw = () => run(async () => {
    const result = await draw(raffle.month.key, raffle.guild._id, announce);
    confirm.onClose();
    toast({
      status: result.announcement === "failed" ? "warning" : "success",
      title: t("pages.raffle.drawDone", { name: result.draw.winner.bbs_name }),
      description: t(`pages.raffle.announcement.${result.announcement}`),
      duration: 8000,
      isClosable: true,
    });
  });

  const nextDay = parseFrenchDate(raffle.month.end_date);
  nextDay?.setDate(nextDay.getDate() + 1);

  if (raffle.draw) {
    const { winner } = raffle.draw;
    return (
      <Box bg="bg.card" borderWidth="2px" borderColor="yellow.400" borderRadius="xl" p={5}>
        <Flex justify="space-between" align="center" gap={4} wrap="wrap">
          <HStack spacing={4}>
            <Text fontSize="3xl">🏆</Text>
            <Box>
              <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wider">{t("pages.raffle.winner")}</Text>
              <Text fontSize="xl" fontWeight="bold" color="text.strong">{winner.bbs_name}</Text>
              <Text fontSize="sm" color="text.secondary">
                {t("pages.raffle.winnerDetail", {
                  prize: raffle.draw.prize, number: raffle.draw.ticket_number, total: raffle.draw.total_tickets, tickets: winner.tickets,
                })}
              </Text>
              <Text fontSize="xs" color="text.muted">
                {t(raffle.draw.drawn_by.name ? "pages.raffle.drawnBy" : "pages.raffle.drawnAt", {
                  name: raffle.draw.drawn_by.name,
                  date: new Date(raffle.draw.drawn_at).toLocaleString(i18n.language, { dateStyle: "short", timeStyle: "short" }),
                })}
              </Text>
            </Box>
          </HStack>
          <Button size="sm" variant="ghost" colorScheme="red" isLoading={isBusy} onClick={() => void run(() => cancelDraw(raffle.month.key, raffle.guild._id))}>
            {t("pages.raffle.cancelDraw")}
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={5}>
      <Flex justify="space-between" align="center" gap={4} wrap="wrap">
        <HStack spacing={3}>
          <Icon as={FiGift} boxSize={6} color="purple.400" />
          <Box>
            <Text fontWeight="semibold" color="text.strong">{t("pages.raffle.prizeOfMonth", { prize: raffle.prize })}</Text>
            <Text fontSize="sm" color="text.muted">
              {raffle.month.finished
                ? t("pages.raffle.readyToDraw", { total: raffle.total_tickets })
                : t("pages.raffle.drawAfter", { date: nextDay?.toLocaleDateString(i18n.language, { day: "numeric", month: "long" }) ?? raffle.month.end_date })}
            </Text>
          </Box>
        </HStack>
        {raffle.month.finished && (
          <Button colorScheme="purple" leftIcon={<FiGift />} onClick={confirm.onOpen} isDisabled={raffle.total_tickets === 0}>
            {t("pages.raffle.draw")}
          </Button>
        )}
      </Flex>

      <Modal isOpen={confirm.isOpen} onClose={confirm.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("pages.raffle.confirmTitle", { guild: raffle.guild.name })}</ModalHeader>
          <ModalBody>
            <Text fontSize="sm" mb={3}>{t("pages.raffle.confirmText", { total: raffle.total_tickets })}</Text>
            <Checkbox isChecked={announce} onChange={(e) => setAnnounce(e.target.checked)} colorScheme="purple">
              {t("pages.raffle.announce")}
            </Checkbox>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={confirm.onClose}>{t("common.cancel")}</Button>
            <Button colorScheme="purple" isLoading={isBusy} onClick={() => void handleDraw()}>{t("pages.raffle.draw")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
