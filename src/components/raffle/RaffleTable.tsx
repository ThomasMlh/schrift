import { useState } from "react";
import {
  Avatar, Badge, Box, Button, Checkbox, HStack, IconButton, Input, NumberInput, NumberInputField, Popover, PopoverArrow,
  PopoverBody, PopoverContent, PopoverTrigger, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr, VStack, useToast,
} from "@chakra-ui/react";
import { FiPlus, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { IGuildRaffle, IRafflePlayer } from "@/interfaces";
import { useRaffleMutations } from "@/hooks/mutations/useRaffleMutations";
import CustomLink from "@/components/ui/CustomLink";
import { getUserAvatarUrl } from "@/utils/discord";
import { buildPlayerUrl } from "@/utils/playerUrl";
import { formatScore } from "@/utils/format";


// A number cell that stays quiet when the player earned nothing
const Count = ({ value, hint }: { value: number; hint?: string }) => (
  <Tooltip label={hint} isDisabled={!hint} hasArrow>
    <Text as="span" fontWeight={value > 0 ? "semibold" : "normal"} color={value > 0 ? "text.strong" : "text.muted"}>
      {value}
    </Text>
  </Tooltip>
);

const BonusEditor = ({ raffle, player, locked }: { raffle: IGuildRaffle; player: IRafflePlayer; locked: boolean }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { addBonus, removeBonus } = useRaffleMutations();
  const [label, setLabel] = useState("");
  const [count, setCount] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setIsSaving(true);
    try {
      await action();
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Popover placement="left" isLazy>
      <PopoverTrigger>
        <Button size="xs" variant="ghost" rightIcon={locked ? undefined : <FiPlus />}>
          {player.breakdown.bonus}
        </Button>
      </PopoverTrigger>
      <PopoverContent w="280px">
        <PopoverArrow />
        <PopoverBody>
          <VStack align="stretch" spacing={2}>
            {player.bonuses.length === 0 && <Text fontSize="xs" color="text.muted">{t("pages.raffle.noBonus")}</Text>}
            {player.bonuses.map((b) => (
              <HStack key={b._id} justify="space-between">
                <Text fontSize="sm" noOfLines={1}>{b.label} · {b.count}</Text>
                {!locked && (
                  <IconButton
                    aria-label={t("pages.raffle.removeBonus")}
                    icon={<FiX />}
                    size="xs"
                    variant="ghost"
                    isDisabled={isSaving}
                    onClick={() => void run(() => removeBonus(raffle.month.key, raffle.guild._id, b._id))}
                  />
                )}
              </HStack>
            ))}
            {!locked && (
              <HStack>
                <Input size="sm" placeholder={t("pages.raffle.bonusLabel")} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} />
                <NumberInput size="sm" w="70px" min={1} max={20} value={count} onChange={(_, n) => setCount(Number.isNaN(n) ? 1 : n)}>
                  <NumberInputField px={2} />
                </NumberInput>
                <IconButton
                  aria-label={t("pages.raffle.addBonus")}
                  icon={<FiPlus />}
                  size="sm"
                  colorScheme="purple"
                  isLoading={isSaving}
                  isDisabled={!label.trim()}
                  onClick={() => void run(async () => {
                    await addBonus(raffle.month.key, raffle.guild._id, player, label.trim(), count);
                    setLabel("");
                    setCount(1);
                  })}
                />
              </HStack>
            )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const SeniorityEditor = ({ raffle, player }: { raffle: IGuildRaffle; player: IRafflePlayer }) => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const { setSchriftSince } = useRaffleMutations();
  const [value, setValue] = useState(player.schrift_since?.slice(0, 7) ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const save = async (since: string | null) => {
    setIsSaving(true);
    try {
      await setSchriftSince(raffle.guild._id, player.bbs_id, since);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Popover placement="left" isLazy>
      <PopoverTrigger>
        <Button size="xs" variant="ghost">
          {player.breakdown.seniority}
          <Text as="span" fontSize="2xs" color="text.muted" ml={1}>({t("pages.raffle.years", { count: player.years })})</Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent w="260px">
        <PopoverArrow />
        <PopoverBody>
          <VStack align="stretch" spacing={2}>
            <Text fontSize="xs" color="text.muted">
              {player.first_seen
                ? t("pages.raffle.firstSeen", { date: new Date(player.first_seen).toLocaleDateString(i18n.language, { month: "long", year: "numeric" }) })
                : t("pages.raffle.firstSeenUnknown")}
            </Text>
            <Text fontSize="sm" fontWeight="semibold">{t("pages.raffle.schriftSince")}</Text>
            <HStack>
              <Input size="sm" type="month" value={value} onChange={(e) => setValue(e.target.value)} />
              <Button size="sm" colorScheme="purple" isLoading={isSaving} isDisabled={!value} onClick={() => void save(value)}>OK</Button>
            </HStack>
            {player.schrift_since && (
              <Button size="xs" variant="ghost" isDisabled={isSaving} onClick={() => { setValue(""); void save(null); }}>
                {t("pages.raffle.clearSince")}
              </Button>
            )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const PeriodBoxes = ({ raffle, player, kind, locked }: { raffle: IGuildRaffle; player: IRafflePlayer; kind: "farm" | "qg"; locked: boolean }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { setGuildLife } = useRaffleMutations();
  const checked = kind === "farm" ? player.farm_periods : player.qg_periods;

  const toggle = async (period: number, value: boolean) => {
    try {
      await setGuildLife(raffle.month.key, raffle.guild._id, player, kind, period, value);
    } catch (err) {
      toast({ status: "error", title: (err as Error).message });
    }
  };

  return (
    <HStack spacing={2}>
      {[1, 2].map((period) => (
        <Tooltip key={period} label={t("pages.raffle.period", { count: period })} hasArrow>
          <Box>
            <Checkbox
              colorScheme="purple"
              isChecked={checked.includes(period)}
              isDisabled={locked}
              onChange={(e) => void toggle(period, e.target.checked)}
              aria-label={`${t(`pages.raffle.col.${kind}`)} ${t("pages.raffle.period", { count: period })}`}
            />
          </Box>
        </Tooltip>
      ))}
    </HStack>
  );
};

// Every player of the guild with the detail of their tickets; leaders edit the manual ones in place
export const RaffleTable = ({ raffle }: { raffle: IGuildRaffle }) => {
  const { t } = useTranslation();
  // Tickets are frozen once drawn
  const locked = raffle.draw !== null;
  const { rules } = raffle;

  const homogeneityHint = (p: IRafflePlayer) => (p.worst_gap === null
    ? t("pages.raffle.hint.homogeneityMissing")
    : t("pages.raffle.hint.homogeneity", { gap: formatScore(Math.abs(p.worst_gap)), side: p.worst_gap > 0 ? t("pages.raffle.below") : t("pages.raffle.above") }));

  return (
    <Box overflowX="auto" bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="xl">
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>{t("pages.raffle.col.player")}</Th>
            <Th isNumeric>{t("pages.raffle.col.tickets")}</Th>
            <Th isNumeric title={t("pages.raffle.hint.top5Rotations", { max: rules.maxRotationTopTickets })}>{t("pages.raffle.col.top5Rotations")}</Th>
            <Th isNumeric>{t("pages.raffle.col.top5Month")}</Th>
            <Th isNumeric>{t("pages.raffle.col.homogeneity")}</Th>
            <Th isNumeric>{t("pages.raffle.col.seniority")}</Th>
            <Th isNumeric>{t("pages.raffle.col.collective")}</Th>
            <Th>{t("pages.raffle.col.farm")}</Th>
            <Th>{t("pages.raffle.col.qg")}</Th>
            <Th isNumeric>{t("pages.raffle.col.bonus")}</Th>
            <Th isNumeric>{t("pages.raffle.col.chance")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {raffle.players.map((p) => {
            const name = p.bbs_name || p.global_name || p.bbs_id;
            const avatarUrl = p.avatar && p.discord_id ? getUserAvatarUrl({ discord_id: p.discord_id, avatar: p.avatar }) || undefined : undefined;
            const isWinner = raffle.draw?.winner.bbs_id === p.bbs_id;
            const chance = raffle.total_tickets > 0 ? (p.tickets / raffle.total_tickets) * 100 : 0;
            return (
              <Tr key={p.bbs_id} bg={isWinner ? "rgba(236, 201, 75, 0.15)" : undefined}>
                <Td>
                  <HStack spacing={2} minW="160px">
                    <Avatar size="xs" src={avatarUrl} name={name} />
                    <CustomLink to={buildPlayerUrl(p.bbs_name ?? "", p.bbs_id)} text={name} textSize="sm" sx={{ fontWeight: "medium" }} />
                    {isWinner && <Badge colorScheme="yellow">🏆</Badge>}
                  </HStack>
                </Td>
                <Td isNumeric>
                  <Tooltip label={t("pages.raffle.hint.capped", { earned: p.earned, max: raffle.max_tickets })} isDisabled={p.earned <= p.tickets} hasArrow>
                    <Badge colorScheme={p.tickets > 0 ? "purple" : "gray"} fontSize="sm" px={2}>
                      {p.tickets}{p.earned > p.tickets ? "*" : ""}
                    </Badge>
                  </Tooltip>
                </Td>
                <Td isNumeric><Count value={p.breakdown.top5_rotations} /></Td>
                <Td isNumeric><Count value={p.breakdown.top5_month} /></Td>
                <Td isNumeric><Count value={p.breakdown.homogeneity} hint={homogeneityHint(p)} /></Td>
                <Td isNumeric>
                  {locked ? <Count value={p.breakdown.seniority} hint={t("pages.raffle.years", { count: p.years })} /> : <SeniorityEditor raffle={raffle} player={p} />}
                </Td>
                <Td isNumeric><Count value={p.breakdown.rank + p.breakdown.collective_gap} /></Td>
                <Td><PeriodBoxes raffle={raffle} player={p} kind="farm" locked={locked} /></Td>
                <Td><PeriodBoxes raffle={raffle} player={p} kind="qg" locked={locked} /></Td>
                <Td isNumeric>
                  <BonusEditor raffle={raffle} player={p} locked={locked} />
                </Td>
                <Td isNumeric><Text fontSize="xs" color="text.muted">{chance.toFixed(1)} %</Text></Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};
