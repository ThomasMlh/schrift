import {
  Badge, Box, Button, Flex, Grid, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
  NumberInput, NumberInputField, Progress, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Tab, Table, TabList,
  TabPanel, TabPanels, Tabs, Tbody, Td, Text, Th, Thead, Tr, useColorMode, useDisclosure, VStack,
} from "@chakra-ui/react";
import type { ButtonProps } from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiInfo } from "react-icons/fi";
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceDot, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  CLEAR_SCORE, EX_BONUS_MAX, EX_TIME_LIMIT, LEADER_BONUS_MAX, POINTS_PER_SECOND, SUBS_BONUS_MAX, TIME_BONUS_MAX,
  lossInSeconds, scoreBreakdown, staminaBonus, timeBonus,
} from "@/utils/questScore";
import type { QuestRun } from "@/utils/questScore";

// Checked for contrast and color blindness on the light (#FFFFFF) and dark (#171D2B) surfaces
const COLORS = {
  light: { curve: "#6D4DFF", point: "#C97A06", subs: "#2F6FE4", zone: "#C2410C" },
  dark: { curve: "#8B6CFF", point: "#C98418", subs: "#5B8FF0", zone: "#F08A4B" },
};

// The guild leader's example: 55 s before the EX, 45 s left in EX, leader full, subs at 50 % on average
const EXAMPLE: QuestRun = { normalSeconds: 55, exSeconds: 45, leader: 100, subs: 50 };

// Thresholds below which the guild advises restarting
const EX_RESTART_BELOW = 30;
const STAMINA_RESTART_BELOW = 80;

const useLocale = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";
  return {
    points: (value: number) => Math.round(value).toLocaleString(locale),
    decimal: (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 3 }),
  };
};

const usePalette = () => {
  const { colorMode } = useColorMode();
  const dark = colorMode === "dark";
  return {
    ...COLORS[dark ? "dark" : "light"],
    axis: dark ? "#8B93A7" : "#6B7388",
    grid: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)",
  };
};

const FormulaPart = ({ label, value, formula, bonus }: { label: string; value: string; formula: string; bonus?: boolean }) => (
  <Grid
    templateColumns="1fr auto"
    columnGap={4}
    rowGap={1}
    px={3.5}
    py={2.5}
    bg="bg.subtle"
    borderRadius="lg"
    borderLeftWidth="3px"
    borderLeftColor={bonus ? "accent" : "border.strong"}
  >
    <Text fontWeight="bold" fontSize="sm" color="text.strong">{label}</Text>
    <Text fontWeight="bold" fontSize="sm" sx={{ fontVariantNumeric: "tabular-nums" }}>{value}</Text>
    <Text gridColumn="1 / -1" fontFamily="mono" fontSize="xs" color="text.muted">{formula}</Text>
  </Grid>
);

