/**
 * Compresses an image through a canvas to reduce the payload size.
 * Used before OCR uploads to stay under the 4.5MB Vercel limit.
 *
 * @param dataUrl - Base64 data URL of the image
 * @param maxDimension - Maximum width or height, in px
 * @param quality - JPEG quality (0 to 1)
 * @returns The compressed image as a base64 JPEG data URL
 */
export const compressImage = (
  dataUrl: string,
  maxDimension = 1400,
  quality = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

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

      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };
    img.onerror = () => reject(new Error("Erreur de chargement de l'image"));
    img.src = dataUrl;
  });
};
