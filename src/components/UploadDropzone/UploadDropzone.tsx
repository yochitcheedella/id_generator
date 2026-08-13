// UploadDropzone component
import { useRef, useState, useCallback } from 'react';
import { Upload, ImageIcon, X } from 'lucide-react';
import './UploadDropzone.css';

interface UploadDropzoneProps {
  onFile: (file: File) => void;
  isLoading?: boolean;
  currentFile?: File | null;
  onReplace?: () => void;
}

const ACCEPTED = '.jpg,.jpeg,.png,.heic,.heif';
const ACCEPTED_LABEL = 'JPG, PNG or HEIC · Max 25 MB';

export function UploadDropzone({ onFile, isLoading, currentFile, onReplace }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    onFile(file);
  }, [onFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  if (currentFile && !isLoading) {
    return (
      <div className="upload-selected animate-fadeIn">
        <div className="upload-selected__icon" aria-hidden="true">
          <ImageIcon size={28} />
        </div>
        <div className="upload-selected__info">
          <span className="upload-selected__name">{currentFile.name}</span>
          <span className="upload-selected__size">
            {(currentFile.size / 1024 / 1024).toFixed(1)} MB · Ready
          </span>
        </div>
        <button
          className="btn btn-ghost btn-sm upload-selected__replace"
          onClick={() => { onReplace?.(); inputRef.current?.click(); }}
          aria-label="Replace photo"
        >
          <X size={14} />
          Replace
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={handleInputChange}
          aria-label="Replace photo"
        />
      </div>
    );
  }

  return (
    <div
      className={`upload-dropzone ${isDragOver ? 'upload-dropzone--drag' : ''} ${isLoading ? 'upload-dropzone--loading' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !isLoading && inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Upload photo — click or drag and drop"
      aria-disabled={isLoading}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Choose photo file"
        disabled={isLoading}
      />

      {isLoading ? (
        <div className="upload-dropzone__loading">
          <div className="spinner" aria-label="Loading" />
          <span>Reading image…</span>
        </div>
      ) : (
        <>
          <div className="upload-dropzone__icon" aria-hidden="true">
            <Upload size={32} />
          </div>
          <div className="upload-dropzone__text">
            <p className="upload-dropzone__primary">
              {isDragOver ? 'Drop your photo here' : 'Click to upload your photo'}
            </p>
            <p className="upload-dropzone__secondary">or drag and drop</p>
          </div>
          <p className="upload-dropzone__hint">{ACCEPTED_LABEL}</p>
        </>
      )}
    </div>
  );
}
