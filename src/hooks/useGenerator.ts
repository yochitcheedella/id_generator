// useGenerator — orchestrates the image generation state machine

import { useState, useCallback } from 'react';
import { renderPfp as renderPfpFrame, type GeneratedAsset as PfpAsset } from '../formats/pfp/renderer';
import { renderBuilderCard, type GeneratedAsset as BuilderAsset } from '../formats/builder/renderer';
import { downloadBlob } from '../lib/image/download';

export type Format = 'pfp' | 'builder';

export interface BuilderFields {
  name: string;
  role: string;
  secondary?: string;
}

export type GeneratorState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'ready'; asset: PfpAsset | BuilderAsset }
  | { status: 'error'; error: string };

export function useGenerator() {
  const [state, setState] = useState<GeneratorState>({ status: 'idle' });

  const generate = useCallback(async (
    format: Format,
    sourceImage: HTMLImageElement | HTMLCanvasElement,
    fields?: BuilderFields,
  ) => {
    setState({ status: 'generating' });
    try {
      let asset: PfpAsset | BuilderAsset;
      const imgElement = sourceImage as HTMLImageElement;

      if (format === 'pfp') {
        asset = await renderPfpFrame(imgElement);
      } else {
        if (!fields?.name || !fields?.role) {
          throw new Error('Name and Role are required for the Builder ID Card.');
        }
        asset = await renderBuilderCard(imgElement, {
          name: fields.name,
          role: fields.role,
          secondary: fields.secondary || '',
        });
      }

      setState({ status: 'ready', asset });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate image.';
      setState({ status: 'error', error: msg });
    }
  }, []);

  const download = useCallback(() => {
    if (state.status !== 'ready') return;
    const { asset } = state;
    downloadBlob(asset.blob, asset.filename);
  }, [state]);

  const reset = useCallback(() => {
    if (state.status === 'ready') {
      URL.revokeObjectURL(state.asset.objectUrl);
    }
    setState({ status: 'idle' });
  }, [state]);

  const retry = useCallback((
    format: Format,
    sourceImage: HTMLImageElement | HTMLCanvasElement,
    fields?: BuilderFields,
  ) => {
    generate(format, sourceImage, fields);
  }, [generate]);

  return { state, generate, download, reset, retry };
}
