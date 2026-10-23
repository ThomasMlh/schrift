import { useState } from "react";
import {
  Box, Button, Checkbox, FormControl, FormLabel, HStack, Input, NumberInput, NumberInputField, Text, Wrap, WrapItem, useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { IRaffleOverview } from "@/interfaces";
import { useGuilds } from "@/hooks/useAPI";
import { useRaffleMutations } from "@/hooks/mutations/useRaffleMutations";

// Admin only: which guilds take part, the prize and the ticket cap
export const RaffleSettings = ({ overview }: { overview: IRaffleOverview }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { guilds } = useGuilds();
  const { saveSettings } = useRaffleMutations();
  const [guildIds, setGuildIds] = useState(overview.guild_ids);
  const [prize, setPrize] = useState(overview.prize);
  const [maxTickets, setMaxTickets] = useState(overview.max_tickets);
  const [isSaving, setIsSaving] = useState(false);

  const toggle = (id: string, checked: boolean) => setGuildIds((ids) => (checked ? [...ids, id] : ids.filter((g) => g !== id)));

  const save = async () => {
    setIsSaving(true);
    try {
      await saveSettings({ guild_ids: guildIds, prize, max_tickets: maxTickets });
      toast({ status: "success", title: t("pages.raffle.settings.saved") });
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={5}>
      <Text fontWeight="semibold" color="text.strong" mb={3}>{t("pages.raffle.settings.title")}</Text>
      <FormControl mb={3}>
        <FormLabel fontSize="sm">{t("pages.raffle.settings.guilds")}</FormLabel>
        <Wrap spacing={4}>
          {guilds.filter((g) => !g.disabled).map((g) => (
            <WrapItem key={g._id}>
              <Checkbox colorScheme="purple" isChecked={guildIds.includes(g._id)} onChange={(e) => toggle(g._id, e.target.checked)}>
                {g.name}
              </Checkbox>
            </WrapItem>
          ))}
        </Wrap>
      </FormControl>
      <HStack align="end" spacing={3} wrap="wrap">
        <FormControl flex={1} minW="200px">
          <FormLabel fontSize="sm">{t("pages.raffle.settings.prize")}</FormLabel>
          <Input size="sm" value={prize} onChange={(e) => setPrize(e.target.value)} maxLength={120} />
        </FormControl>
        <FormControl w="140px">
          <FormLabel fontSize="sm">{t("pages.raffle.settings.maxTickets")}</FormLabel>
          <NumberInput size="sm" min={1} max={1000} value={maxTickets} onChange={(_, n) => setMaxTickets(Number.isNaN(n) ? 1 : n)}>
            <NumberInputField />
          </NumberInput>
        </FormControl>
        <Button size="sm" colorScheme="purple" onClick={() => void save()} isLoading={isSaving}>{t("common.save")}</Button>
      </HStack>
    </Box>
  );
};
