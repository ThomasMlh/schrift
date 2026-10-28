import type { IAccessory, IAccessorySubeffect } from "@/interfaces";
import { gameText } from "./gameText";

// Sub-effect value on this accessory: the affinity bonus only applies to an accessory that has an affinity
export const subeffectLabel = (subeffect: IAccessorySubeffect, accessory: IAccessory | null | undefined, language: string) => {
  const names = accessory && !accessory.same_affinity_rate && subeffect.base_names ? subeffect.base_names : subeffect.names;
  return gameText(names, language) || subeffect.name;
};
