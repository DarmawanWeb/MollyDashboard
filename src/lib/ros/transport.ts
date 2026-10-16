/**
 * Low-level WebSocket transport for rosbridge.
 *
 * Responsibilities:
 *   - Manage WebSocket lifecycle (open, close, error)
 *   - Reconnect with exponential backoff + jitter
 *   - Emit status changes and raw incoming messages via EventTarget
 *
 * Does NOT know about ROS message semantics — that's the client layer's job.
 * This separation makes it easy to unit-test the transport with a mock socket.
 */

import type { ConnectionStatus } from "@/types/ui/connection";

export interface TransportConfig {
  url: string;
  /** Initial reconnect delay in ms. Default 500. */
  initialDelayMs?: number;
  /** Max reconnect delay in ms. Default 30000. */
  maxDelayMs?: number;
  /** Max reconnect attempts before giving up. Default Infinity. */
  maxAttempts?: number;
  /** Jitter factor 0..1. Default 0.3. */
  jitter?: number;
}

export type TransportEventMap = {
  status: CustomEvent<ConnectionStatus>;
  message: CustomEvent<unknown>;
  error: CustomEvent<Error>;
};

export class RosTransport extends EventTarget {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = "disconnected";
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempts = 0;
  private shouldReconnect = false;

  private readonly cfg: Required<TransportConfig>;

  constructor(config: TransportConfig) {
    super();
    this.cfg = {
      initialDelayMs: 500,
      maxDelayMs: 30_000,
      maxAttempts: Number.POSITIVE_INFINITY,
      jitter: 0.3,
      ...config,
    };
  }

  /* ------------------------------------------------------------------------
   * Public API
   * --------------------------------------------------------------------- */

  connect(): void {
    if (
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }
    this.shouldReconnect = true;
    this.openSocket();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnect();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }
    this.setStatus("disconnected");
    this.attempts = 0;
  }

  send(payload: object): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) return false;
    try {
      this.ws.send(JSON.stringify(payload));
      return true;
    } catch (err) {
      this.emitError(err);
      return false;
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /* ------------------------------------------------------------------------
   * Typed event helpers — wrap EventTarget for ergonomics
   * --------------------------------------------------------------------- */

  onStatus(handler: (status: ConnectionStatus) => void): () => void {
    const listener = (e: Event) => {
      handler((e as CustomEvent<ConnectionStatus>).detail);
    };
    this.addEventListener("status", listener);
    // fire immediately with current value
    handler(this.status);
    return () => this.removeEventListener("status", listener);
  }

  onMessage(handler: (msg: unknown) => void): () => void {
    const listener = (e: Event) => {
      handler((e as CustomEvent<unknown>).detail);
    };
    this.addEventListener("message", listener);
    return () => this.removeEventListener("message", listener);
  }

  onError(handler: (err: Error) => void): () => void {
    const listener = (e: Event) => {
      handler((e as CustomEvent<Error>).detail);
    };
    this.addEventListener("error", listener);
    return () => this.removeEventListener("error", listener);
  }

  /* ------------------------------------------------------------------------
   * Internals
   * --------------------------------------------------------------------- */

  private openSocket(): void {
    this.setStatus("reconnecting");
    try {
      const ws = new WebSocket(this.cfg.url);

      ws.onopen = () => {
        this.attempts = 0;
        this.setStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.dispatchEvent(new CustomEvent("message", { detail: data }));
        } catch (err) {
          this.emitError(err);
        }
      };

      ws.onclose = () => {
        this.ws = null;
        this.setStatus("disconnected");
        if (this.shouldReconnect) this.scheduleReconnect();
      };

      ws.onerror = () => {
        this.emitError(new Error(`WebSocket error: ${this.cfg.url}`));
      };

      this.ws = ws;
    } catch (err) {
      this.emitError(err);
      this.setStatus("disconnected");
      if (this.shouldReconnect) this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnect();
    if (this.attempts >= this.cfg.maxAttempts) return;

    const base = Math.min(
      this.cfg.initialDelayMs * 2 ** this.attempts,
      this.cfg.maxDelayMs,
    );
    // jitter: ±jitter% of base, prevents thundering herd
    const jitterMs = base * this.cfg.jitter * (Math.random() * 2 - 1);
    const delay = Math.max(0, base + jitterMs);

    this.attempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldReconnect) this.openSocket();
    }, delay);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private setStatus(s: ConnectionStatus): void {
    if (this.status === s) return;
    this.status = s;
    this.dispatchEvent(new CustomEvent("status", { detail: s }));
  }

  private emitError(err: unknown): void {
    const error = err instanceof Error ? err : new Error(String(err));
    this.dispatchEvent(new CustomEvent("error", { detail: error }));
  }
}
