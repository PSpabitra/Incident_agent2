import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center px-4">
          <AlertOctagon className="h-10 w-10 text-critical mb-3" />
          <p className="text-lg font-semibold text-foreground">Something went wrong</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <Button onClick={this.reset} className="mt-4">
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
