import { Box, Image } from "@chakra-ui/react";
import type { AttackButton, IAttackStep } from "@/interfaces";
import { attackBase, attackIconUrl, attackStatusIcon, attackWeaponIcon } from "@/utils/attackIcons";

// In-game attack button rebuilt from its pieces: background, weapon icon and status badge.
// The special attack button shows the character portrait, like in the game.
export const AttackButtonIcon = ({ button, steps, portrait, size = "56px" }: {
  button: AttackButton;
  steps: IAttackStep[];
  portrait?: string;
  size?: string;
}) => {
  const status = attackStatusIcon(steps);
  const weapon = attackWeaponIcon(button, steps);
  return (
    <Box position="relative" boxSize={size} flexShrink={0}>
      {button === "ex" && portrait ? (
        <Image src={portrait} alt="" boxSize="100%" borderRadius="full" borderWidth="3px" borderColor="yellow.400" objectFit="cover" />
      ) : (
        <>
          <Image src={attackIconUrl(attackBase(button, steps))} alt="" position="absolute" inset={0} boxSize="100%" />
          {weapon && (
            <Image src={attackIconUrl(weapon)} alt="" position="absolute" top="12%" left="12%" boxSize="76%" objectFit="contain" />
          )}
        </>
      )}
      {status && <Image src={attackIconUrl(status)} alt="" position="absolute" top="-6%" right="-6%" boxSize="36%" />}
    </Box>
  );
};
