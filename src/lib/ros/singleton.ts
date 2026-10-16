/**
 * Lazy singleton `RosClient` instance.
 *
 * Why a singleton: rosbridge WebSocket is a process-wide resource. Multiple
 * clients would each open their own socket and duplicate subscriptions.
 *
 * Why lazy: the URL may come from runtime config (Settings store) rather than
 * env at module load. Callers should call `configureRos({ url })` once during
 * app bootstrap (e.g. in the ConnectionProvider).
 */

import { env } from "../env";
import { type ClientConfig, RosClient } from "./client";

let instance: RosClient | null = null;
let currentConfig: ClientConfig | null = null;

/**
 * Initialize or reconfigure the singleton client.
 *
 * Calling this with a different URL than the current one will tear down the
 * existing instance and create a new one. Subscribers must re-subscribe.
 */
export function configureRos(config: Partial<ClientConfig> = {}): RosClient {
  const url = config.url ?? currentConfig?.url ?? env.ROSBRIDGE_URL;
  const next: ClientConfig = { ...currentConfig, ...config, url };

  if (instance && currentConfig?.url === url) {
    return instance;
  }

  if (instance) instance.disconnect();

  instance = new RosClient(next);
  currentConfig = next;
  return instance;
}

/**
 * Get the current client. If not configured, initializes with defaults.
 */
export function getRos(): RosClient {
  if (!instance) return configureRos();
  return instance;
}

/** For tests — reset the singleton. */
export function __resetRos(): void {
  if (instance) instance.disconnect();
  instance = null;
  currentConfig = null;
}
