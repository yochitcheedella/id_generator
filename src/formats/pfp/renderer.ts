// Format A — PFP Frame Renderer
// Canvas: 1080 × 1080 px — unmistakably HH Goa 2026

import { canvasToBlob, waitForFonts, drawText } from '../../lib/image/canvas';
import {
  PFP_CANVAS_W, PFP_CANVAS_H
} from './template';
import { calculateCoverCrop as computeCoverCrop } from '../../lib/image/crop';

export interface GeneratedAsset {
  blob: Blob;
  objectUrl: string;
  filename: string;
}

export async function renderPfp(imageElement: HTMLImageElement): Promise<GeneratedAsset> {
  const canvas = document.createElement('canvas');
  canvas.width = PFP_CANVAS_W;
  canvas.height = PFP_CANVAS_H;
  const ctx = canvas.getContext('2d')!;

  // 1. Calculate Crop (circle in center)
  const avatarRadius = 420;
  const centerX = PFP_CANVAS_W / 2;
  const centerY = PFP_CANVAS_H / 2 - 20;

  const crop = computeCoverCrop(
    imageElement.width,
    imageElement.height,
    avatarRadius * 2,
    avatarRadius * 2
  );

  // 2. Draw Frame Background
  ctx.fillStyle = '#0b663b'; // Deep green
  ctx.fillRect(0, 0, PFP_CANVAS_W, PFP_CANVAS_H);

  // 3. Draw Corner Accents
  ctx.fillStyle = '#ff007f'; // Magenta top-left
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(240, 0);
  ctx.lineTo(0, 240);
  ctx.fill();

  ctx.fillStyle = '#ff007f'; // Pink top-right
  ctx.beginPath();
  ctx.moveTo(PFP_CANVAS_W, 0);
  ctx.lineTo(PFP_CANVAS_W, 240);
  ctx.lineTo(PFP_CANVAS_W - 240, 0);
  ctx.fill();

  // 4. Draw Avatar Crop
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, avatarRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(imageElement, crop.dx, crop.dy, crop.dWidth, crop.dHeight);
  ctx.restore();

  // 5. Draw Avatar Ring
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#ff007f'; // Magenta ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, avatarRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#f3e018'; // Inner yellow ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, avatarRadius - 8, 0, Math.PI * 2);
  ctx.stroke();

  // 6. Draw Text Label
  await waitForFonts();
  drawText(ctx, 'HACKER HOUSE GOA 2026', centerX, PFP_CANVAS_H - 45, {
    font: 'normal 56px VT323, monospace',
    fillStyle: '#f3e018',
    textAlign: 'center',
  });

  // 7. Draw Bottom Bar
  const gradient = ctx.createLinearGradient(0, 0, PFP_CANVAS_W, 0);
  gradient.addColorStop(0, '#ff007f');
  gradient.addColorStop(0.5, '#f3e018');
  gradient.addColorStop(1, '#ff007f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, PFP_CANVAS_H - 16, PFP_CANVAS_W, 16);

  // Export
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
  return {
    blob,
    objectUrl: URL.createObjectURL(blob),
    filename: `HH_Goa_2026_Frame_${Date.now()}.jpg`,
  };
}
