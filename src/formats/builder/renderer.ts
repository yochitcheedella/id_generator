// Format B — Builder ID Card
// Canvas: 1200 × 1500 px (4:5 vertical)

import { canvasToBlob, waitForFonts, drawText } from '../../lib/image/canvas';
import { CARD_CANVAS_W as BUILDER_CANVAS_W, CARD_CANVAS_H as BUILDER_CANVAS_H } from './template';
import type { BuilderFormData } from '../../components/BuilderForm/BuilderForm';

export interface GeneratedAsset {
  blob: Blob;
  objectUrl: string;
  filename: string;
}

export async function renderBuilderCard(
  imageElement: HTMLImageElement,
  data: BuilderFormData
): Promise<GeneratedAsset> {
  const canvas = document.createElement('canvas');
  canvas.width = BUILDER_CANVAS_W;
  canvas.height = BUILDER_CANVAS_H;
  const ctx = canvas.getContext('2d')!;

  // 1. Draw Background
  ctx.fillStyle = '#0b663b';
  ctx.fillRect(0, 0, BUILDER_CANVAS_W, BUILDER_CANVAS_H);

  // 1.5 Draw Coconut Tree Pattern
  const treePath = new Path2D("M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4 M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3 M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35 M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14");
  
  ctx.save();
  ctx.strokeStyle = '#f3e018'; // yellow
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.2; // subtle background pattern

  const patternScale = 6;
  const spacingX = 240;
  const spacingY = 240;

  for (let y = -spacingY; y < BUILDER_CANVAS_H + spacingY; y += spacingY) {
    for (let x = -spacingX; x < BUILDER_CANVAS_W + spacingX; x += spacingX) {
      const offsetX = (Math.abs(y / spacingY) % 2) === 1 ? spacingX / 2 : 0;
      ctx.save();
      // center the tree in its cell
      ctx.translate(x + offsetX + spacingX/2 - (24 * patternScale)/2, y + spacingY/2 - (24 * patternScale)/2);
      ctx.scale(patternScale, patternScale);
      ctx.stroke(treePath);
      ctx.restore();
    }
  }
  ctx.restore();

  // 2. Yellow border around the entire card (drawn as 4 filled strips)
  const borderThickness = 18;
  ctx.fillStyle = '#f3e018';
  ctx.fillRect(0, 0, BUILDER_CANVAS_W, borderThickness);                                        // top
  ctx.fillRect(0, BUILDER_CANVAS_H - borderThickness, BUILDER_CANVAS_W, borderThickness);       // bottom
  ctx.fillRect(0, 0, borderThickness, BUILDER_CANVAS_H);                                        // left
  ctx.fillRect(BUILDER_CANVAS_W - borderThickness, 0, borderThickness, BUILDER_CANVAS_H);       // right

  // 3. (Removed Corner Accent)

  // 4. Draw Photo Box (centered, aspect ratio preserved)
  const maxPhotoWidth = 700;
  const maxPhotoHeight = 700;
  const ratio = Math.min(maxPhotoWidth / imageElement.width, maxPhotoHeight / imageElement.height);
  const photoW = imageElement.width * ratio;
  const photoH = imageElement.height * ratio;

  const textSpace = data.secondary ? 260 : 200;
  const totalContentHeight = photoH + 80 + textSpace;
  const contentStartY = (BUILDER_CANVAS_H - totalContentHeight) / 2;

  const photoX = (BUILDER_CANVAS_W - photoW) / 2;
  const photoY = contentStartY;

  ctx.save();
  ctx.drawImage(imageElement, photoX, photoY, photoW, photoH);
  ctx.restore();

  // Draw Photo Border
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#f3e018';
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  // 5. Draw Info Text
  await waitForFonts();
  
  const textX = BUILDER_CANVAS_W / 2;
  let textY = photoY + photoH + 120;

  // Name
  drawText(ctx, data.name.toUpperCase(), textX, textY, {
    font: 'normal 96px VT323, monospace',
    fillStyle: '#f3e018',
    textAlign: 'center',
  });
  textY += 100;

  // Role
  drawText(ctx, data.role.toUpperCase(), textX, textY, {
    font: 'normal 64px VT323, monospace',
    fillStyle: '#ff007f',
    strokeStyle: '#f3e018',
    lineWidth: 6,
    textAlign: 'center',
  });
  textY += 60;

  // Secondary
  if (data.secondary) {
    drawText(ctx, data.secondary, textX, textY, {
      font: 'normal 42px VT323, monospace',
      fillStyle: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
    });
  }

  // 6. Draw Footer Typography (HACKER HOUSE GOA)
  const brandY = BUILDER_CANVAS_H - 240;
  
  // "HACKER HOUSE"
  drawText(ctx, 'HACKER HOUSE', BUILDER_CANVAS_W / 2, brandY, {
    font: 'bold 136px Playfair Display, serif',
    fillStyle: '#f3e018',
    textAlign: 'center',
  });

  // "IDENTITY CARD"
  drawText(ctx, 'IDENTITY CARD', BUILDER_CANVAS_W / 2, brandY + 90, {
    font: 'normal 80px VT323, monospace',
    fillStyle: '#ff007f', // pink
    strokeStyle: '#f3e018', // yellow
    lineWidth: 8,
    textAlign: 'center',
  });

  // "गोवा" overlay
  ctx.save();
  ctx.translate(BUILDER_CANVAS_W / 2, brandY - 20);
  ctx.rotate(-5 * Math.PI / 180);
  drawText(ctx, 'गोवा', 0, 0, {
    font: 'normal 82px Yatra One, system-ui',
    fillStyle: '#f3e018',
    strokeStyle: '#ff007f',
    lineWidth: 16,
    textAlign: 'center',
  });
  ctx.restore();

  // Bottom text row
  drawText(ctx, 'GOA, INDIA · 28 - 31 OCT 2026', 100, BUILDER_CANVAS_H - 80, {
    font: 'normal 36px VT323, monospace',
    fillStyle: '#f3e018',
    textAlign: 'left',
  });

  drawText(ctx, '2:47 PM STUDIO', BUILDER_CANVAS_W - 100, BUILDER_CANVAS_H - 80, {
    font: 'normal 36px VT323, monospace',
    fillStyle: '#f3e018',
    textAlign: 'right',
  });

  // Export
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
  return {
    blob,
    objectUrl: URL.createObjectURL(blob),
    filename: `HH_Goa_2026_ID_${Date.now()}.jpg`,
  };
}
