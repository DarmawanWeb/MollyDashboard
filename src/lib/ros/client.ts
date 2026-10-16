/**
 * High-level rosbridge client with typed subscribe/publish/service-call API.
 *
 * Sits on top of `RosTransport` and adds:
 *   - per-topic subscription registry with re-subscription on reconnect
 *   - typed message dispatch using TOPICS registry
 *   - service call promise resolution with timeout
 *   - id generation for service correlation
 */

import type {
  CallServiceMsg,
  PublishMsg,
  RosbridgeIncoming,
  ServiceResponseMsg,
  SubscribeMsg,
  UnsubscribeMsg,
} from "@/types/ros/rosbridge";
import type { ConnectionStatus } from "@/types/ui/connection";
import type { ServiceDef, TopicDef } from "./topics";
import { RosTransport, type TransportConfig } from "./transport";

type UnknownHandler = (msg: unknown) => void;

interface Subscription {
  topic: string;
  type: string;
  handlers: Set<UnknownHandler>;
  throttle_rate: number;
}

interface PendingCall {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export interface ClientConfig extends TransportConfig {
  /** Default service call timeout in ms. Default 10000. */
  serviceTimeoutMs?: number;
}

export class RosClient {
  private readonly transport: RosTransport;
  private readonly subs = new Map<string, Subscription>();
  private readonly pending = new Map<string, PendingCall>();
  private callCounter = 0;
  private readonly serviceTimeoutMs: number;

  constructor(config: ClientConfig) {
    this.transport = new RosTransport(config);
    this.serviceTimeoutMs = config.serviceTimeoutMs ?? 10_000;

    this.transport.onMessage((msg) => this.handleIncoming(msg));
    this.transport.onStatus((s) => {
      if (s === "connected") this.resubscribeAll();
    });
  }

  /* ------------------------------------------------------------------------
   * Connection lifecycle
   * --------------------------------------------------------------------- */

  connect(): void {
    this.transport.connect();
  }

  disconnect(): void {
    // reject pending service calls
    this.pending.forEach((p) => {
      clearTimeout(p.timer);
      p.reject(new Error("Disconnected before response"));
    });
    this.pending.clear();
    this.subs.clear();
    this.transport.disconnect();
  }

  onStatusChange(handler: (s: ConnectionStatus) => void): () => void {
    return this.transport.onStatus(handler);
  }

  getStatus(): ConnectionStatus {
    return this.transport.getStatus();
  }

  /* ------------------------------------------------------------------------
   * Typed subscribe (preferred — uses TopicDef from registry)
   * --------------------------------------------------------------------- */

  subscribe<TMsg>(
    topic: TopicDef<TMsg>,
    handler: (msg: TMsg) => void,
    options?: { throttleMs?: number },
  ): () => void {
    return this.subscribeRaw(
      topic.name,
      topic.type,
      handler as UnknownHandler,
      options,
    );
  }

  /**
   * Untyped subscribe — escape hatch when topic isn't in the registry yet.
   * Prefer `subscribe` with a `TopicDef`.
   */
  subscribeRaw(
    topic: string,
    type: string,
    handler: UnknownHandler,
    options?: { throttleMs?: number },
  ): () => void {
    const throttle_rate = options?.throttleMs ?? 100;
    const existing = this.subs.get(topic);

    if (existing) {
      existing.handlers.add(handler);
    } else {
      const sub: Subscription = {
        topic,
        type,
        throttle_rate,
        handlers: new Set([handler]),
      };
      this.subs.set(topic, sub);
      this.sendSubscribe(sub);
    }

    return () => this.unsubscribeHandler(topic, handler);
  }

  private unsubscribeHandler(topic: string, handler: UnknownHandler): void {
    const sub = this.subs.get(topic);
    if (!sub) return;
    sub.handlers.delete(handler);
    if (sub.handlers.size === 0) {
      this.subs.delete(topic);
      const msg: UnsubscribeMsg = { op: "unsubscribe", topic };
      this.transport.send(msg);
    }
  }

