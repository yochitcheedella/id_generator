// X intent sharing utility — per spec §13.3

const CAPTION = "Just got my HH Goa 2026 frame! #FrameInGoa";

/**
 * Build X (Twitter) intent URL with prefilled caption and share URL.
 */
export function buildXIntentUrl(shareUrl: string): string {
  const params = new URLSearchParams({
    text: CAPTION,
    url: shareUrl,
  });
  return `https://x.com/intent/post?${params.toString()}`;
}

/**
 * Open X composer in a new window.
 */
export function openXIntent(shareUrl: string): void {
  const url = buildXIntentUrl(shareUrl);
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
}

/**
 * Attempt native Web Share with the image file.
 * Returns true if successful, false if not supported or failed.
 */
export async function tryNativeShare(blob: Blob, filename: string): Promise<boolean> {
  if (!navigator.share) return false;

  const file = new File([blob], filename, { type: blob.type });

  if (navigator.canShare && !navigator.canShare({ files: [file] })) {
    return false;
  }

  try {
    await navigator.share({
      title: 'HH Goa 2026',
      text: CAPTION,
      files: [file],
    });
    return true;
  } catch (err) {
    // User dismissed or share failed
    if (err instanceof Error && err.name === 'AbortError') return false;
    return false;
  }
}

/**
 * Copy text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to execCommand
    }
  }
  // Fallback
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.focus();
  el.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(el);
  return ok;
}
