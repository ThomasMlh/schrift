import type { ICycle, ICycleRotation } from "@/interfaces";
import { cycleSlug, getRotationRealDates } from "@/utils/cycleHelpers";

export type PassageState = "past" | "current" | "upcoming";

// One appearance of a rotation in a cycle, with its neighbours in that cycle's order
export interface RotationPassage {
  cycle: ICycle;
  slug: string;
  rotation: ICycleRotation;
  start: Date;
  end: Date;
  state: PassageState;
  previous: ICycleRotation | null;
  next: ICycleRotation | null;
}

export const ALL_CYCLES = "all";

type RotationKey = Pick<ICycleRotation, "killer" | "attack">;

// Blue attacks are ranged, red ones melee
const ATTACK_SLUGS: Record<string, string> = { B: "range", R: "melee" };

// "Stern Ritter" -> "stern-ritter", "Division 0" -> "division-0"
export const killerSlug = (killer: string) => killer
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const attackSlug = (attack: string) => ATTACK_SLUGS[attack] ?? attack.toLowerCase();

// A killer and an attack type make one rotation: /rotation/arrancar/range
export const rotationUrl = (rotation: RotationKey, cycle?: Pick<ICycle, "name" | "year"> | typeof ALL_CYCLES) => {
  const query = cycle === ALL_CYCLES ? ALL_CYCLES : cycle ? cycleSlug(cycle.name, cycle.year) : null;
  return `/rotation/${killerSlug(rotation.killer)}/${attackSlug(rotation.attack)}${query ? `?cycle=${query}` : ""}`;
};

export const matchesRotationSlug = (rotation: RotationKey, killer: string, attack: string) =>
  killerSlug(rotation.killer) === killer && attackSlug(rotation.attack) === attack;

// Passages of a rotation, most recent first
export const rotationPassages = (cycles: ICycle[], rotationId: string, now: Date): RotationPassage[] => cycles
  .flatMap((cycle) => {
    const rotations = (cycle.rotations ?? []).filter((r) => r.start_date && r.end_date);
    const index = rotations.findIndex((r) => r.rotation_id === rotationId);
    if (index < 0) return [];
    const rotation = rotations[index];
    const { realStartDate: start, realEndDate: end } = getRotationRealDates(rotation.start_date, rotation.end_date);
    const state: PassageState = now > end ? "past" : now >= start ? "current" : "upcoming";
    return [{
      cycle,
      slug: cycleSlug(cycle.name, cycle.year),
      rotation,
      start,
      end,
      state,
      previous: rotations[index - 1] ?? null,
      next: rotations[index + 1] ?? null,
    }];
  })
  .sort((a, b) => b.start.getTime() - a.start.getTime());

// Passage shown by default: the running one, else the latest one already started
export const defaultPassage = (passages: RotationPassage[]) =>
  passages.find((p) => p.state === "current") ?? passages.find((p) => p.state === "past") ?? null;
