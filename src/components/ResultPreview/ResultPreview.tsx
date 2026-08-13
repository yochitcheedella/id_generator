// ResultPreview — shows generated image + action buttons
import { useState, useCallback } from 'react';
import { Download, Copy, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import type { GeneratedAsset } from '../../formats/pfp/renderer';
import type { Format } from '../../hooks/useGenerator';
import { useShare } from '../../hooks/useShare';
import { openXIntent, copyToClipboard } from '../../lib/xShare';
import './ResultPreview.css';

interface ResultPreviewProps {
  asset: GeneratedAsset;
  format: Format;
  name?: string;
  role?: string;
  onDownload: () => void;
  onCreateAnother: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export function ResultPreview({
  asset,
  format,
  name,
  role,
  onDownload,
  onCreateAnother,
  onToast,
}: ResultPreviewProps) {
  const { state: shareState, upload, reset: resetShare } = useShare();
  const [copyDone, setCopyDone] = useState(false);

  const getOrCreateShareUrl = useCallback(async (): Promise<string | null> => {
    if (shareState.status === 'ready') return shareState.shareUrl;

    try {
      const result = await upload({
        blob: asset.blob,
        filename: asset.filename,
        format,
        name,
        role,
      });
      return result.shareUrl;
    } catch {
      return null;
    }
  }, [shareState, upload, asset, format, name, role]);

  const handleShareX = async () => {
    const fallbackUrl = window.location.origin;
    openXIntent(fallbackUrl);
  };

  const handleCopyLink = async () => {
    const shareUrl = await getOrCreateShareUrl();
    if (!shareUrl) {
      onToast('Could not create share link. Try downloading instead.', 'error');
      return;
    }
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopyDone(true);
      onToast('Share link copied!', 'success');
      setTimeout(() => setCopyDone(false), 2500);
    } else {
      onToast('Could not copy to clipboard. Try selecting the URL manually.', 'error');
    }
  };

  const isUploading = shareState.status === 'uploading';

  return (
    <div className="result animate-slideUp">
      {/* Preview Image */}
      <div className="result__preview-wrap">
        <img
          src={asset.objectUrl}
          alt="Your HH Goa 2026 generated graphic"
          className="result__image"
          draggable={false}
        />
      </div>

      {/* Actions */}
      <div className="result__actions">
        {/* Primary: Download */}
        <button
          className="btn btn-primary btn-lg result__btn-download"
          onClick={onDownload}
          id="download-btn"
        >
          <Download size={18} />
          Download Image
        </button>

        {/* Share row */}
        <div className="result__share-row">
          <button
            className="btn btn-secondary result__btn-x"
            onClick={handleShareX}
            disabled={isUploading}
            id="share-x-btn"
            aria-label="Share on X (Twitter)"
          >
            {isUploading ? (
              <Loader2 size={16} className="result__spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            )}
            {isUploading ? 'Uploading…' : 'Share on X'}
          </button>

          <button
            className={`btn btn-outline result__btn-copy ${copyDone ? 'result__btn-copy--done' : ''}`}
            onClick={handleCopyLink}
            disabled={isUploading}
            id="copy-link-btn"
            aria-label="Copy share link to clipboard"
          >
            {copyDone ? (
              <CheckCircle size={16} />
            ) : isUploading ? (
              <Loader2 size={16} className="result__spin" />
            ) : (
              <Copy size={16} />
            )}
            {copyDone ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Share error retry */}
        {shareState.status === 'error' && (
          <div className="result__share-error">
            <span>Share failed — download still works</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { resetShare(); }}
            >
              <RefreshCw size={13} />
              Retry share
            </button>
          </div>
        )}

        {/* Create another */}
        <button
          className="btn btn-ghost result__btn-another"
          onClick={onCreateAnother}
          id="create-another-btn"
        >
          <RefreshCw size={16} />
          Create Another
        </button>
      </div>

      {/* Hashtag reminder */}
      <p className="result__caption-hint">
        Caption includes <span className="text-gradient-teal">#FrameInGoa</span> ✓
      </p>
    </div>
  );
}
