import { PALETTE } from "../palette";

/**
 * Renders the "waiting for map" placeholder when no grid is available.
 * A faint dot grid + centered text. Cheap and avoids a totally black canvas.
 */
export function drawEmptyState(
  ctx: CanvasRenderingContext2D,
  cW: number,
  cH: number,
): void {
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  for (let x = 0; x < cW; x += 24) ctx.fillRect(x, 0, 1, cH);
  for (let y = 0; y < cH; y += 24) ctx.fillRect(0, y, cW, 1);

  ctx.fillStyle = PALETTE.textMuted;
  ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("WAITING FOR MAP…", cW / 2, cH / 2);
  ctx.textAlign = "left";
}
