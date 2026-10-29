import { useRef, useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { AttackShape } from "@/interfaces";
import type { AreaPosition } from "@/utils/attackShape";

const GRID_STEP = 250;

// Fixed frame centered on the reference wave, in game units: every drawing of every character has the
// same scale, so areas compare between characters; a bigger area overflows the frame
const HALF = 1200;
const DOT_RADIUS = 60;

// Reference wave of a guild quest (m_guild_quest_block_enemy_spawnpoint, wave 1 of block 41314343):
// 12 enemies on a circle of radius 650, one at its center, and the boss halfway between the center and
// the far side. The character starts on the near edge of the circle, facing it, as when it reaches the wave.
const WAVE = { count: 12, radius: 650, boss: -325 };
const START: AreaPosition = { x: 0, y: 550 };

const WaveMarks = () => (
  <g>
    {Array.from({ length: WAVE.count }, (_, i) => {
      const angle = (2 * Math.PI * i) / WAVE.count;
      return <circle key={i} cx={WAVE.radius * Math.sin(angle)} cy={-WAVE.radius * Math.cos(angle)} r={DOT_RADIUS} fill="white" fillOpacity={0.85} />;
    })}
    <circle cx={0} cy={0} r={DOT_RADIUS} fill="white" fillOpacity={0.85} />
    <circle cx={0} cy={WAVE.boss} r={DOT_RADIUS} fill="#ed8936" />
  </g>
);

// Sector facing up (towards negative y), or a full circle
const sectorPath = (radius: number, angle: number) => {
  if (angle >= 360) return null;
  const toPoint = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${(radius * Math.cos(rad)).toFixed(1)} ${(radius * Math.sin(rad)).toFixed(1)}`;
  };
  return `M 0 0 L ${toPoint(-angle / 2)} A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${toPoint(angle / 2)} Z`;
};

const ShapeMark = ({ shape, fill, stroke }: { shape: AttackShape; fill: string; stroke: string }) => {
  const style = { fill, stroke, strokeWidth: 12 };
  switch (shape.kind) {
    case "sector": {
      const radius = shape.radius ?? 0;
      const path = sectorPath(radius, shape.angle ?? 360);
      return path ? <path d={path} {...style} /> : <circle cx={0} cy={0} r={radius} {...style} />;
    }
    case "rect": {
      const width = shape.width ?? 0;
      return <rect x={-width / 2} y={-(shape.length ?? 0)} width={width} height={shape.length ?? 0} {...style} />;
    }
    case "circle":
      return <circle cx={0} cy={-(shape.distance ?? 0)} r={shape.radius ?? 0} {...style} />;
    case "projectile": {
      const range = shape.range ?? shape.length ?? 0;
      const width = Math.max(shape.width ?? 0, 60);
      const length = shape.length ?? 0;
      // The path the projectile sweeps, and the projectile itself where it is fired
      return (
        <g>
          <rect x={-width / 2} y={-range} width={width} height={range} {...style} />
          {length > 0 && <rect x={-width / 2} y={-length / 2} width={width} height={length} {...style} fill={stroke} fillOpacity={0.45} />}
          {(shape.impact_radius ?? 0) > 0 && <circle cx={0} cy={-range} r={shape.impact_radius ?? 0} {...style} />}
        </g>
      );
    }
  }
};

// Area hit by an attack seen from above, the character facing up. Dragging the character moves the
// areas of this drawing only against the reference wave.
export const AttackArea = ({ shapes, color }: { shapes: AttackShape[]; color: "R" | "B" | null }) => {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const [position, setPosition] = useState<AreaPosition>(START);
  const [isDragging, setIsDragging] = useState(false);
  const moved = position.x !== START.x || position.y !== START.y;
  const lines = [];
  for (let v = GRID_STEP; v < HALF; v += GRID_STEP) lines.push(v, -v);
  const tone = color === "B" ? "66, 153, 225" : "229, 62, 62";

  // Pointer position in game units, kept inside the frame
  const pointerPosition = (event: React.PointerEvent) => {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const limit = HALF - DOT_RADIUS;
    const clamp = (value: number) => Math.round(Math.max(-limit, Math.min(limit, value)));
    return { x: clamp(point.x), y: clamp(point.y) };
  };

  const startDrag = (event: React.PointerEvent<SVGGElement>) => {
    event.preventDefault();
    svgRef.current?.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const drag = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const next = pointerPosition(event);
    if (next) setPosition(next);
  };

  const stopDrag = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    svgRef.current?.releasePointerCapture(event.pointerId);
    setIsDragging(false);
  };

  return (
    <Box position="relative" bg="gray.900" borderRadius="lg" overflow="hidden" borderWidth="1px" borderColor="whiteAlpha.200">
      <svg
        ref={svgRef}
        viewBox={`${-HALF} ${-HALF} ${HALF * 2} ${HALF * 2}`}
        width="100%"
        style={{ display: "block", aspectRatio: "1" }}
        role="img"
        onPointerMove={drag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        {[0, ...lines].map((v) => (
          <g key={v} stroke="rgba(255,255,255,0.08)" strokeWidth={6}>
            <line x1={v} y1={-HALF} x2={v} y2={HALF} />
            <line x1={-HALF} y1={v} x2={HALF} y2={v} />
          </g>
        ))}
        <WaveMarks />
        <g transform={`translate(${position.x} ${position.y})`}>
          {shapes.map((shape, index) => (
            <ShapeMark key={index} shape={shape} fill={`rgba(${tone}, ${shapes.length > 1 ? 0.22 : 0.35})`} stroke={`rgba(${tone}, 0.9)`} />
          ))}
          {/* Only the character starts a drag, so swiping over the area still scrolls the page on phones */}
          <g onPointerDown={startDrag} style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}>
            <circle cx={0} cy={0} r={DOT_RADIUS * 2.5} fill="transparent" />
            <circle cx={0} cy={0} r={DOT_RADIUS} fill="#63b3ed" stroke="white" strokeWidth={12} />
            <path d={`M 0 ${-DOT_RADIUS * 3} l ${-DOT_RADIUS * 0.8} ${DOT_RADIUS * 1.1} h ${DOT_RADIUS * 1.6} Z`} fill="white" />
          </g>
        </g>
      </svg>
      {moved && (
        <Button size="xs" position="absolute" top={2} right={2} variant="solid" opacity={0.85} onClick={() => setPosition(START)}>
          {t("components.characterAttacks.recenter")}
        </Button>
      )}
    </Box>
  );
};
