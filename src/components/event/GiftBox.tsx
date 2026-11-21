import { Box, Image } from "@chakra-ui/react";

const RIBBON = "linear-gradient(90deg, #a16207, #fde68a 50%, #a16207)";
const RIBBON_H = "linear-gradient(180deg, #a16207, #fde68a 50%, #a16207)";

// Small wrapped gift with the Schrift logo, like the doors of the advent calendar
export const GiftBox = ({ size = 44, color = "#9B1C31", dimmed = false }: { size?: number; color?: string; dimmed?: boolean }) => (
  <Box
    position="relative"
    boxSize={`${size}px`}
    borderRadius="lg"
    bg={color}
    overflow="hidden"
    flexShrink={0}
    boxShadow="inset 0 0 0 1px rgba(255,255,255,0.15), 0 4px 10px rgba(0,0,0,0.3)"
    filter={dimmed ? "saturate(0.3) brightness(0.75)" : undefined}
    aria-hidden
  >
    <Box position="absolute" top={0} bottom={0} left="50%" w="16%" transform="translateX(-50%)" bg={RIBBON} />
    <Box position="absolute" left={0} right={0} top="50%" h="16%" transform="translateY(-50%)" bg={RIBBON_H} />
    <Image
      src="/logo.png"
      alt=""
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      w="48%"
      h="48%"
      borderRadius="full"
      filter="drop-shadow(0 1px 3px rgba(0,0,0,0.5))"
      draggable={false}
    />
  </Box>
);
