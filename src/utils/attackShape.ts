import type { AttackShape } from "@/interfaces";

// Furthest point an attack reaches from the character, in game units
export const shapeReach = (shape: AttackShape | null) => {
  if (!shape) return 0;
  switch (shape.kind) {
    case "sector": return shape.radius ?? 0;
    case "rect": return shape.length ?? 0;
    case "circle": return (shape.distance ?? 0) + (shape.radius ?? 0);
    case "projectile": return (shape.range ?? shape.length ?? 0) + (shape.impact_radius ?? 0);
  }
};
