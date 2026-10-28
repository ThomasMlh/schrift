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

// Button background: green for heals, orange for buffs, otherwise the attack color (red or blue)
export const attackBase = (button: AttackButton, steps: IAttackStep[]) => {
  if (button === "extra_action") return "ex_action_base01";
  const heavy = isHeavy(button);
  if (steps.some((s) => s.heal)) return heavy ? "bt_heal_heavy" : "bt_heal";
  if (steps.some((s) => s.buff)) return "bt_buff_heavy";
  const blue = steps.some((s) => s.color === "B");
  return `${blue ? "bt_projectile" : "bt_fighting"}${heavy ? "_heavy" : ""}`;
};

// Weapon icon of the button, or the closest one the game has for that weapon
export const attackWeaponIcon = (button: AttackButton, steps: IAttackStep[]) => {
  if (button === "extra_action") return "ex_action01";
  const weapon = steps.find((s) => s.weapon)?.weapon;
  if (!weapon) return null;
  const candidates = [`${weapon}_${button}`, `${weapon}_heavy3`, `${weapon}_normal`, `${weapon}_heavy1`];
  return candidates.find((name) => WEAPON_ICONS.has(name)) ?? [...WEAPON_ICONS].find((name) => name.startsWith(`${weapon}_`)) ?? null;
};

// Badge of the first status the attack inflicts
export const attackStatusIcon = (steps: IAttackStep[]) => {
  const status = steps.flatMap((s) => s.statuses)[0];
  return status && STATUS_CODES.has(status.code) ? `ailment_${status.code}${status.plus ? "_plus" : ""}` : null;
};
