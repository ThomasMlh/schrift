import { Box, Flex, Tooltip } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { ICycleRotation } from "@/interfaces";

interface RotationStripProps {
  rotations: ICycleRotation[];
  /** Number of rotations already played: the following ones are faded. Omitted = all solid. */
  doneCount?: number;
  /** Index of the current or upcoming rotation, outlined */
  activeIndex?: number;
  height?: string;
}

const attackBg = (attack: string) => {
  const type = attack?.toUpperCase();
  if (type === "R") return { bg: "red.400" };
  if (type === "B") return { bg: "blue.400" };
  return { bgGradient: "linear(to-r, red.400 50%, blue.400 50%)" };
};

/** Strip of a cycle's rotations: one segment per rotation, colored by attack type. */
export const RotationStrip = ({ rotations, doneCount, activeIndex = -1, height = "8px" }: RotationStripProps) => {
  const { t } = useTranslation();

  return (
    <Flex gap="3px" w="100%" role="list" aria-label={t("pages.cycles.stripLabel")}>
      {rotations.map((rotation, index) => {
        const isActive = index === activeIndex;
        const isFuture = doneCount !== undefined && index >= doneCount && !isActive;
        const position = rotation.position || index + 1;
        return (
          <Tooltip
            key={rotation._id ?? index}
            label={`#${position} · ${t(`factions.${rotation.killer}`, rotation.killer)}`}
            hasArrow
            openDelay={150}
          >
            <Box
              role="listitem"
              flex={1}
              h={height}
              borderRadius="full"
              opacity={isFuture ? 0.3 : 1}
              outline={isActive ? "2px solid" : undefined}
              outlineColor="text.strong"
              outlineOffset="2px"
              {...attackBg(rotation.attack)}
            />
          </Tooltip>
        );
      })}
    </Flex>
  );
};