const FormulaTab = () => {
  const { t } = useTranslation();
  const { points } = useLocale();
  const palette = usePalette();
  const share = [
    { key: "shareTime", value: TIME_BONUS_MAX, color: palette.curve },
    { key: "shareLeader", value: LEADER_BONUS_MAX, color: palette.point },
    { key: "shareSubs", value: SUBS_BONUS_MAX, color: palette.subs },
  ];
  return (
    <VStack align="stretch" spacing={5}>
      <VStack align="stretch" spacing={2}>
        <FormulaPart label={t("components.scoreFormula.clear")} value={points(CLEAR_SCORE)} formula={t("components.scoreFormula.clearFormula")} />
        <FormulaPart
          label={t("components.scoreFormula.normalTime")}
          value={t("components.scoreFormula.perSecond", { value: points(POINTS_PER_SECOND) })}
          formula={t("components.scoreFormula.normalTimeFormula")}
        />
        <FormulaPart
          bonus
          label={t("components.scoreFormula.exTime")}
          value={t("components.scoreFormula.max", { value: points(TIME_BONUS_MAX) })}
          formula={`${points(TIME_BONUS_MAX)} × (1 − (1 − t / ${EX_TIME_LIMIT})³)`}
        />
        <FormulaPart
          bonus
          label={t("components.scoreFormula.leader")}
          value={t("components.scoreFormula.max", { value: points(LEADER_BONUS_MAX) })}
          formula={t("components.scoreFormula.leaderFormula", { max: points(LEADER_BONUS_MAX) })}
        />
        <FormulaPart
          bonus
          label={t("components.scoreFormula.subs")}
          value={t("components.scoreFormula.max", { value: points(SUBS_BONUS_MAX) })}
          formula={t("components.scoreFormula.subsFormula", { max: points(SUBS_BONUS_MAX) })}
        />
      </VStack>

      <Box>
        <Text fontSize="sm" fontWeight="bold" mb={2}>{t("components.scoreFormula.shareTitle", { max: points(EX_BONUS_MAX) })}</Text>
        <Flex h="10px" borderRadius="md" overflow="hidden">
          {share.map((s) => <Box key={s.key} w={`${(s.value / EX_BONUS_MAX) * 100}%`} bg={s.color} />)}
        </Flex>
        <HStack spacing={4} mt={2} flexWrap="wrap" fontSize="xs" color="text.muted">
          {share.map((s) => (
            <HStack key={s.key} spacing={1.5}>
              <Box w={2.5} h={2.5} borderRadius="sm" bg={s.color} />
              <Text>{t(`components.scoreFormula.${s.key}`, { value: Math.round((s.value / EX_BONUS_MAX) * 100) })}</Text>
            </HStack>
          ))}
        </HStack>
      </Box>

      <VStack as="ul" align="stretch" spacing={1} pl={5} fontSize="sm" color="text.muted">
        <li>{t("components.scoreFormula.noteRounding")}</li>
        <li>{t("components.scoreFormula.noteSubs")}</li>
        <li>{t("components.scoreFormula.noteWeight", { value: points(POINTS_PER_SECOND) })}</li>
      </VStack>
      <Text fontSize="xs" color="text.muted">{t("components.scoreFormula.credit")}</Text>
    </VStack>
  );
};

const parseDecimal = (text: string) => Number(text.replace(",", "."));

// The text is kept apart from the value so decimals typed by hand (45,25 or 49.498) are never reformatted
const RunField = ({ id, label, unit, value, max, onChange }: {
  id: string; label: string; unit: string; value: number; max: number; onChange: (value: number) => void;
}) => {
  const [text, setText] = useState(String(value));
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    if (parseDecimal(text) !== value) setText(String(value));
  }
  const commit = (next: number) => {
    const clamped = Math.min(max, Math.max(0, next));
    setSynced(clamped);
    onChange(clamped);
  };

  return (
    <Box>
      <Flex justify="space-between" mb={1}>
        <Text as="label" htmlFor={id} fontSize="sm" fontWeight="semibold">{label}</Text>
        <Text fontSize="xs" color="text.muted">{unit}</Text>
      </Flex>
      <Grid templateColumns="1fr 96px" gap={3} alignItems="center">
        <Slider
          aria-label={label}
          min={0}
          max={max}
          step={0.1}
          value={value}
          onChange={(next) => { setText(String(next)); commit(next); }}
          colorScheme="purple"
          focusThumbOnChange={false}
        >
          <SliderTrack><SliderFilledTrack /></SliderTrack>
          <SliderThumb />
        </Slider>
        <NumberInput
          id={id}
          size="sm"
          min={0}
          max={max}
          step={0.1}
          value={text}
          inputMode="decimal"
          clampValueOnBlur={false}
          isValidCharacter={(char) => /^[0-9.,]$/.test(char)}
          pattern="[0-9]*[.,]?[0-9]*"
          onChange={(next) => {
            setText(next);
            const number = parseDecimal(next);
            if (next !== "" && Number.isFinite(number)) commit(number);
          }}
          onBlur={() => setText(String(value))}
        >
          <NumberInputField sx={{ fontVariantNumeric: "tabular-nums" }} />
        </NumberInput>
      </Grid>
    </Box>
  );
};

