"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - catches client-side rendering errors in children widgets
 * and displays a fallback UI instead of breaking the entire application.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `ErrorBoundary caught an error in component "${this.props.name || "Unknown"}":`,
      error,
      errorInfo,
    );
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default generic fallback UI
      return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm font-semibold text-red-500">
            Failed to render {this.props.name || "component"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Please refresh the page or contact support if the issue persists.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
