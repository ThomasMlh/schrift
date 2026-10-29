import { Badge, Box, HStack, SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr, Wrap, WrapItem } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { AttackButton, AttackShape, IAttackStep, IGameAttacks } from "@/interfaces";
import { gameText } from "@/utils/gameText";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { AttackArea } from "./AttackArea";
import { AttackButtonIcon } from "./AttackButtonIcon";

const BUTTONS: AttackButton[] = ["normal", "heavy1", "heavy2", "heavy3", "ex", "extra_action"];
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

const seconds = (ms: number | null, decimals = 1) => (ms ? `${Math.round(ms / 10 ** (3 - decimals)) / 10 ** decimals}\u00a0s` : "—");

// Attack cards of a unit: area drawing, cooldown, statuses and, for a combo, one column per hit
export const CharacterAttacks = ({ attacks }: { attacks: IGameAttacks }) => {
  const { t, i18n } = useTranslation();
  const buttons = BUTTONS.filter((button) => attacks[button]);

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

  // Each status with its own chance (combined statuses have one each), from the hit most likely to inflict them
  const statusLine = (steps: IAttackStep[]) => {
    const step = steps.filter((s) => s.statuses.length > 0).sort((a, b) => (b.status_probability ?? 0) - (a.status_probability ?? 0))[0];
    if (!step) return null;
    return step.statuses
      .map((status) => {
        const name = `${gameText(status.name, i18n.language)}${status.plus ? " +" : ""}`;
        return status.probability ? t("components.characterAttacks.status", { name, probability: status.probability, duration: seconds(status.duration) }) : name;
      })
      .join(" · ");
  };

  const effects = (steps: IAttackStep[]) => {
    const list: string[] = [];
    if (steps.some((s) => s.knockdown)) list.push(t("components.characterAttacks.knockdown"));
    const heal = steps.find((s) => s.heal)?.heal;
    if (heal) list.push(t("components.characterAttacks.heal", { value: heal }));
    if (steps.some((s) => s.buff)) list.push(t("components.characterAttacks.buff"));
    if (steps.some((s) => s.barrier)) list.push(t("components.characterAttacks.barrier"));
    if (steps.some((s) => s.revival)) list.push(t("components.characterAttacks.revival"));
    return list;
  };

  return (
    <Box>
      <Text fontSize="xs" color="text.muted" mb={2}>{t("components.characterAttacks.waveLegend")}</Text>
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={4}>
        {buttons.map((button) => {
          const { cooldown, hits, steps, range_bonus: rangeBonus, hit_bonus: hitBonus } = attacks[button]!;
          const traps = steps.map((s) => s.trap).filter((trap): trap is NonNullable<IAttackStep["trap"]> => Boolean(trap));
          const color = steps.find((s) => s.color)?.color ?? null;
          const shapes = steps.map((s) => s.shape).filter((s): s is AttackShape => Boolean(s));
          const uniqueShapes = shapes.filter((shape, i) => shapes.findIndex((other) => JSON.stringify(other) === JSON.stringify(shape)) === i);
          const status = statusLine(steps);
          return (
            <Box key={button} bg="bg.subtle" borderRadius="xl" borderWidth="1px" borderColor="border.subtle" p={3}>
              <HStack justify="space-between" mb={2}>
                <HStack spacing={2}>
                  <AttackButtonIcon button={button} steps={steps} size="44px" />
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="text.strong">{t(`components.characterAttacks.buttons.${button}`)}</Text>
                    {color && <AttackTypeBadge attackType={color} size="10px" />}
                  </Box>
                </HStack>
                <Badge variant="subtle" colorScheme="purple" textTransform="none">
                  {t("components.characterAttacks.cooldown", { value: seconds(cooldown) })}
                </Badge>
              </HStack>

              <AttackArea shapes={uniqueShapes} color={color} />

              {status && <Text fontSize="xs" color="text.secondary" mt={2}>{status}</Text>}
              {traps.map((trap, i) => (
                <Box key={i} mt={2} px={3} py={2} borderRadius="md" borderWidth="1px" borderColor="blue.400" bg="blackAlpha.200">
                  <Text fontSize="2xs" fontWeight="bold" color="blue.300" textTransform="uppercase" letterSpacing="wider" mb={1}>
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
              {(rangeBonus || hitBonus) && (
                <Wrap spacing={1} mt={2}>
                  {rangeBonus && (
                    <WrapItem><Badge colorScheme="teal" variant="subtle" textTransform="none">{t("components.characterAttacks.rangeBonus", { value: rangeBonus })}</Badge></WrapItem>
                  )}
                  {hitBonus && (
                    <WrapItem><Badge colorScheme="teal" variant="subtle" textTransform="none">{t("components.characterAttacks.hitBonus", { count: hitBonus })}</Badge></WrapItem>
                  )}
                </Wrap>
              )}
              {effects(steps).length > 0 && (
                <Wrap spacing={1} mt={2}>
                  {effects(steps).map((effect) => (
                    <WrapItem key={effect}><Badge colorScheme="orange" variant="subtle" textTransform="none">{effect}</Badge></WrapItem>
                  ))}
                </Wrap>
              )}

              <Table size="sm" variant="simple" mt={2}>
                {steps.length > 1 && (
                  <Thead>
                    <Tr>
                      <Th px={1} />
                      {steps.map((step, i) => (
                        <Th key={i} px={1} textAlign="center" textTransform="none">
                          {ROMAN[(step.step ?? i + 1) - 1] ?? step.step}{step.variant > 0 ? "\u2032" : ""}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                )}
                <Tbody>
                  <Tr>
                    <Td px={1} fontSize="xs" color="text.muted">{t("components.characterAttacks.power")}</Td>
                    {steps.map((step, i) => <Td key={i} px={1} textAlign="center" fontWeight="semibold">{step.power ?? "—"}</Td>)}
                  </Tr>
                  <Tr>
                    <Td px={1} fontSize="xs" color="text.muted">{t("components.characterAttacks.hits")}</Td>
                    {hits
                      ? <Td px={1} textAlign="center" colSpan={steps.length}>{hits}</Td>
                      : steps.map((step, i) => <Td key={i} px={1} textAlign="center">{step.hits ?? "—"}</Td>)}
                  </Tr>
                  <Tr>
                    <Td px={1} fontSize="xs" color="text.muted" borderBottom="none">{t("components.characterAttacks.area")}</Td>
                    {steps.map((step, i) => <Td key={i} px={1} textAlign="center" fontSize="2xs" borderBottom="none">{shapeLabel(step.shape)}</Td>)}
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};
