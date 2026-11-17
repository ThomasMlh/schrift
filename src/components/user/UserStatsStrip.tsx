import { Box, Grid, Skeleton, Text } from "@chakra-ui/react";

export interface StatsStripItem {
  label: string;
  value: string;
  help?: string;
  // Highlighted figure (the personal record)
  accent?: boolean;
}

// Key figures of the player, as a band across the bottom of the profile header
export const UserStatsStrip = ({ items, isLoading = false }: { items: StatsStripItem[]; isLoading?: boolean }) => (
  <Grid
    templateColumns={{ base: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }}
    borderTopWidth="1px"
    borderColor="border.subtle"
  >
    {(isLoading ? Array.from({ length: 4 }, () => null) : items).map((item, index) => (
      <Box
        key={item?.label ?? index}
        px={{ base: 4, md: 6 }}
        py={4}
        borderLeftWidth={{ base: index % 2 ? "1px" : 0, md: index ? "1px" : 0 }}
        borderTopWidth={{ base: index >= 2 ? "1px" : 0, md: 0 }}
        borderColor="border.subtle"
        minW={0}
      >
        {item ? (
          <Box>
            <Text fontSize="xs" color="text.muted" fontWeight="semibold" noOfLines={1}>{item.label}</Text>
            <Text
              fontSize={{ base: "lg", md: "2xl" }}
              fontWeight="extrabold"
              letterSpacing="tight"
              color={item.accent ? "orange.300" : "text.strong"}
              sx={{ fontVariantNumeric: "tabular-nums" }}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {item.value}
            </Text>
            {item.help && <Text fontSize="xs" color="text.muted" noOfLines={1}>{item.help}</Text>}
          </Box>
        ) : <Skeleton h="52px" borderRadius="md" />}
      </Box>
    ))}
  </Grid>
);
