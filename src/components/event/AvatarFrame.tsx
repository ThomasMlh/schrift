import { Box, Tooltip } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { useAvatarFrame } from "@/providers/LiveEventProvider";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// Anniversary frame around the avatar of the event participants, once the community goal unlocks it
export const AvatarFrame = ({ userId, children, thickness = 2 }: { userId?: string | null; children: React.ReactNode; thickness?: number }) => {
  const { t } = useTranslation();
  const year = useAvatarFrame(userId);
  if (!year) return <>{children}</>;
  return (
    <Tooltip label={t("components.liveEvent.frame", { year })} hasArrow openDelay={300}>
      <Box position="relative" display="inline-flex" borderRadius="full" p={`${thickness}px`} flexShrink={0} overflow="hidden" isolation="isolate">
        <Box
          position="absolute"
          inset="-50%"
          zIndex={-1}
          bg="conic-gradient(#F6AD55, #F687B3, #B794F4, #63B3ED, #F6E05E, #F6AD55)"
          animation={`${spin} 6s linear infinite`}
          sx={{ "@media (prefers-reduced-motion: reduce)": { animation: "none" } }}
          aria-hidden
        />
        {children}
      </Box>
    </Tooltip>
  );
};
