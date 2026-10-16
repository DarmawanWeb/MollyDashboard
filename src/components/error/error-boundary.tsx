"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Custom fallback. Receives error + reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Called on error — useful for sending to telemetry. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

/**
 * React error boundary.
 *
 * React requires this to be a class component — there's no hooks API for
 * catching render errors. This is the one place in the codebase where a
 * class component is justified.
 *
 * Use this for any subtree where a render error in a leaf shouldn't blow
 * up the whole dashboard. Typical placements: per-route, around the map
 * canvas, around the camera feed. Lighter than the default Next.js error
 * page because it preserves the surrounding chrome.
 *
 * For Next.js route-level errors, prefer the per-route `error.tsx`
 * convention — Next wraps it in an error boundary automatically.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("[error-boundary] caught:", error, info);
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return <DefaultFallback error={this.state.error} reset={this.reset} />;
    }
    return this.props.children;
  }
}

function DefaultFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      role="alert"
      className="panel-inset px-4 py-3 flex flex-col gap-2 text-xs"
    >
      <span className="label text-red">Something went wrong</span>
      <pre className="font-mono text-[10px] text-txt-muted whitespace-pre-wrap break-words">
        {error.message}
      </pre>
      <button
        type="button"
        onClick={reset}
        className="btn btn-ghost self-start"
      >
        Try again
      </button>
    </div>
  );
}
