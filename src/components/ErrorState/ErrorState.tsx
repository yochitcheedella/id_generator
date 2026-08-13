// ErrorState — recoverable error card
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import './ErrorState.css';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  onBack,
  retryLabel = 'Try Again',
}: ErrorStateProps) {
  return (
    <div className="error-state animate-fadeIn" role="alert">
      <div className="error-state__icon" aria-hidden="true">
        <AlertTriangle size={32} />
      </div>
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__message">{message}</p>
      <div className="error-state__actions">
        {onRetry && (
          <button className="btn btn-primary" onClick={onRetry} id="retry-btn">
            <RefreshCw size={16} />
            {retryLabel}
          </button>
        )}
        {onBack && (
          <button className="btn btn-ghost" onClick={onBack} id="back-btn">
            <ArrowLeft size={16} />
            Start Over
          </button>
        )}
      </div>
    </div>
  );
}
