import { Box, Center, Skeleton, Spinner, Text, VStack } from "@chakra-ui/react";

interface PageLoaderProps {
  label?: string;
  subtitle?: string;
  height?: string;
  color?: string;
  // "skeleton" (default): content loading, shows the shape of what is coming.
  // "spinner": processing in progress (login, OCR analysis…), with a message.
  variant?: "skeleton" | "spinner";
}

const ROW_HEIGHT = 44;

// Number of skeleton rows filling the requested height ("200px" -> 4 rows)
const rowsFor = (height: string) => {
  const px = height.endsWith("px") ? parseInt(height, 10) : NaN;
  if (!Number.isFinite(px)) return 6;
  return Math.max(1, Math.min(10, Math.floor((px - 24) / ROW_HEIGHT)));
};

export const PageLoader = ({
  label,
  subtitle,
  height = "50vh",
  color = "blue.500",
  variant = "skeleton",
}: PageLoaderProps) => {
  if (variant === "spinner") {
    return (
      <Center h={height}>
        <VStack spacing={4}>
          <Spinner size="xl" color={color} thickness="4px" />
          {label && <Text fontWeight="medium">{label}</Text>}
          {subtitle && <Text fontSize="sm" color="text.muted">{subtitle}</Text>}
        </VStack>
      </Center>
    );
  }

  const rows = rowsFor(height);
  return (
    <Box minH={height === "auto" ? undefined : height} aria-busy="true" role="status" py={2}>
      {/* Loading message kept for screen readers */}
      <Text position="absolute" w="1px" h="1px" overflow="hidden" sx={{ clip: "rect(0 0 0 0)" }}>
        {label || "Chargement…"}
      </Text>
      <VStack align="stretch" spacing={3}>
        <Skeleton h="18px" w="35%" borderRadius="md" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} h={`${ROW_HEIGHT - 12}px`} borderRadius="lg" opacity={1 - i * 0.07} />
        ))}
      </VStack>
    </Box>
  );
};