const CalculatorTab = ({ run, onChange }: { run: QuestRun; onChange: (run: QuestRun) => void }) => {
  const { t } = useTranslation();
  const { points, decimal } = useLocale();
  const { parts, exBonus, total } = scoreBreakdown(run);
  const set = (key: keyof QuestRun) => (value: number) => onChange({ ...run, [key]: value });
  const seconds = t("components.scoreFormula.unitSeconds");
  const percent = t("components.scoreFormula.unitPercent");

  const rows = [
    { label: t("components.scoreFormula.clear"), value: parts.clear },
    { label: t("components.scoreFormula.rowNormalTime", { value: decimal(run.normalSeconds) }), value: parts.normalTime },
    { label: t("components.scoreFormula.rowExTime", { value: decimal(run.exSeconds) }), value: parts.exTime, max: TIME_BONUS_MAX },
    { label: t("components.scoreFormula.rowLeader", { value: decimal(run.leader) }), value: parts.leader, max: LEADER_BONUS_MAX },
    { label: t("components.scoreFormula.rowSubs", { value: decimal(run.subs) }), value: parts.subs, max: SUBS_BONUS_MAX },
  ];

  return (
    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
      <VStack align="stretch" spacing={4}>
        <RunField id="score-normal" label={t("components.scoreFormula.fieldNormal")} unit={seconds} value={run.normalSeconds} max={90} onChange={set("normalSeconds")} />
        <RunField id="score-ex" label={t("components.scoreFormula.fieldEx")} unit={seconds} value={run.exSeconds} max={EX_TIME_LIMIT} onChange={set("exSeconds")} />
        <RunField id="score-leader" label={t("components.scoreFormula.fieldLeader")} unit={percent} value={run.leader} max={100} onChange={set("leader")} />
        <RunField id="score-subs" label={t("components.scoreFormula.fieldSubs")} unit={percent} value={run.subs} max={100} onChange={set("subs")} />
        <Button size="xs" variant="ghost" alignSelf="flex-start" onClick={() => onChange(EXAMPLE)}>
          {t("components.scoreFormula.resetExample")}
        </Button>
      </VStack>

      <VStack align="stretch" spacing={3} bg="bg.subtle" borderRadius="xl" p={4}>
        <Box>
          <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color="text.muted">
            {t("components.scoreFormula.estimated")}
          </Text>
          <Text fontSize="3xl" fontWeight="extrabold" color="text.strong" sx={{ fontVariantNumeric: "tabular-nums" }}>{points(total)}</Text>
        </Box>
        {rows.map((row) => (
          <Box key={row.label} fontSize="sm">
            <Flex justify="space-between" gap={3}>
              <Text>{row.label}</Text>
              <Text fontWeight="bold" sx={{ fontVariantNumeric: "tabular-nums" }}>{points(row.value)}</Text>
            </Flex>
            {row.max && (
              <>
                <Progress value={(row.value / row.max) * 100} size="xs" colorScheme="purple" borderRadius="full" mt={1} />
                <Text fontSize="xs" color="text.muted" mt={0.5}>
                  {row.value >= row.max
                    ? t("components.scoreFormula.maxReached")
                    : t("components.scoreFormula.loss", { points: points(row.max - row.value), seconds: decimal(lossInSeconds(row.max - row.value)) })}
                </Text>
              </>
            )}
          </Box>
        ))}
        <Box fontSize="sm" bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="md" px={3} py={2}>
          {t("components.scoreFormula.exSummary", {
            value: points(exBonus),
            max: points(EX_BONUS_MAX),
            seconds: decimal(lossInSeconds(EX_BONUS_MAX - exBonus)),
          })}
        </Box>
      </VStack>
    </Grid>
  );
};

