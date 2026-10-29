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
// Normal attack icons are trimmed in the atlas: the game puts them back in a 112x124 frame (offset of the
// trimmed image, its size), centered on the 168x168 button. Without it the icon sits too low.
const NORMAL_FRAME = { width: 112, height: 124, button: 168 };
const NORMAL_ICONS: Record<string, { left: number; top: number; width: number; height: number }> = {
  "1_normal": { left: 11, top: 0, width: 90, height: 97 },
  "2_normal": { left: 11, top: 0, width: 90, height: 100 },
  "3_normal": { left: 10, top: 0, width: 92, height: 110 },
  "4_normal": { left: 11, top: 0, width: 90, height: 107 },
  "5_normal": { left: 11, top: 0, width: 90, height: 102 },
};

// Position of a weapon icon on its button, in percent of the button
export const attackWeaponBox = (icon: string) => {
  const normal = NORMAL_ICONS[icon];
  if (!normal) return { top: 12, left: 12, width: 76, height: 76 };
  const { width: frameWidth, height: frameHeight, button } = NORMAL_FRAME;
  const frameLeft = (button - frameWidth) / 2;
  const frameTop = (button - frameHeight) / 2;
  const percent = (value: number) => (value / button) * 100;
  return {
    left: percent(frameLeft + normal.left),
    top: percent(frameTop + normal.top),
    width: percent(normal.width),
    height: percent(normal.height),
  };
};

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
  // A special that revives the party has the revive icon, the others the default one
  if (button === "ex") return steps.some((s) => s.revival) ? "10_special1" : "11_skill1";
  // Double strike has its own icon
  if (steps.some((s) => s.twice)) return "11_heavy3";
  // A buff that also heals has its own icon (party with a "+"), the heal drop goes in a badge
  if (steps.some((s) => s.buff) && steps.some((s) => s.heal)) return "6_heavy4";
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
