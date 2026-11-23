import { useState } from "react";
import { Badge, Box, Button, Flex, Grid, HStack, SimpleGrid, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { AttackButton, AttackShape, IAttackStep, IGameAttacks, IStatusBonus } from "@/interfaces";
import { gameText } from "@/utils/gameText";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { AttackArea } from "./AttackArea";
import { AttackButtonIcon } from "./AttackButtonIcon";

const BUTTONS: AttackButton[] = ["normal", "heavy1", "heavy2", "heavy3", "ex", "extra_action"];
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

// Stats a buff raises, with their label key
const BUFF_STATS = [["atk", "stats.atk"], ["def", "stats.def"], ["crt", "stats.cct"], ["sp", "stats.pre"]] as const;

const seconds = (ms: number | null, decimals = 1) => (ms ? `${Math.round(ms / 10 ** (3 - decimals)) / 10 ** decimals}\u00a0s` : "—");

const Tile = ({ label, value, extra = [] }: { label: string; value: string; extra?: string[] }) => (
  <Box bg="bg.subtle" borderRadius="lg" px={3} py={2} minW={0}>
    <Text fontSize="2xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" letterSpacing="wide" noOfLines={1}>{label}</Text>
    <Text fontSize="lg" fontWeight="bold" color="text.strong" lineHeight={1.3}>{value}</Text>
    {extra.map((line) => <Text key={line} fontSize="2xs" color="text.secondary">{line}</Text>)}
  </Box>
);

const SubTitle = ({ children }: { children: React.ReactNode }) => (
  <Text fontSize="2xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" letterSpacing="wide" mb={1}>{children}</Text>
);

// Attacks of a unit: one tab per attack button, and the selected attack in one panel (area drawing, key figures,
// effects and the hits in order)
export const CharacterAttacks = ({ attacks }: { attacks: IGameAttacks }) => {
  const { t, i18n } = useTranslation();
  const buttons = BUTTONS.filter((button) => attacks[button]);
  const [selected, setSelected] = useState<AttackButton | null>(null);
  const button = selected && attacks[selected] ? selected : buttons[0];
  if (!button) return null;

  const shapeLabel = (shape: AttackShape | null) => {
    if (!shape) return "—";
    switch (shape.kind) {
      case "sector": return (shape.angle ?? 360) < 360
        ? t("components.characterAttacks.sector", { angle: shape.angle, radius: shape.radius })
        : t("components.characterAttacks.around", { radius: shape.radius });
      case "rect": return t("components.characterAttacks.rect", { width: shape.width, length: shape.length });
      case "circle": return t("components.characterAttacks.ahead", { radius: shape.radius, distance: shape.distance });
      case "projectile": return shape.width && shape.length
        ? t("components.characterAttacks.projectileSized", { width: shape.width, length: shape.length, range: shape.range ?? "—" })
        : t("components.characterAttacks.projectile", { range: shape.range ?? shape.length });
    }
  };

  const conditionLabel = ({ belong, affinity }: IStatusBonus["conditional"][number]) => [belong?.join(", "), affinity].filter(Boolean).join(" · ")
    || t("components.characterAttacks.anyEnemy");

  const { cooldown, hits, steps, range_bonus: rangeBonus, hit_bonus: hitBonus, status_bonus: statusBonus, buff_bonus: buffBonus } = attacks[button]!;
  const traps = steps.map((s) => s.trap).filter((trap): trap is NonNullable<IAttackStep["trap"]> => Boolean(trap));
  const color = steps.find((s) => s.color)?.color ?? null;
  const shapes = steps.map((s) => s.shape).filter((s): s is AttackShape => Boolean(s));
  const uniqueShapes = shapes.filter((shape, i) => shapes.findIndex((other) => JSON.stringify(other) === JSON.stringify(shape)) === i);

  // Statuses of the hit most likely to inflict them, with the unit's own abilities
  const mainStatus = steps.filter((s) => s.statuses.length > 0).sort((a, b) => (b.status_probability ?? 0) - (a.status_probability ?? 0))[0] ?? null;
  const statusLine = mainStatus?.statuses.map((status) => `${gameText(status.name, i18n.language)}${status.plus ? " +" : ""}`).join(" · ") ?? null;
  const chance = mainStatus?.status_probability ? mainStatus.status_probability + (statusBonus?.probability ?? 0) : null;
  const duration = mainStatus?.status_duration ? mainStatus.status_duration + (statusBonus?.duration ?? 0) : null;

  const totalHits = hits ?? (steps.every((s) => s.hits !== null) ? steps.reduce((sum, s) => sum + (s.hits ?? 0), 0) : null);
  const maxPower = Math.max(1, ...steps.map((s) => s.power ?? 0));
  const heal = steps.find((s) => s.heal)?.heal;
  const buff = steps.find((s) => s.buff)?.buff ?? null;
  const buffStats = buff ? BUFF_STATS.filter(([key]) => (buff[key] ?? 0) !== 0) : [];

  const chips: { label: string; scheme: string }[] = [
    ...(statusLine ? [{ label: statusLine, scheme: "purple" }] : []),
    ...(steps.some((s) => s.knockdown) ? [{ label: t("components.characterAttacks.knockdown"), scheme: "orange" }] : []),
    ...(heal ? [{ label: t("components.characterAttacks.heal", { value: heal }), scheme: "green" }] : []),
    ...(steps.some((s) => s.barrier) ? [{ label: t("components.characterAttacks.barrier"), scheme: "orange" }] : []),
    ...(steps.some((s) => s.revival) ? [{ label: t("components.characterAttacks.revival"), scheme: "orange" }] : []),
    ...(rangeBonus ? [{ label: t("components.characterAttacks.rangeBonus", { value: rangeBonus }), scheme: "teal" }] : []),
    ...(hitBonus ? [{ label: t("components.characterAttacks.hitBonus", { count: hitBonus }), scheme: "teal" }] : []),
  ];

  return (
    <Box>
      {/* One tab per attack button; scrolls sideways on phones */}
      <Flex
        role="group"
        aria-label={t("components.characterAttacks.pick")}
        gap={1}
        p={1}
        bg="bg.subtle"
        borderRadius="xl"
        overflowX="auto"
        wrap={{ base: "nowrap", md: "wrap" }}
        mb={5}
      >
        {buttons.map((key) => {
          const isActive = key === button;
          return (
            <Button
              key={key}
              onClick={() => setSelected(key)}
              aria-pressed={isActive}
              variant="ghost"
              size="md"
              flexShrink={0}
              px={3}
              gap={2}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={isActive ? "blue.400" : "transparent"}
              bg={isActive ? "blue.900" : "transparent"}
              color={isActive ? "text.strong" : "text.muted"}
              _light={{ bg: isActive ? "blue.50" : "transparent" }}
              _hover={{ bg: isActive ? undefined : "bg.hover" }}
            >
              <AttackButtonIcon button={key} steps={attacks[key]!.steps} size="24px" />
              {t(`components.characterAttacks.short.${key}`)}
            </Button>
          );
        })}
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "minmax(0, 340px) minmax(0, 1fr)" }} gap={{ base: 5, md: 7 }} alignItems="start">
        <Box>
          <AttackArea key={button} shapes={uniqueShapes} color={color} />
          <Text fontSize="xs" color="text.muted" mt={2}>{t("components.characterAttacks.waveLegend")}</Text>
        </Box>

        <Box minW={0}>
          <HStack spacing={3} mb={4}>
            <AttackButtonIcon button={button} steps={steps} size="44px" />
            <Box>
              <Text fontWeight="bold" fontSize="lg" color="text.strong" lineHeight={1.2}>{t(`components.characterAttacks.buttons.${button}`)}</Text>
              {color && (
                <HStack spacing={1.5} mt={0.5}>
                  <AttackTypeBadge attackType={color} size="10px" />
                  <Text fontSize="sm" color="text.muted">{t(`attackTypes.${color}`, color)}</Text>
                </HStack>
              )}
            </Box>
          </HStack>

          <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2}>
            <Tile label={t("components.characterAttacks.cooldownLabel")} value={seconds(cooldown)} />
            <Tile
              label={t("components.characterAttacks.chance")}
              value={chance ? `${chance}\u00a0%` : "—"}
              extra={chance ? (statusBonus?.conditional ?? []).map((c) => t("components.characterAttacks.chanceAgainst", { value: chance + c.value, against: conditionLabel(c) })) : []}
            />
            <Tile label={t("components.characterAttacks.statusDuration")} value={seconds(duration)} />
            <Tile label={t("components.characterAttacks.hits")} value={totalHits ? String(totalHits) : "—"} />
          </SimpleGrid>

          {chips.length > 0 && (
            <Wrap spacing={1.5} mt={3}>
              {chips.map(({ label, scheme }) => (
                <WrapItem key={label}><Badge colorScheme={scheme} variant="subtle" textTransform="none" borderRadius="full" px={2.5} py={0.5}>{label}</Badge></WrapItem>
              ))}
            </Wrap>
          )}

          {traps.map((trap, i) => (
            <Box key={i} mt={3} px={3} py={2} borderRadius="lg" borderWidth="1px" borderColor="blue.400" bg="bg.subtle">
              <Text fontSize="2xs" fontWeight="bold" color="blue.300" _light={{ color: "blue.600" }} textTransform="uppercase" letterSpacing="wider" mb={1}>
                ◉ {t("components.characterAttacks.trap")}
              </Text>
              <SimpleGrid columns={3} spacing={2}>
                {[
                  [t("components.characterAttacks.hits"), trap.hits ?? "—"],
                  [t("components.characterAttacks.trapDuration"), seconds(trap.duration, 2)],
                  [t("components.characterAttacks.trapKind"), t(`components.characterAttacks.${trap.homing ? "trapHoming" : "trapStatic"}`)],
                ].map(([label, value]) => (
                  <Box key={String(label)}>
                    <Text fontSize="2xs" color="text.muted" textTransform="uppercase">{label}</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="text.strong">{value}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          ))}

          {buff && (
            <Box mt={3} px={3} py={2} borderRadius="lg" borderWidth="1px" borderColor="green.400" bg="bg.subtle">
              <Text fontSize="2xs" fontWeight="bold" color="green.300" _light={{ color: "green.600" }} textTransform="uppercase" letterSpacing="wider" mb={1}>
                ▲ {t("components.characterAttacks.buff")}
              </Text>
              <SimpleGrid columns={2} spacing={2}>
                <Box>
                  <Text fontSize="2xs" color="text.muted" textTransform="uppercase">{t("components.characterAttacks.buffTarget")}</Text>
                  <Text fontSize="sm" fontWeight="semibold" color="text.strong">
                    {t(`components.characterAttacks.${buff.target === 1 ? "buffSelf" : "buffTeam"}`)}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="2xs" color="text.muted" textTransform="uppercase">{t("components.characterAttacks.trapDuration")}</Text>
                  <Text fontSize="sm" fontWeight="semibold" color="text.strong">{seconds((buff.duration ?? 0) + (buffBonus ?? 0))}</Text>
                  {buffBonus && buff.duration ? (
                    <Text fontSize="2xs" color="text.secondary">{t("components.characterAttacks.buffTreeBonus", { value: buffBonus / 1000 })}</Text>
                  ) : null}
                </Box>
              </SimpleGrid>
              {buffStats.length > 0 && (
                <Wrap spacing={1} mt={2}>
                  {buffStats.map(([key, label]) => (
                    <WrapItem key={key}>
                      <Badge colorScheme="green" variant="subtle" textTransform="none">{t("components.characterAttacks.buffStat", { stat: t(label), value: buff[key] })}</Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              )}
            </Box>
          )}

          {/* Hits in order: power bar, area and number of hits */}
          <Box mt={4}>
            <SubTitle>{t("components.characterAttacks.sequence")}</SubTitle>
            {steps.map((step, i) => (
              <HStack key={i} spacing={3} py={2.5} borderTopWidth={i === 0 ? 0 : "1px"} borderColor="border.subtle" align="center">
                <Box
                  boxSize="34px"
                  flexShrink={0}
                  display="grid"
                  placeItems="center"
                  borderRadius="md"
                  bg="bg.subtle"
                  fontSize="sm"
                  fontWeight="bold"
                  color="text.strong"
                >
                  {ROMAN[(step.step ?? i + 1) - 1] ?? step.step}{step.variant > 0 ? "′" : ""}
                </Box>
                <Box flex={1} minW={0}>
                  <Box h="8px" borderRadius="full" bg="bg.subtle" overflow="hidden">
                    <Box h="100%" w={`${Math.max(4, ((step.power ?? 0) / maxPower) * 100)}%`} borderRadius="full" bg="blue.400" />
                  </Box>
                  <Text fontSize="xs" color="text.muted" mt={1} noOfLines={1}>{shapeLabel(step.shape)}</Text>
                </Box>
                <Box textAlign="right" flexShrink={0} minW="72px">
                  <Text fontWeight="bold" color="text.strong">{step.power ?? "—"}</Text>
                  <Text fontSize="xs" color="text.muted">
                    {/* The table gives the total of a vortex (magnification_sum): spread over its blasts */}
                    {step.power && (step.trap?.hits ?? 0) > 1
                      ? t("components.characterAttacks.perHit", { value: Math.round((step.power / step.trap!.hits!) * 10) / 10 })
                      : !hits && step.hits ? t("components.characterAttacks.hitCount", { count: step.hits }) : ""}
                  </Text>
                </Box>
              </HStack>
            ))}
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};
