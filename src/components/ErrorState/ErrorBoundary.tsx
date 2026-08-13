import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorState } from './ErrorState';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ErrorState 
            title="Application Error"
            message={this.state.error?.message || "An unexpected error occurred."}
            onRetry={() => window.location.reload()}
            retryLabel="Reload Page"
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
