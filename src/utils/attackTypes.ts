import type { ICycleRotation } from "../interfaces";

/**
 * Full attack name of a rotation
 */
export const handleAttackType = (rotation: ICycleRotation): string => {
  switch (rotation.attack) {
    case 'R':
      return 'Rouge';
    case 'B':
      return 'Bleu';
    default:
      return 'Inconnu';
  }
};

/**
 * Full name of an attack code ('R', 'B', …)
 */
export const getAttackTypeName = (attackCode: string): string => {
  switch (attackCode) {
    case 'R':
      return 'Rouge';
    case 'B':
      return 'Bleu';
    default:
      return 'Inconnu';
  }
};