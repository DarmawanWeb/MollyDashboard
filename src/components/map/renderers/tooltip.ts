import { PALETTE } from "../palette";

interface TooltipLine {
  label: string;
  value: string;
}

/**
 * Draws a small floating tooltip near a screen-space point.
 *
 * Used for POI hover info (name + cell coords + motion action). Auto-flips
 * to the left of the anchor when it would overflow the right edge.
 */
export function drawTooltip(
  ctx: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
  lines: TooltipLine[],
  cW: number,
): void {
  if (lines.length === 0) return;

  ctx.font = "11px 'JetBrains Mono', monospace";
  const lineH = 15;
  const padX = 8;
  const padY = 6;

  let maxW = 0;
  for (const line of lines) {
    const text = `${line.label}: ${line.value}`;
    const w = ctx.measureText(text).width;
    if (w > maxW) maxW = w;
  }

  const boxW = maxW + padX * 2;
  const boxH = lines.length * lineH + padY * 2;

  // position to the right by default, flip if overflow
  let x = anchorX + 12;
  if (x + boxW > cW - 8) x = anchorX - 12 - boxW;
  const y = anchorY + 12;

  ctx.fillStyle = PALETTE.overlay;
  ctx.strokeStyle = PALETTE.overlayBorder;
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, boxW, boxH);
  ctx.strokeRect(x + 0.5, y + 0.5, boxW, boxH);

  ctx.textBaseline = "middle";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ly = y + padY + i * lineH + lineH / 2;
    ctx.fillStyle = PALETTE.textMuted;
    ctx.fillText(`${line.label}: `, x + padX, ly);
    const labelW = ctx.measureText(`${line.label}: `).width;
    ctx.fillStyle = PALETTE.text;
    ctx.fillText(line.value, x + padX + labelW, ly);
  }
  ctx.textBaseline = "alphabetic";
}