const BonusCurve = ({ title, formula, max, unit, fn, value, restartBelow }: {
  title: string; formula: string; max: number; unit: string; fn: (x: number) => number; value: number; restartBelow: number;
}) => {
  const { t } = useTranslation();
  const { points, decimal } = useLocale();
  const palette = usePalette();
  const data = Array.from({ length: 141 }, (_, i) => {
    const x = (i / 140) * max;
    return { x, y: fn(x) };
  });
  const yMax = fn(max);
  const compact = (v: number) => (v >= 1_000_000 ? `${decimal(v / 1_000_000)} M` : `${Math.round(v / 1000)} k`);

  return (
    <Box borderWidth="1px" borderColor="border.subtle" borderRadius="xl" px={4} pt={3} pb={1}>
      <Flex justify="space-between" align="baseline" gap={3} flexWrap="wrap">
        <Text fontWeight="bold" fontSize="sm" color="text.strong">{title}</Text>
        <Text fontSize="sm" sx={{ fontVariantNumeric: "tabular-nums" }}>
          {decimal(value)}{unit} → <Text as="span" fontWeight="bold" color={palette.point}>{points(fn(value))}</Text>
        </Text>
      </Flex>
      <Text fontFamily="mono" fontSize="xs" color="text.muted">{formula}</Text>
      <Box h="180px" mt={2}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={palette.grid} vertical={false} />
            <ReferenceArea
              x1={0}
              x2={restartBelow}
              fill={palette.zone}
              fillOpacity={0.08}
              stroke="none"
              label={{ value: t("components.scoreFormula.restartZone"), position: "insideTopLeft", fill: palette.zone, fontSize: 11, fontWeight: 600 }}
            />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, max]}
              tickCount={max === EX_TIME_LIMIT ? 8 : 6}
              tickFormatter={(v: number) => `${v}${unit}`}
              tick={{ fontSize: 10, fill: palette.axis }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis domain={[0, yMax]} tickFormatter={compact} tick={{ fontSize: 10, fill: palette.axis }} tickLine={false} axisLine={false} width={48} />
            <Line type="monotone" dataKey="y" stroke={palette.curve} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <ReferenceDot x={value} y={fn(value)} r={6} fill={palette.point} stroke="var(--chakra-colors-bg-card)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

const CurvesTab = ({ run }: { run: QuestRun }) => {
  const { t } = useTranslation();
  const { points } = useLocale();
  const seconds = ` ${t("components.scoreFormula.unitSecondsShort")}`;
  return (
    <VStack align="stretch" spacing={4}>
      <Text fontSize="sm" color="text.muted">{t("components.scoreFormula.curvesHint")}</Text>
      <BonusCurve
        title={t("components.scoreFormula.exTime")}
        formula={`${points(TIME_BONUS_MAX)} × (1 − (1 − t / ${EX_TIME_LIMIT})³)`}
        max={EX_TIME_LIMIT}
        unit={seconds}
        fn={timeBonus}
        value={run.exSeconds}
        restartBelow={EX_RESTART_BELOW}
      />
      <BonusCurve
        title={t("components.scoreFormula.leader")}
        formula={t("components.scoreFormula.leaderFormula", { max: points(LEADER_BONUS_MAX) })}
        max={100}
        unit=" %"
        fn={(v) => staminaBonus(LEADER_BONUS_MAX, v)}
        value={run.leader}
        restartBelow={STAMINA_RESTART_BELOW}
      />
      <BonusCurve
        title={t("components.scoreFormula.subs")}
        formula={t("components.scoreFormula.subsFormula", { max: points(SUBS_BONUS_MAX) })}
        max={100}
        unit=" %"
        fn={(v) => staminaBonus(SUBS_BONUS_MAX, v)}
        value={run.subs}
        restartBelow={STAMINA_RESTART_BELOW}
      />
    </VStack>
  );
};

const WEIGHTS = [
  { below: 0.5, key: "weightLow", scheme: "green" },
  { below: 2, key: "weightMedium", scheme: "orange" },
  { below: Infinity, key: "weightHigh", scheme: "red" },
];

const RestartTab = () => {
  const { t } = useTranslation();
  const { points, decimal } = useLocale();
  const cases = [
    ...[50, 40, 30, 20].map((s) => ({ label: t("components.scoreFormula.caseEx", { value: s }), loss: TIME_BONUS_MAX - timeBonus(s) })),
    ...[90, 80, 50].map((p) => ({ label: t("components.scoreFormula.caseLeader", { value: p }), loss: LEADER_BONUS_MAX - staminaBonus(LEADER_BONUS_MAX, p) })),
    { label: t("components.scoreFormula.caseSubDown"), loss: SUBS_BONUS_MAX - staminaBonus(SUBS_BONUS_MAX, 50) },
  ];
  return (
    <VStack align="stretch" spacing={4}>
      <Box borderLeftWidth="3px" borderLeftColor="accent" bg="bg.subtle" px={3.5} py={2.5} borderRightRadius="lg" fontSize="sm">
        {t("components.scoreFormula.restartIntro", { value: points(POINTS_PER_SECOND) })}
      </Box>
      <Box overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>{t("components.scoreFormula.colCase")}</Th>
              <Th isNumeric>{t("components.scoreFormula.colLoss")}</Th>
              <Th isNumeric>{t("components.scoreFormula.colSeconds")}</Th>
              <Th>{t("components.scoreFormula.colWeight")}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {cases.map((c) => {
              const seconds = lossInSeconds(c.loss);
              const weight = WEIGHTS.find((w) => seconds < w.below) ?? WEIGHTS[WEIGHTS.length - 1];
              return (
                <Tr key={c.label}>
                  <Td whiteSpace="nowrap">{c.label}</Td>
                  <Td isNumeric sx={{ fontVariantNumeric: "tabular-nums" }}>−{points(c.loss)}</Td>
                  <Td isNumeric sx={{ fontVariantNumeric: "tabular-nums" }}>{decimal(seconds)} {t("components.scoreFormula.unitSecondsShort")}</Td>
                  <Td><Badge colorScheme={weight.scheme} borderRadius="full" px={2}>{t(`components.scoreFormula.${weight.key}`)}</Badge></Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
      <VStack as="ul" align="stretch" spacing={1} pl={5} fontSize="sm" color="text.muted">
        <li>{t("components.scoreFormula.adviceEx", { value: EX_RESTART_BELOW })}</li>
        <li>{t("components.scoreFormula.adviceStamina", { value: STAMINA_RESTART_BELOW })}</li>
      </VStack>
    </VStack>
  );
};

export const ScoreFormulaModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const [run, setRun] = useState<QuestRun>(EXAMPLE);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" overflow="hidden">
        <ModalHeader borderBottomWidth="1px" borderColor="border.subtle" pb={3}>
          <Text fontSize="xl" fontWeight="extrabold" color="text.strong">{t("components.scoreFormula.title")}</Text>
          <Text fontSize="sm" fontWeight="normal" color="text.muted">{t("components.scoreFormula.subtitle")}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody px={0} pt={0} pb={4}>
          <Tabs colorScheme="purple" isLazy>
            <TabList px={{ base: 2, md: 4 }} overflowX="auto" overflowY="hidden">
              {["tabFormula", "tabCalculator", "tabCurves", "tabRestart"].map((key) => (
                <Tab key={key} fontWeight="semibold" fontSize="sm" whiteSpace="nowrap">{t(`components.scoreFormula.${key}`)}</Tab>
              ))}
            </TabList>
            <TabPanels>
              <TabPanel px={{ base: 4, md: 6 }} pt={5}><FormulaTab /></TabPanel>
              <TabPanel px={{ base: 4, md: 6 }} pt={5}><CalculatorTab run={run} onChange={setRun} /></TabPanel>
              <TabPanel px={{ base: 4, md: 6 }} pt={5}><CurvesTab run={run} /></TabPanel>
              <TabPanel px={{ base: 4, md: 6 }} pt={5}><RestartTab /></TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Opens the score explanation; shown on the rotation page and the builds guide
export const ScoreFormulaButton = (props: ButtonProps) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button size="sm" variant="outline" colorScheme="purple" leftIcon={<FiInfo />} flexShrink={0} onClick={onOpen} {...props}>
        {t("components.scoreFormula.button")}
      </Button>
      <ScoreFormulaModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};
