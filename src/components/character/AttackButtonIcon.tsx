import { Box, Image } from "@chakra-ui/react";
import type { AttackButton, IAttackStep } from "@/interfaces";
import { attackBase, attackIconUrl, attackStatusBadges, attackSubBadge, attackWeaponIcon } from "@/utils/attackIcons";

// In-game attack button rebuilt from its pieces: background, weapon icon and status badge
export const AttackButtonIcon = ({ button, steps, size = "56px" }: {
  button: AttackButton;
  steps: IAttackStep[];
  size?: string;
}) => {
  const badges = attackStatusBadges(steps).slice(0, 2);
  const weapon = attackWeaponIcon(button, steps);
  const subBadge = attackSubBadge(steps);
  return (
    <Box position="relative" boxSize={size} flexShrink={0}>
      <Image src={attackIconUrl(attackBase(button, steps))} alt="" position="absolute" inset={0} boxSize="100%" />
      {weapon && (
        <Image src={attackIconUrl(weapon)} alt="" position="absolute" top="12%" left="12%" boxSize="76%" objectFit="contain" />
      )}
      {subBadge && <Image src={attackIconUrl(subBadge)} alt="" position="absolute" bottom="-6%" right="-6%" boxSize="42%" />}
      {/* Status badges on the top left, like the game */}
      {badges.map((badge, index) => (
        <Box key={`${badge.icon}${badge.plus}`} position="absolute" top="-8%" left={`${-8 + index * 30}%`} boxSize="40%">
          <Image src={attackIconUrl("ailment_base_2")} alt="" position="absolute" inset={0} boxSize="100%" />
          <Image src={attackIconUrl(badge.icon)} alt="" position="absolute" top="6%" left="6%" boxSize="88%" />
          {badge.plus && <Image src={attackIconUrl("ailment_plus")} alt="" position="absolute" top="-18%" left="-18%" boxSize="55%" />}
        </Box>
      ))}
    </Box>
  );
};
