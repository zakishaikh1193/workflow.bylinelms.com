import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-6 text-red-700 bg-red-50 border border-red-200 rounded-lg m-6">
          <div className="font-semibold mb-1">Something went wrong.</div>
          <div className="text-sm">Please reload the page or try again later.</div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;


