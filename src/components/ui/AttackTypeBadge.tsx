import { Box } from "@chakra-ui/react";

interface AttackTypeBadgeProps {
  attackType: string;
  size?: string;
}

export const AttackTypeBadge = ({ attackType, size = "16px" }: AttackTypeBadgeProps) => {
  const getColor = () => {
    switch (attackType?.toUpperCase()) {
      case 'R':
        return 'red.500';
      case 'B':
        return 'blue.500';
      default:
        return 'gray.400';
    }
  };

  return (
    <Box
      width={size}
      height={size}
      borderRadius="50%"
      backgroundColor={getColor()}
      title={attackType === 'R' ? 'Rouge' : attackType === 'B' ? 'Bleu' : 'Inconnu'}
    />
  );
};