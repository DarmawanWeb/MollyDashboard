import { canvasFont, PALETTE } from "../palette";

interface TooltipLine {
  /** Empty: a plain line (display variant), no "label:" prefix */
  label: string;
  value: string;
}

/**
 * Draws a small floating tooltip near a screen-space point.
 *
 * Used for POI hover info. Auto-flips to the left of the anchor when it
 * would overflow the right edge.
 */
export function drawTooltip(
  ctx: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
  lines: TooltipLine[],
  cW: number,
): void {
  if (lines.length === 0) return;

  const plain = lines.every((l) => l.label === "");
  const font = (i: number) =>
    plain
      ? canvasFont(i === 0 ? 13 : 12, i === 0 ? 700 : 500, "sans")
      : canvasFont(11);
  const prefix = (l: TooltipLine) => (l.label ? `${l.label}: ` : "");
  const lineH = plain ? 18 : 15;
  const padX = plain ? 10 : 8;
  const padY = plain ? 8 : 6;

  let maxW = 0;
  for (const [i, line] of lines.entries()) {
    ctx.font = font(i);
    const w = ctx.measureText(`${prefix(line)}${line.value}`).width;
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
  ctx.beginPath();
  ctx.roundRect(x + 0.5, y + 0.5, boxW, boxH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.textBaseline = "middle";
  for (const [i, line] of lines.entries()) {
    ctx.font = font(i);
    const ly = y + padY + i * lineH + lineH / 2;
    const label = prefix(line);
    ctx.fillStyle = PALETTE.textMuted;
    if (label) ctx.fillText(label, x + padX, ly);
    const labelW = label ? ctx.measureText(label).width : 0;
    ctx.fillStyle = plain && i > 0 ? PALETTE.textMuted : PALETTE.text;
    ctx.fillText(line.value, x + padX + labelW, ly);
  }
  ctx.textBaseline = "alphabetic";
}