  /* ------------------------------------------------------------------------
   * Typed publish
   * --------------------------------------------------------------------- */

  publish<TMsg>(topic: TopicDef<TMsg>, msg: TMsg): boolean {
    return this.publishRaw(topic.name, topic.type, msg);
  }

  publishRaw<T>(topic: string, type: string, msg: T): boolean {
    const payload: PublishMsg<T> = { op: "publish", topic, type, msg };
    return this.transport.send(payload);
  }

  /* ------------------------------------------------------------------------
   * Typed service call
   * --------------------------------------------------------------------- */

  callService<TReq, TRes>(
    service: ServiceDef<TReq, TRes>,
    args: TReq,
    timeoutMs?: number,
  ): Promise<TRes> {
    return this.callServiceRaw<TRes>(
      service.name,
      service.type,
      args,
      timeoutMs,
    );
  }

  callServiceRaw<TRes = unknown>(
    service: string,
    type: string,
    args: unknown,
    timeoutMs?: number,
  ): Promise<TRes> {
    return new Promise<TRes>((resolve, reject) => {
      if (!this.transport.isOpen()) {
        reject(new Error("Not connected"));
        return;
      }

      const id = `srv_${++this.callCounter}_${Date.now()}`;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Service call timeout: ${service}`));
      }, timeoutMs ?? this.serviceTimeoutMs);

      this.pending.set(id, {
        resolve: resolve as (v: unknown) => void,
        reject,
        timer,
      });

      const payload: CallServiceMsg<unknown> = {
        op: "call_service",
        id,
        service,
        type,
        args,
      };
      const ok = this.transport.send(payload);
      if (!ok) {
        this.pending.delete(id);
        clearTimeout(timer);
        reject(new Error("Failed to send service call"));
      }
    });
  }

  /* ------------------------------------------------------------------------
   * Internals
   * --------------------------------------------------------------------- */

  private handleIncoming(msg: unknown): void {
    if (!isIncoming(msg)) return;

    if (msg.op === "publish") {
      const sub = this.subs.get(msg.topic);
      if (!sub) return;
      sub.handlers.forEach((h) => {
        try {
          h(msg.msg);
        } catch (err) {
          // don't let one bad handler kill the others
          // eslint-disable-next-line no-console
          console.error(`[ros] subscriber error on ${msg.topic}:`, err);
        }
      });
      return;
    }

    if (msg.op === "service_response") {
      const id = msg.id;
      if (!id) return;
      const pending = this.pending.get(id);
      if (!pending) return;
      clearTimeout(pending.timer);
      this.pending.delete(id);
      if (msg.result) {
        pending.resolve(msg.values);
      } else {
        pending.reject(new Error(`Service call failed: ${msg.service}`));
      }
      return;
    }

    if (msg.op === "status" && msg.level === "error") {
      // eslint-disable-next-line no-console
      console.error(`[rosbridge] ${msg.msg}`);
    }
  }

  private sendSubscribe(sub: Subscription): void {
    const payload: SubscribeMsg = {
      op: "subscribe",
      topic: sub.topic,
      type: sub.type,
      throttle_rate: sub.throttle_rate,
    };
    this.transport.send(payload);
  }

  private resubscribeAll(): void {
    this.subs.forEach((sub) => {
      this.sendSubscribe(sub);
    });
  }
}

/* ----------------------------------------------------------------------------
 * Type guard for inbound rosbridge messages
 * ------------------------------------------------------------------------- */

function isIncoming(
  x: unknown,
): x is RosbridgeIncoming &
  (
    | { op: "publish"; topic: string; msg: unknown }
    | ServiceResponseMsg
    | { op: "status"; level: string; msg: string }
  ) {
  return (
    typeof x === "object" &&
    x !== null &&
    "op" in x &&
    typeof (x as { op: unknown }).op === "string"
  );
}
