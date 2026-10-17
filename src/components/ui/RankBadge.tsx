import { Badge, HStack } from "@chakra-ui/react";
import { MedalBadge } from "./MedalBadge";

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

  // Colors of the top 3 (the medal itself is drawn by MedalBadge)
  const medals = {
    1: { color: "yellow" },
    2: { color: "gray" },
    3: { color: "orange" },
  };

  const medal = medals[rank as keyof typeof medals];

  // with-emoji-separated: medal separate from the badge (PodiumSection)
  if (variant === "with-emoji-separated" && medal) {
    return (
      <HStack spacing={2}>
        <MedalBadge rank={rank as 1 | 2 | 3} size={22} />
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

  // compact: outlined badge for ranks above 3
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

  // default: medal before the badge
  if (medal) {
    return (
      <HStack spacing={1.5}>
        <MedalBadge rank={rank as 1 | 2 | 3} size={16} />
        <Badge
          colorScheme={medal.color}
          variant="solid"
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
          textAlign="center"
        >
          #{rank}
        </Badge>
      </HStack>
    );
  }

  // default mode, ranks above 3
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
