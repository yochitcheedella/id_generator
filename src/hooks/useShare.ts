// useShare — uploads generated image to backend and manages share URL

import { useState, useCallback } from 'react';

export type ShareState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'ready'; shareUrl: string; imageUrl: string; shareId: string }
  | { status: 'error'; error: string };

export interface SharePayload {
  blob: Blob;
  filename: string;
  format: 'pfp' | 'builder';
  name?: string;
  role?: string;
}

export function useShare() {
  const [state, setState] = useState<ShareState>({ status: 'idle' });

  const upload = useCallback(async (payload: SharePayload) => {
    setState({ status: 'uploading' });

    try {
      const form = new FormData();
      form.append('image', payload.blob, payload.filename);
      form.append('format', payload.format);
      if (payload.name) form.append('name', payload.name.slice(0, 100));
      if (payload.role) form.append('role', payload.role.slice(0, 100));

      const res = await fetch('/api/share', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Server error: ${res.status}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Share failed');
      }

      setState({
        status: 'ready',
        shareUrl: data.shareUrl,
        imageUrl: data.imageUrl,
        shareId: data.shareId,
      });

      return data as { shareUrl: string; imageUrl: string; shareId: string };
    } catch (err) {
      const msg =
        err instanceof TypeError && err.message.includes('fetch')
          ? 'Network error. Check your connection and try again.'
          : err instanceof Error
          ? err.message
          : 'Failed to create share link.';
      setState({ status: 'error', error: msg });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return { state, upload, reset };
}
