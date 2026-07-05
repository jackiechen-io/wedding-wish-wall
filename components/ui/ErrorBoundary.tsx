'use client';

import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
            <div>
              <p className="font-serif text-3xl text-neutral-400">Oops!</p>
              <p className="mt-3 text-sm text-neutral-400">Something went wrong. Please refresh the page.</p>
              <button
                onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
                className="mt-5 rounded-2xl bg-neutral-900 px-6 py-3 text-sm text-white"
              >
                Refresh
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
