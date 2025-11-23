import type { ICycleRotation } from "../interfaces";

/**
 * Convertit le code d'attaque en nom complet
 * @param rotation - La rotation contenant le code d'attaque
 * @returns Le nom complet de l'attaque
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
 * Convertit juste le code d'attaque en nom complet
 * @param attackCode - Le code d'attaque ('R', 'B', etc.)
 * @returns Le nom complet de l'attaque
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