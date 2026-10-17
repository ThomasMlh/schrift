import { Text } from "@chakra-ui/react";
import { RotationLabel } from "@/components/ui/RotationLabel";
import type { ICycleRotation } from "@/interfaces";

// CustomSelect options for rotations: "#15 ● Killer … date" in the list. The label is only used by
// the select search.
export const rotationSelectOptions = (rotations: ICycleRotation[], badgeFor?: (rotation: ICycleRotation) => string | undefined) =>
  rotations.map((rotation) => ({
    value: rotation.rotation_id,
    label: `#${rotation.position} ${rotation.killer}`,
    content: <RotationLabel rotation={rotation} showDate badge={badgeFor?.(rotation)} />,
  }));

// Selected value without the date, which would not fit in the select button
export const renderSelectedRotation = (rotations: ICycleRotation[]) => (option: { value: string; label: string }) => {
  const rotation = rotations.find((r) => r.rotation_id === option.value);
  return rotation ? <RotationLabel rotation={rotation} /> : <Text>{option.label}</Text>;
};
