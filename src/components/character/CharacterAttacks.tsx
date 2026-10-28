import { Badge, Box, HStack, SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr, Wrap, WrapItem } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { AttackButton, AttackShape, IAttackStep, IGameAttacks } from "@/interfaces";
import { gameText } from "@/utils/gameText";
import { AttackTypeBadge } from "@/components/ui/AttackTypeBadge";
import { shapeReach } from "@/utils/attackShape";
import { AttackArea } from "./AttackArea";
import { AttackButtonIcon } from "./AttackButtonIcon";

const BUTTONS: AttackButton[] = ["normal", "heavy1", "heavy2", "heavy3", "ex", "extra_action"];
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

const seconds = (ms: number | null) => (ms ? `${Math.round(ms / 100) / 10}\u00a0s` : "—");

// Attack cards of a unit: area drawing, cooldown, statuses and, for a combo, one column per hit
export const CharacterAttacks = ({ attacks }: { attacks: IGameAttacks }) => {
  const { t, i18n } = useTranslation();
  const buttons = BUTTONS.filter((button) => attacks[button]);
  // Same scale for every attack of the character
  const reach = Math.max(...buttons.flatMap((button) => attacks[button]!.steps.map((step) => shapeReach(step.shape))), 0);

  const shapeLabel = (shape: AttackShape | null) => {
    if (!shape) return "—";
    switch (shape.kind) {
      case "sector": return (shape.angle ?? 360) < 360
        ? t("components.characterAttacks.sector", { angle: shape.angle, radius: shape.radius })
        : t("components.characterAttacks.around", { radius: shape.radius });
      case "rect": return t("components.characterAttacks.rect", { width: shape.width, length: shape.length });
      case "circle": return t("components.characterAttacks.ahead", { radius: shape.radius, distance: shape.distance });
      case "projectile": return t("components.characterAttacks.projectile", { range: shape.range ?? shape.length });
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
    if (steps.some((s) => s.trap)) list.push(t("components.characterAttacks.trap"));
    return list;
  };

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={4}>
      {buttons.map((button) => {
        const { cooldown, steps } = attacks[button]!;
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

            <AttackArea shapes={uniqueShapes} reach={reach} color={color} />

            {status && <Text fontSize="xs" color="text.secondary" mt={2}>{status}</Text>}
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
                  {steps.map((step, i) => <Td key={i} px={1} textAlign="center">{step.hits}</Td>)}
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
  );
};
