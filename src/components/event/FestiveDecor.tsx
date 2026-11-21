import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useLive } from "@/providers/LiveEventProvider";

const fall = keyframes`
  0% { transform: translate3d(0, -10vh, 0); }
  100% { transform: translate3d(var(--drift), 110vh, 0); }
`;

const LIGHTS = ["#F56565", "#F6E05E", "#68D391", "#63B3ED", "#F687B3"];
const twinkle = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

// Fixed positions so the flakes do not move between renders
const FLAKES = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 3 + ((i * 7) % 5),
  duration: 11 + ((i * 13) % 12),
  delay: -((i * 29) % 23),
  drift: ((i % 5) - 2) * 18,
  opacity: 0.35 + ((i * 11) % 5) * 0.1,
}));

// Festive decor unlocked by the community goal: a string of lights under the header and light snow.
// Never catches a click, and stays still for players who ask for less motion.
export const FestiveDecor = () => {
  const { live } = useLive();
  if (!live?.decor) return null;
  return (
    <>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        h="6px"
        zIndex={1500}
        pointerEvents="none"
        display="flex"
        justifyContent="space-around"
        aria-hidden
      >
        {Array.from({ length: 24 }, (_, i) => (
          <Box
            key={i}
            boxSize="6px"
            borderRadius="full"
            bg={LIGHTS[i % LIGHTS.length]}
            boxShadow={`0 0 8px ${LIGHTS[i % LIGHTS.length]}`}
            animation={`${twinkle} ${1.6 + (i % 4) * 0.4}s ease-in-out infinite`}
            sx={{ "@media (prefers-reduced-motion: reduce)": { animation: "none" } }}
          />
        ))}
      </Box>
      <Box
        position="fixed"
        inset={0}
        zIndex={1400}
        pointerEvents="none"
        overflow="hidden"
        aria-hidden
        sx={{ "@media (prefers-reduced-motion: reduce)": { display: "none" } }}
      >
        {FLAKES.map((flake, i) => (
          <Box
            key={i}
            position="absolute"
            top={0}
            left={`${flake.left}%`}
            boxSize={`${flake.size}px`}
            borderRadius="full"
            bg="white"
            opacity={flake.opacity}
            _light={{ bg: "blue.100", opacity: flake.opacity + 0.2 }}
            style={{ ["--drift" as string]: `${flake.drift}px` }}
            animation={`${fall} ${flake.duration}s linear ${flake.delay}s infinite`}
          />
        ))}
      </Box>
    </>
  );
};
