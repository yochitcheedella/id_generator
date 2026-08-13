// EXIF orientation extraction (pure JS, no external library)
// Returns orientation value 1-8 per EXIF spec, or 1 if not found

export async function getExifOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) { resolve(1); return; }
      const view = new DataView(buffer);

      // JPEG starts with FF D8
      if (view.getUint16(0) !== 0xFFD8) { resolve(1); return; }

      let offset = 2;
      const length = buffer.byteLength;

      while (offset < length) {
        if (offset + 2 > length) break;
        const marker = view.getUint16(offset);
        offset += 2;

        if (marker === 0xFFE1) {
          // APP1 marker (EXIF)
          if (offset + 4 > length) break;
          offset += 2; // skip length bytes

          // Check for "Exif" string
          if (view.getUint32(offset) !== 0x45786966) { resolve(1); return; }
          offset += 6; // skip "Exif\0\0"

          // Determine byte order
          const tiffOffset = offset;
          const littleEndian = view.getUint16(offset) === 0x4949;
          const getU16 = (o: number) => view.getUint16(o, littleEndian);
          const getU32 = (o: number) => view.getUint32(o, littleEndian);

          // IFD0 offset
          const ifdOffset = tiffOffset + getU32(tiffOffset + 4);
          const entryCount = getU16(ifdOffset);

          for (let i = 0; i < entryCount; i++) {
            const entryOffset = ifdOffset + 2 + i * 12;
            if (entryOffset + 12 > length) break;
            const tag = getU16(entryOffset);
            if (tag === 0x0112) {
              // Orientation tag
              const value = getU16(entryOffset + 8);
              resolve(value >= 1 && value <= 8 ? value : 1);
              return;
            }
          }
          resolve(1);
          return;
        } else if ((marker & 0xFF00) !== 0xFF00) {
          break;
        } else {
          if (offset + 2 > length) break;
          offset += view.getUint16(offset);
        }
      }
      resolve(1);
    };
    reader.onerror = () => resolve(1);
    // Read only the first 128KB (enough for EXIF)
    reader.readAsArrayBuffer(file.slice(0, 131072));
  });
}

/**
 * Apply EXIF orientation by drawing onto a corrected canvas.
 * Returns the corrected canvas ready for composition.
 */
export function applyOrientation(
  img: HTMLImageElement | HTMLCanvasElement,
  orientation: number,
): HTMLCanvasElement {
  const w = img instanceof HTMLCanvasElement ? img.width : img.naturalWidth;
  const h = img instanceof HTMLCanvasElement ? img.height : img.naturalHeight;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Orientations 5-8 swap width/height
  if (orientation >= 5 && orientation <= 8) {
    canvas.width = h;
    canvas.height = w;
  } else {
    canvas.width = w;
    canvas.height = h;
  }

  switch (orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, w, 0); break;
    case 3: ctx.transform(-1, 0, 0, -1, w, h); break;
    case 4: ctx.transform(1, 0, 0, -1, 0, h); break;
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
    case 6: ctx.transform(0, 1, -1, 0, h, 0); break;
    case 7: ctx.transform(0, -1, -1, 0, h, w); break;
    case 8: ctx.transform(0, -1, 1, 0, 0, w); break;
    default: break; // orientation 1 = normal
  }

  ctx.drawImage(img, 0, 0);
  return canvas;
}
