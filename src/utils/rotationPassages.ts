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

export const rotationUrl = (rotationId: string, cycle?: Pick<ICycle, "name" | "year"> | typeof ALL_CYCLES) => {
  const query = cycle === ALL_CYCLES ? ALL_CYCLES : cycle ? cycleSlug(cycle.name, cycle.year) : null;
  return `/rotation/${rotationId}${query ? `?cycle=${query}` : ""}`;
};

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
