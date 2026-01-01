import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-discord-dark">
          <div className="bg-discord-darker rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="text-discord-red text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-discord-text mb-2">
                Something went wrong
              </h2>
              <p className="text-discord-muted mb-4">
                An unexpected error occurred. Please refresh the page and try
                again.
              </p>
              {this.state.error && (
                <details className="text-left text-discord-muted text-sm">
                  <summary className="cursor-pointer hover:text-discord-text mb-2">
                    Error details
                  </summary>
                  <pre className="bg-discord-darker p-2 rounded overflow-auto text-xs">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary w-full"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
