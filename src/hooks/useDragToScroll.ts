import { useRef, useCallback, useEffect } from "react";

export const useDragToScroll = (scrollRef: React.RefObject<HTMLElement | null>) => {
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragStartY = useRef(0);
  const scrollStartTop = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    isDragging.current = true;
    hasDragged.current = false;
    dragStartY.current = e.clientY;
    scrollStartTop.current = scrollRef.current.scrollTop;
    e.preventDefault();
  }, [scrollRef]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !scrollRef.current) return;
      const delta = dragStartY.current - e.clientY;
      if (Math.abs(delta) > 3) hasDragged.current = true;
      scrollRef.current.scrollTop = scrollStartTop.current + delta;
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [scrollRef]);

  const consumedDrag = useCallback(() => {
    if (hasDragged.current) {
      hasDragged.current = false;
      return true;
    }
    return false;
  }, []);

  return { onMouseDown, consumedDrag };
};
