// Alteration name -> image
const alterationImages = {
  "ralentissement": "https://i.ibb.co/7CKHhnD/ralentissement.png",
  "poison": "https://i.ibb.co/4pwFWtd/poison.png",
  "paralysie": "https://i.ibb.co/0s0bVgP/paralysie.png",
  "laceration": "https://i.ibb.co/2y58gPv/laceration.png",
  "gel": "https://i.ibb.co/dGkrhd4/gel.png",
  "feu": "https://i.ibb.co/b2Ykpdr/feu.png",
  "faiblesse": "https://i.ibb.co/0Bx31gd/faiblesse.png",
  "confusion": "https://i.ibb.co/qRWdcLp/confusion.png",
  "erosion": "https://i.ibb.co/sQYL4XG/erosion.png",
};

/**
 * Image URL of an alteration, or null when unknown
 */
export const getAlterationImage = (alteration: string): string | null => {
  const normalizedAlteration = alteration.toLowerCase().trim();
  return alterationImages[normalizedAlteration as keyof typeof alterationImages] || null;
};

/**
 * Every alteration with its image URL
 */
export const getAllAlterations = () => {
  return alterationImages;
};