import { Box, Image } from "@chakra-ui/react";
import type { AttackButton, IAttackStep } from "@/interfaces";
import { attackBase, attackIconUrl, attackStatusIcon, attackWeaponIcon } from "@/utils/attackIcons";

// In-game attack button rebuilt from its pieces: background, weapon icon and status badge
export const AttackButtonIcon = ({ button, steps, size = "56px" }: {
  button: AttackButton;
  steps: IAttackStep[];
  size?: string;
}) => {
  const status = attackStatusIcon(steps);
  const weapon = attackWeaponIcon(button, steps);
  return (
    <Box position="relative" boxSize={size} flexShrink={0}>
      <Image src={attackIconUrl(attackBase(button, steps))} alt="" position="absolute" inset={0} boxSize="100%" />
      {weapon && (
        <Image src={attackIconUrl(weapon)} alt="" position="absolute" top="12%" left="12%" boxSize="76%" objectFit="contain" />
      )}
      {status && <Image src={attackIconUrl(status)} alt="" position="absolute" top="-6%" right="-6%" boxSize="36%" />}
    </Box>
  );
};
