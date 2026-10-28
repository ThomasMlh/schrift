import { Box } from "@chakra-ui/react";
import type { AttackShape } from "@/interfaces";

const GRID_STEP = 250;

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
      return (
        <g>
          <rect x={-width / 2} y={-range} width={width} height={range} {...style} />
          {(shape.impact_radius ?? 0) > 0 && <circle cx={0} cy={-range} r={shape.impact_radius ?? 0} {...style} />}
        </g>
      );
    }
  }
};

// Area hit by an attack seen from above, the character at the center facing up. Every attack of a
// character uses the same scale (reach), so their sizes compare.
export const AttackArea = ({ shapes, reach, color }: { shapes: AttackShape[]; reach: number; color: "R" | "B" | null }) => {
  const half = Math.max(reach * 1.1, 600);
  const lines = [];
  for (let v = GRID_STEP; v < half; v += GRID_STEP) lines.push(v, -v);
  const tone = color === "B" ? "66, 153, 225" : "229, 62, 62";

  return (
    <Box bg="gray.900" borderRadius="lg" overflow="hidden" borderWidth="1px" borderColor="whiteAlpha.200">
      <svg viewBox={`${-half} ${-half} ${half * 2} ${half * 2}`} width="100%" style={{ display: "block", aspectRatio: "1" }} role="img">
        {[0, ...lines].map((v) => (
          <g key={v} stroke="rgba(255,255,255,0.08)" strokeWidth={6}>
            <line x1={v} y1={-half} x2={v} y2={half} />
            <line x1={-half} y1={v} x2={half} y2={v} />
          </g>
        ))}
        {shapes.map((shape, index) => (
          <ShapeMark key={index} shape={shape} fill={`rgba(${tone}, ${shapes.length > 1 ? 0.22 : 0.35})`} stroke={`rgba(${tone}, 0.9)`} />
        ))}
        <circle cx={0} cy={0} r={half * 0.045} fill="#63b3ed" stroke="white" strokeWidth={10} />
        <path d={`M 0 ${-half * 0.12} l ${-half * 0.035} ${half * 0.05} h ${half * 0.07} Z`} fill="white" />
      </svg>
    </Box>
  );
};
