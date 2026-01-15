import { Badge, HStack, Text } from "@chakra-ui/react";

interface RankBadgeProps {
  rank: number;
  variant?: "default" | "miss" | "compact" | "with-emoji-separated";
}

export const RankBadge = ({ rank, variant = "default" }: RankBadgeProps) => {
  if (variant === "miss") {
    return (
      <Badge
        colorScheme="red"
        variant="solid"
        fontSize="sm"
        px={3}
        py={1}
        borderRadius="full"
        minW={{ base: "55px", md: "auto" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        #{rank}
      </Badge>
    );
  }

  // Emoji et couleurs pour les 3 premiers
  const medals = {
    1: { emoji: "🥇", color: "yellow" },
    2: { emoji: "🥈", color: "gray" },
    3: { emoji: "🥉", color: "orange" },
  };

  const medal = medals[rank as keyof typeof medals];

  // Variant with-emoji-separated: emoji séparé du badge (PodiumSection)
  if (variant === "with-emoji-separated" && medal) {
    return (
      <HStack spacing={2}>
        <Text fontSize="xl">{medal.emoji}</Text>
        <Badge
          colorScheme={medal.color}
          variant="solid"
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
        >
          #{rank}
        </Badge>
      </HStack>
    );
  }

  // Variant compact: outline pour ranks > 3
  if (variant === "compact" && !medal) {
    return (
      <Badge
        variant="outline"
        colorScheme="gray"
        fontSize="sm"
        px={3}
        py={1}
        borderRadius="full"
      >
        #{rank}
      </Badge>
    );
  }

  // Variant default: emoji dans le badge
  if (medal) {
    return (
      <Badge
        colorScheme={medal.color}
        variant="solid"
        fontSize="sm"
        px={3}
        py={1}
        borderRadius="full"
        minW={{ base: "55px", md: "auto" }}
        textAlign="center"
      >
        {medal.emoji}#{rank}
      </Badge>
    );
  }

  // Fallback pour ranks > 3 en mode default
  return (
    <Badge
      colorScheme="gray"
      variant="solid"
      fontSize="sm"
      px={3}
      py={1}
      borderRadius="full"
      minW={{ base: "55px", md: "auto" }}
      textAlign="center"
    >
      #{rank}
    </Badge>
  );
};
