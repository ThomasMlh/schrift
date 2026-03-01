/**
 * Compresse une image via Canvas pour réduire la taille du payload.
 * Utilisé avant l'envoi OCR pour rester sous la limite de 4.5MB de Vercel.
 *
 * @param dataUrl - L'image en base64 data URL
 * @param maxDimension - Dimension maximale (largeur ou hauteur) en px
 * @param quality - Qualité JPEG (0 à 1)
 * @returns L'image compressée en base64 data URL (JPEG)
 */
export function compressImage(
  dataUrl: string,
  maxDimension = 1400,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Redimensionner si nécessaire
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Impossible de créer le contexte canvas"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convertir en JPEG compressé
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };
    img.onerror = () => reject(new Error("Erreur de chargement de l'image"));
    img.src = dataUrl;
  });
}
