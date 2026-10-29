import { useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import type { AttackShape } from "@/interfaces";
import { AREA_ORIGIN, type AreaPosition } from "@/utils/attackShape";

const GRID_STEP = 250;

// Reference wave of a guild quest (m_guild_quest_block_enemy_spawnpoint, wave 1 of block 41314343):
// 12 enemies on a circle of radius 650, one at its center, and the boss halfway between the center and
// the far side. The character stands on the near edge of the circle, facing it, as when it reaches the wave.
const WAVE = { count: 12, radius: 650, center: -550, boss: -875 };
const ENEMY_RADIUS = 45;

const WaveMarks = () => (
  <g>
    {Array.from({ length: WAVE.count }, (_, i) => {
      const angle = (2 * Math.PI * i) / WAVE.count;
      return (
        <circle
          key={i}
          cx={WAVE.radius * Math.sin(angle)}
          cy={WAVE.center - WAVE.radius * Math.cos(angle)}
          r={ENEMY_RADIUS}
          fill="white"
          fillOpacity={0.85}
        />
      );
    })}
    <circle cx={0} cy={WAVE.center} r={ENEMY_RADIUS} fill="white" fillOpacity={0.85} />
    <circle cx={0} cy={WAVE.boss} r={ENEMY_RADIUS * 1.3} fill="#ed8936" />
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

// Widest frame drawn: a bigger area (a screen-wide special) fills it instead of shrinking the others
const MAX_HALF = 1500;
// Smallest frame: the reference wave always fits
const MIN_HALF = 1300;

// Area hit by an attack seen from above, the character facing up, at the center unless moved. Every
// attack of a character uses the same scale (reach), so their sizes compare. Dragging the character
// moves its areas against the reference wave.
export const AttackArea = ({ shapes, reach, color, position = AREA_ORIGIN, onMove }: {
  shapes: AttackShape[];
  reach: number;
  color: "R" | "B" | null;
  position?: AreaPosition;
  onMove?: (position: AreaPosition) => void;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const half = Math.min(Math.max(reach * 1.1, MIN_HALF), MAX_HALF);
  const lines = [];
  for (let v = GRID_STEP; v < half; v += GRID_STEP) lines.push(v, -v);
  const tone = color === "B" ? "66, 153, 225" : "229, 62, 62";

  // Pointer position in game units, kept inside the frame
  const pointerPosition = (event: React.PointerEvent) => {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const limit = half * 0.95;
    const clamp = (value: number) => Math.round(Math.max(-limit, Math.min(limit, value)));
    return { x: clamp(point.x), y: clamp(point.y) };
  };

  const startDrag = (event: React.PointerEvent<SVGGElement>) => {
    if (!onMove) return;
    event.preventDefault();
    svgRef.current?.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const drag = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || !onMove) return;
    const next = pointerPosition(event);
    if (next) onMove(next);
  };

  const stopDrag = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    svgRef.current?.releasePointerCapture(event.pointerId);
    setIsDragging(false);
  };

  return (
    <Box bg="gray.900" borderRadius="lg" overflow="hidden" borderWidth="1px" borderColor="whiteAlpha.200">
      <svg
        ref={svgRef}
        viewBox={`${-half} ${-half} ${half * 2} ${half * 2}`}
        width="100%"
        style={{ display: "block", aspectRatio: "1" }}
        role="img"
        onPointerMove={drag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        {[0, ...lines].map((v) => (
          <g key={v} stroke="rgba(255,255,255,0.08)" strokeWidth={6}>
            <line x1={v} y1={-half} x2={v} y2={half} />
            <line x1={-half} y1={v} x2={half} y2={v} />
          </g>
        ))}
        <WaveMarks />
        <g transform={`translate(${position.x} ${position.y})`}>
          {shapes.map((shape, index) => (
            <ShapeMark key={index} shape={shape} fill={`rgba(${tone}, ${shapes.length > 1 ? 0.22 : 0.35})`} stroke={`rgba(${tone}, 0.9)`} />
          ))}
          {/* Only the character starts a drag, so swiping over the area still scrolls the page on phones */}
          <g
            onPointerDown={startDrag}
            style={{ cursor: onMove ? (isDragging ? "grabbing" : "grab") : undefined, touchAction: onMove ? "none" : undefined }}
          >
            <circle cx={0} cy={0} r={half * 0.1} fill="transparent" />
            <circle cx={0} cy={0} r={half * 0.045} fill="#63b3ed" stroke="white" strokeWidth={10} />
            <path d={`M 0 ${-half * 0.12} l ${-half * 0.035} ${half * 0.05} h ${half * 0.07} Z`} fill="white" />
          </g>
        </g>
      </svg>
    </Box>
  );
};
