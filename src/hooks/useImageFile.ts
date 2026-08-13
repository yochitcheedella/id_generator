// useImageFile — handles file selection, validation, EXIF decode, orientation fix

import { useState, useCallback } from 'react';
import { validateFile, type ValidationResult } from '../lib/validation';
import { decodeImage, resizeIfNeeded } from '../lib/image/decode';
import { getExifOrientation, applyOrientation } from '../lib/image/exif';

export type ImageFileState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; file: File; image: HTMLImageElement | HTMLCanvasElement }
  | { status: 'error'; error: string; code: string };

export function useImageFile() {
  const [state, setState] = useState<ImageFileState>({ status: 'idle' });

  const processFile = useCallback(async (file: File) => {
    // 1. Validate
    const validation: ValidationResult = validateFile(file);
    if (!validation.valid) {
      setState({ status: 'error', error: validation.message!, code: validation.code! });
      return;
    }

    setState({ status: 'loading' });

    try {
      // 2. Decode
      const rawImage = await decodeImage(file);

      // 3. Resize if too large
      const resized = resizeIfNeeded(rawImage, 4096);

      // 4. EXIF orientation (JPEG and HEIC-converted-to-JPEG)
      let orientedImage: HTMLImageElement | HTMLCanvasElement = resized;
      const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg' || /\.jpe?g$/i.test(file.name);
      const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.name);
      if (isJpeg || isHeic) {
        const orientation = await getExifOrientation(file);
        if (orientation > 1) {
          orientedImage = applyOrientation(resized, orientation);
        }
      }

      setState({ status: 'ready', file, image: orientedImage });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error processing image';
      const isHeic = message.includes('HEIC_NOT_SUPPORTED');
      setState({
        status: 'error',
        error: isHeic
          ? 'HEIC files are not supported in this browser. Please use JPG or PNG.'
          : 'Could not read the image. The file may be corrupt or unsupported.',
        code: isHeic ? 'HEIC_NOT_SUPPORTED' : 'DECODE_ERROR',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return { state, processFile, reset };
}
