/**
 * Small helpers for route handlers: who is asking, and a per-client rate
 * limit (in memory; the dashboard runs as one process).
 */

/** Best-effort client address behind cloudflared / a reverse proxy. */
export function clientKey(req: Request): string {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local"
  );
}

interface Window {
  count: number;
  resetAt: number;
}

/** `limit` requests per `windowMs` per key. */
export function createRateLimiter(limit: number, windowMs: number) {
  const windows = new Map<string, Window>();
  return (key: string): { ok: boolean; retryAfterSec: number } => {
    const now = Date.now();
    if (windows.size > 5000) {
      for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
    }
    const w = windows.get(key);
    if (!w || w.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, retryAfterSec: 0 };
    }
    w.count += 1;
    return {
      ok: w.count <= limit,
      retryAfterSec: Math.ceil((w.resetAt - now) / 1000),
    };
  };
}

export function json(data: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}
