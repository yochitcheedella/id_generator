// Canvas helper utilities

/**
 * Export canvas as a Blob (Promise wrapper around toBlob)
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 0.93,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('CANVAS_EXPORT_FAILED: Canvas toBlob returned null'));
      },
      mime,
      quality,
    );
  });
}

/**
 * Wait for all fonts to be loaded before rendering text on canvas
 */
export async function waitForFonts(): Promise<void> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
}

/**
 * Load an image from a URL into an HTMLImageElement
 */
export function loadImageUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Draw rounded rectangle path
 */
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Fit text to a maximum width by reducing font size
 */
export function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  baseFontSize: number,
  minFontSize: number,
  fontStyle: string,
): number {
  let size = baseFontSize;
  ctx.font = `${fontStyle} ${size}px Inter, sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > minFontSize) {
    size -= 2;
    ctx.font = `${fontStyle} ${size}px Inter, sans-serif`;
  }
  return size;
}

/**
 * Wrap text into lines respecting maxWidth
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Draw text with optional shadow
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    font?: string;
    fillStyle?: string;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    maxWidth?: number;
    strokeStyle?: string;
    lineWidth?: number;
  } = {},
): void {
  ctx.save();
  if (options.font) ctx.font = options.font;
  if (options.fillStyle) ctx.fillStyle = options.fillStyle;
  if (options.textAlign) ctx.textAlign = options.textAlign;
  if (options.textBaseline) ctx.textBaseline = options.textBaseline;
  if (options.shadowColor) ctx.shadowColor = options.shadowColor;
  if (options.shadowBlur !== undefined) ctx.shadowBlur = options.shadowBlur;
  if (options.shadowOffsetX !== undefined) ctx.shadowOffsetX = options.shadowOffsetX;
  if (options.shadowOffsetY !== undefined) ctx.shadowOffsetY = options.shadowOffsetY;

  if (options.strokeStyle) {
    ctx.strokeStyle = options.strokeStyle;
    if (options.lineWidth !== undefined) {
      ctx.lineWidth = options.lineWidth;
      ctx.lineJoin = 'round';
    }
    if (options.maxWidth !== undefined) {
      ctx.strokeText(text, x, y, options.maxWidth);
    } else {
      ctx.strokeText(text, x, y);
    }
  }

  if (options.maxWidth !== undefined) {
    ctx.fillText(text, x, y, options.maxWidth);
  } else {
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}
