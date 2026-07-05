import type { Sticker } from '@/types/sticker';
import type { Gradient } from '@/lib/text/gradients';
import { STICKER_PNG } from '@/lib/stickers/stickerConfig';
import { canvasToBlob } from './canvasToBlob';
import { HARD_MAX_UPLOAD_BYTES } from './imageUtils';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawGradient(
  ctx: CanvasRenderingContext2D,
  gradient: Gradient,
  width: number,
  height: number
) {
  const angleRad = (gradient.angle * Math.PI) / 180;
  const x1 = width * (0.5 - 0.5 * Math.cos(angleRad));
  const y1 = height * (0.5 - 0.5 * Math.sin(angleRad));
  const x2 = width * (0.5 + 0.5 * Math.cos(angleRad));
  const y2 = height * (0.5 + 0.5 * Math.sin(angleRad));
  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, gradient.startColor);
  grad.addColorStop(1, gradient.endColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let currentLine = '';
  for (const char of text) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function getOptimalFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  lineHeight: number
): number {
  let fontSize = 72;
  const minFontSize = 24;
  while (fontSize > minFontSize) {
    ctx.font = `bold ${fontSize}px 'Microsoft JhengHei','PingFang TC','Noto Sans TC','Helvetica Neue',sans-serif`;
    const lines = wrapText(ctx, text, maxWidth);
    const totalHeight = lines.length * fontSize * lineHeight;
    const maxLineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
    if (maxLineWidth <= maxWidth && totalHeight <= maxHeight) break;
    fontSize -= 4;
  }
  return fontSize;
}

export async function composeTextWithStickers(params: {
  message: string;
  nickname: string;
  gradient: Gradient;
  stickers: Sticker[];
  width?: number;
  height?: number;
}): Promise<Blob> {
  const width = params.width ?? 1200;
  const height = params.height ?? 1200;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  drawGradient(ctx, params.gradient, width, height);

  const paddingX = width * 0.1;
  const paddingTop = height * 0.15;
  const paddingBottom = height * 0.2;
  const textMaxWidth = width - paddingX * 2;
  const textMaxHeight = height - paddingTop - paddingBottom;
  const lineHeight = 1.5;

  const fontSize = getOptimalFontSize(ctx, params.message, textMaxWidth, textMaxHeight, lineHeight);
  ctx.font = `bold ${fontSize}px 'Microsoft JhengHei','PingFang TC','Noto Sans TC','Helvetica Neue',sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#333333';

  const lines = wrapText(ctx, params.message, textMaxWidth);
  const totalTextHeight = lines.length * fontSize * lineHeight;
  let startY = (height - totalTextHeight) / 2;

  for (const line of lines) {
    ctx.fillText(line, width / 2, startY + fontSize * lineHeight / 2);
    startY += fontSize * lineHeight;
  }

  const nickFontSize = Math.min(28, width * 0.03);
  ctx.font = `${nickFontSize}px 'Microsoft JhengHei','PingFang TC','Noto Sans TC','Helvetica Neue',sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = '#666666';
  ctx.fillText(`— ${params.nickname} —`, width / 2, height - paddingBottom * 0.5);

  for (const sticker of params.stickers) {
    try {
      const pngImg = await loadImage(STICKER_PNG[sticker.type]);
      const stickerSize = Math.round((sticker.size / 100) * width);
      const cx = (sticker.x / 100) * width;
      const cy = (sticker.y / 100) * height;

      ctx.save();
      ctx.translate(cx, cy);
      if (sticker.rotation) ctx.rotate((sticker.rotation * Math.PI) / 180);
      ctx.drawImage(pngImg, -stickerSize / 2, -stickerSize / 2, stickerSize, stickerSize);
      ctx.restore();
    } catch {
      // skip
    }
  }

  let blob = await canvasToBlob(canvas, 'image/webp', 0.85);
  if (blob.size > HARD_MAX_UPLOAD_BYTES) {
    blob = await canvasToBlob(canvas, 'image/webp', 0.75);
  }
  if (blob.size > HARD_MAX_UPLOAD_BYTES) {
    blob = await canvasToBlob(canvas, 'image/webp', 0.6);
  }

  return blob;
}
