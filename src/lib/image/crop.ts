// Cover-crop math per spec §7.3
// Fits source image into a target region using cover/fill (no distortion)

export interface CropParams {
  dx: number;
  dy: number;
  dWidth: number;
  dHeight: number;
}

/**
 * Calculate cover-crop parameters.
 * Scales the source so the smaller dimension fills the target,
 * then centers the result.
 *
 * @param sw Source width
 * @param sh Source height
 * @param tw Target region width
 * @param th Target region height
 * @param offsetX Optional horizontal pan offset (pixels, clamped)
 * @param offsetY Optional vertical pan offset (pixels, clamped)
 */
export function calculateCoverCrop(
  sw: number,
  sh: number,
  tw: number,
  th: number,
  offsetX = 0,
  offsetY = 0,
): CropParams {
  // Scale to fill target
  const scale = Math.max(tw / sw, th / sh);
  const dWidth = sw * scale;
  const dHeight = sh * scale;

  // Clamp offsets so photo never reveals empty bg
  const maxOffsetX = (dWidth - tw) / 2;
  const maxOffsetY = (dHeight - th) / 2;
  const clampedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, offsetX));
  const clampedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, offsetY));

  const dx = (tw - dWidth) / 2 + clampedX;
  const dy = (th - dHeight) / 2 + clampedY;

  return { dx, dy, dWidth, dHeight };
}

/**
 * Draw source image into a canvas region using cover-crop logic.
 * Saves/restores context so clipping doesn't leak.
 */
export function drawCoverCrop(
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement | HTMLCanvasElement,
  regionX: number,
  regionY: number,
  regionW: number,
  regionH: number,
  offsetX = 0,
  offsetY = 0,
  clipPath?: Path2D,
): void {
  const sw = source instanceof HTMLCanvasElement ? source.width : source.naturalWidth;
  const sh = source instanceof HTMLCanvasElement ? source.height : source.naturalHeight;

  const { dx, dy, dWidth, dHeight } = calculateCoverCrop(sw, sh, regionW, regionH, offsetX, offsetY);

  ctx.save();

  // Clip to region
  if (clipPath) {
    ctx.clip(clipPath);
  } else {
    ctx.beginPath();
    ctx.rect(regionX, regionY, regionW, regionH);
    ctx.clip();
  }

  ctx.drawImage(source, regionX + dx, regionY + dy, dWidth, dHeight);
  ctx.restore();
}
