import { useState } from "react";
import {
  Button, HStack, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Stat,
  StatHelpText, StatLabel, Text, useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { IGuildRaffle, RaffleRank } from "@/interfaces";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useRaffleMutations } from "@/hooks/mutations/useRaffleMutations";

// Rank the guild aims to reach or keep, and the tickets every member earned for it this month
export const RaffleRankEditor = ({ raffle }: { raffle: IGuildRaffle }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { setRank: saveRank } = useRaffleMutations();
  const [rank, setRank] = useState<RaffleRank>(raffle.rank);
  const [tickets, setTickets] = useState(raffle.rank_tickets);
  const [isSaving, setIsSaving] = useState(false);
  const locked = raffle.draw !== null;
  const isDirty = rank !== raffle.rank || tickets !== raffle.rank_tickets;

  const save = async () => {
    setIsSaving(true);
    try {
      await saveRank(raffle.month.key, raffle.guild._id, rank, tickets);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stat bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={4}>
      <StatLabel>{t("pages.raffle.stats.rank")}</StatLabel>
      <HStack mt={2} spacing={2}>
        <CustomSelect
          size="sm"
          maxW="80px"
          value={rank}
          isDisabled={locked}
          onChange={(value) => setRank(value as RaffleRank)}
          options={raffle.rules.ranks.map((r) => ({ value: r, label: r }))}
        />
        <NumberInput
          size="sm"
          w="72px"
          min={0}
          max={raffle.rules.maxRankTickets}
          value={tickets}
          isDisabled={locked}
          onChange={(_, n) => setTickets(Number.isNaN(n) ? 0 : Math.min(Math.max(n, 0), raffle.rules.maxRankTickets))}
          aria-label={t("pages.raffle.stats.rankTickets")}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        {isDirty && <Button size="sm" colorScheme="purple" isLoading={isSaving} onClick={() => void save()}>OK</Button>}
      </HStack>
      <StatHelpText mb={0} mt={1}>
        <Text as="span">{t("pages.raffle.stats.rankHint", { rank: raffle.rank, count: raffle.rank_tickets })}</Text>
      </StatHelpText>
    </Stat>
  );
};
