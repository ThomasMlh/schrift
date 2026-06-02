import { useState, useEffect } from "react";
import type { ICycle, ICycleRotation } from "@/interfaces";
import { getRotationRealDates } from "@/utils/cycleHelpers";

interface CurrentRotationState {
  currentCycle: ICycle | null;
  nextCycle: ICycle | null;
  currentRotation: ICycleRotation | null;
  isCycleActive: boolean;
  isRotationActive: boolean;
}

export const useCurrentRotation = (
  allCycles: ICycle[],
  isLoading: boolean
): CurrentRotationState => {
  const [state, setState] = useState<CurrentRotationState>({
    currentCycle: null,
    nextCycle: null,
    currentRotation: null,
    isCycleActive: false,
    isRotationActive: false,
  });

  useEffect(() => {
    if (isLoading || allCycles.length === 0) return;

    const now = new Date();

    for (const cycle of allCycles) {
      if (!cycle.rotations?.length) continue;

      for (const rotation of cycle.rotations) {
        if (!rotation.start_date || !rotation.end_date) continue;
        const { realStartDate, realEndDate } = getRotationRealDates(rotation.start_date, rotation.end_date);

        if (now >= realStartDate && now <= realEndDate) {
          setState({ currentCycle: cycle, nextCycle: null, currentRotation: rotation, isCycleActive: true, isRotationActive: true });
          return;
        }
      }

      const upcomingRotation = cycle.rotations.find((r) => {
        if (!r.start_date || !r.end_date) return false;
        return now < getRotationRealDates(r.start_date, r.end_date).realStartDate;
      }) ?? null;

      if (upcomingRotation) {
        setState({ currentCycle: cycle, nextCycle: null, currentRotation: upcomingRotation, isCycleActive: true, isRotationActive: false });
        return;
      }
    }

    const futureNextCycle = allCycles.find((cycle) =>
      cycle.rotations?.some((r) => {
        if (!r.start_date || !r.end_date) return false;
        return now < getRotationRealDates(r.start_date, r.end_date).realStartDate;
      })
    ) ?? null;

    setState({ currentCycle: null, nextCycle: futureNextCycle, currentRotation: null, isCycleActive: false, isRotationActive: false });
  }, [allCycles, isLoading]);

  return state;
};
