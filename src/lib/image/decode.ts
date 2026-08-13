// Image decoding utility
// Handles JPG, PNG, HEIC/HEIF with capability detection

export async function decodeImage(file: File): Promise<HTMLImageElement> {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name);

  let blob: Blob = file;

  if (isHeic) {
    // Try to decode HEIC via lazy-loaded heic2any
    try {
      const heic2any = (await import('heic2any')).default;
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
      blob = Array.isArray(converted) ? converted[0] : converted;
    } catch {
      throw new Error(
        'HEIC_NOT_SUPPORTED: Your browser cannot decode HEIC files. Please convert your photo to JPG or PNG first.',
      );
    }
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('IMAGE_DECODE_FAILED: Could not decode the image. The file may be corrupt.'));
    };
    img.src = url;
  });
}

/**
 * Resize an image to a maximum dimension to avoid memory issues.
 * Returns a new canvas if resizing is needed, or the original image.
 */
export function resizeIfNeeded(
  source: HTMLImageElement,
  maxPx = 4096,
): HTMLCanvasElement | HTMLImageElement {
  const { naturalWidth: w, naturalHeight: h } = source;
  if (w <= maxPx && h <= maxPx) return source;

  const scale = maxPx / Math.max(w, h);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}
