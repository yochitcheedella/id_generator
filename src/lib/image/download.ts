// Download utility — per spec §22

/**
 * Trigger a browser file download from a Blob.
 * Safe filename sanitization included.
 */
export function downloadBlob(blob: Blob, rawFilename: string): void {
  const filename = sanitizeFilename(rawFilename);
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after a short delay to ensure download initiates
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

/**
 * Sanitize a filename by removing path traversal and special characters.
 */
export function sanitizeFilename(raw: string): string {
  return raw
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^[\s.]+|[\s.]+$/g, '')
    .slice(0, 200) || 'hh-goa-2026.png';
}
