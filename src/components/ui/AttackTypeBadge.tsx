import { Box } from "@chakra-ui/react";

interface AttackTypeBadgeProps {
  attackType: string;
  size?: string;
}

export const AttackTypeBadge = ({ attackType, size = "16px" }: AttackTypeBadgeProps) => {
  const type = attackType?.toUpperCase();
  
  if (type === 'R') {
    return (
      <Box
        width={size}
        height={size}
        borderRadius="50%"
        backgroundColor="red.500"
        title="Rouge"
      />
    );
  }
  
  if (type === 'B') {
    return (
      <Box
        width={size}
        height={size}
        borderRadius="50%"
        backgroundColor="blue.500"
        title="Bleu"
      />
    );
  }
  
  // Cercle avec les 2 couleurs (rouge et bleu)
  return (
    <Box
      width={size}
      height={size}
      borderRadius="50%"
      background="linear-gradient(90deg, red.500 50%, blue.500 50%)"
      bgGradient="linear(to-r, red.500 50%, blue.500 50%)"
      title="Rouge et Bleu"
    />
  );
};