import { Box, Portal } from "@chakra-ui/react";
import { useLayoutEffect, useState, type ReactNode, type RefObject } from "react";

interface FloatingMenuProps {
  // Element the menu is aligned with (same width, just below or above)
  anchorRef: RefObject<HTMLElement | null>;
  // Lets the parent ignore clicks inside the menu in its outside-click handler
  menuRef: RefObject<HTMLDivElement | null>;
  maxH?: number;
  children: ReactNode;
}

interface MenuPosition {
  left: number;
  width: number;
  maxH: number;
  top?: number;
  bottom?: number;
}

const GAP = 4;
const VIEWPORT_MARGIN = 8;

// Dropdown rendered in a portal with fixed positioning, so a scrollable parent (e.g. a modal body)
// cannot clip it. Opens upwards when there is more room above the anchor.
export const FloatingMenu = ({ anchorRef, menuRef, maxH = 300, children }: FloatingMenuProps) => {
  const [position, setPosition] = useState<MenuPosition | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
      const spaceAbove = rect.top - VIEWPORT_MARGIN;
      const openUp = spaceBelow < maxH && spaceAbove > spaceBelow;
      const height = Math.min(maxH, Math.max(120, openUp ? spaceAbove : spaceBelow));
      setPosition({
        left: rect.left,
        width: rect.width,
        maxH: height,
        ...(openUp ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP }),
      });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef, maxH]);

  if (!position) return null;

  return (
    <Portal>
      <Box
        ref={menuRef}
        position="fixed"
        top={position.top !== undefined ? `${position.top}px` : undefined}
        bottom={position.bottom !== undefined ? `${position.bottom}px` : undefined}
        left={`${position.left}px`}
        width={`${position.width}px`}
        maxH={`${position.maxH}px`}
        overflowY="auto"
        zIndex={9999}
        bg="bg.card"
        border="1px solid"
        borderColor="border.default"
        borderRadius="md"
        boxShadow="lg"
      >
        {children}
      </Box>
    </Portal>
  );
};
