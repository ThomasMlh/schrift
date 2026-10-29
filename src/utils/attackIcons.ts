import type { AttackButton, IAttackStep } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";

// Attack button pieces of the game interface (Atlas_QuestBattle), copied to the bucket
const ICON_URL = `${bucketUrl}/game-ui/attacks`;
export const attackIconUrl = (name: string) => `${ICON_URL}/${name}.png`;

// Weapon icons the game has: "<weapon>_<button>"
const WEAPON_ICONS = new Set([
  "10_heavy3",
  "10_special1",
  "11_heavy3",
  "11_skill1",
  "1_heavy1",
  "1_heavy2",
  "1_heavy3",
  "1_normal",
  "2_heavy1",
  "2_heavy2",
  "2_heavy3",
  "2_normal",
  "3_heavy1",
  "3_heavy2",
  "3_heavy3",
  "3_normal",
  "4_heavy1",
  "4_heavy2",
  "4_heavy3",
  "4_normal",
  "5_heavy1",
  "5_heavy2",
  "5_heavy3",
  "5_normal",
  "6_heavy1",
  "6_heavy2",
  "6_heavy3",
  "6_heavy4",
  "7_heavy1",
  "7_heavy2",
  "7_heavy3",
  "8_heavy3",
  "9_heavy3",
]);
const STATUS_CODES = new Set(["brn", "cnf", "ero", "frz", "inj", "par", "psn", "spd", "tko", "wek"]);

const isHeavy = (button: AttackButton) => button.startsWith("heavy");

// Button background: purple for the special attack, orange for buffs, green for heals, otherwise the
// attack color (red or blue). A buff that also heals keeps the buff look, the heal becomes a badge.
export const attackBase = (button: AttackButton, steps: IAttackStep[]) => {
  if (button === "extra_action") return steps.some((s) => s.color === "B") ? "ex_action_base01" : "ex_action_base02";
  if (button === "ex") return "bt_skill";
  // Advanced strong attacks have a spiked border ("_heavy_plus")
  const heavy = isHeavy(button) ? (steps.some((s) => s.advanced) ? "_heavy_plus" : "_heavy") : "";
  if (steps.some((s) => s.buff)) return `bt_buff${heavy || "_heavy"}`;
  if (steps.some((s) => s.heal)) return `bt_heal${heavy}`;
  const blue = steps.some((s) => s.color === "B");
  return `${blue ? "bt_projectile" : "bt_fighting"}${heavy}`;
};

// Weapon icon of the button, or the closest one the game has for that weapon. Buffs show the
// character (6) or the party (7), heals show drops (5), like the game.
export const attackWeaponIcon = (button: AttackButton, steps: IAttackStep[]) => {
  if (button === "extra_action") return "ex_action01";
  if (button === "ex") return "11_skill1";
  // Double strike has its own icon
  if (steps.some((s) => s.twice)) return "11_heavy3";
  const buff = steps.find((s) => s.buff)?.buff;
  const weapon = buff ? (buff.target === 2 ? 7 : 6) : steps.some((s) => s.heal) ? 5 : steps.find((s) => s.weapon)?.weapon;
  if (!weapon) return null;
  const candidates = [`${weapon}_${button}`, `${weapon}_heavy3`, `${weapon}_normal`, `${weapon}_heavy1`];
  return candidates.find((name) => WEAPON_ICONS.has(name)) ?? [...WEAPON_ICONS].find((name) => name.startsWith(`${weapon}_`)) ?? null;
};

// Small badge on the bottom right of the button, like the game: the drops of a buff that also heals
export const attackSubBadge = (steps: IAttackStep[]) => (steps.some((s) => s.buff) && steps.some((s) => s.heal) ? "sub_5" : null);

// Statuses the attack inflicts, one badge each in the game: icon on a dark disc, an orange "+" for the "+" ones
export const attackStatusBadges = (steps: IAttackStep[]) => {
  const seen = new Map<string, { icon: string; plus: boolean }>();
  for (const status of steps.flatMap((s) => s.statuses)) {
    if (!STATUS_CODES.has(status.code)) continue;
    const key = `${status.code}${status.plus ? "+" : ""}`;
    if (!seen.has(key)) seen.set(key, { icon: `ailment_${status.code}`, plus: status.plus });
  }
  return [...seen.values()];
};
