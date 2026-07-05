import type { Sticker } from '@/types/sticker';
import type { TextTransform } from '@/types/textTransform';
import type { Gradient } from '@/lib/text/gradients';
import { STICKER_PNG } from '@/lib/stickers/stickerConfig';
import { canvasToBlob } from './canvasToBlob';
import { HARD_MAX_UPLOAD_BYTES } from './imageUtils';
import { supportsWebp } from './supportsWebp';

const FONT_STACK = "'Ma Shan Zheng','ZCOOL XiaoWei','KaiTi','STKaiti','cjk-ideographic',cursive";
const CANVAS_SIZE = 800;

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
  lineHeight: number,
  preferredSize?: number
): number {
  if (preferredSize) {
    ctx.font = `bold ${preferredSize}px ${FONT_STACK}`;
    const lines = wrapText(ctx, text, maxWidth);
    const totalHeight = lines.length * preferredSize * lineHeight;
    const maxLineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
    if (maxLineWidth <= maxWidth && totalHeight <= maxHeight) return preferredSize;
  }
  let fontSize = preferredSize ?? 72;
  const minFontSize = 24;
  while (fontSize > minFontSize) {
    ctx.font = `bold ${fontSize}px ${FONT_STACK}`;
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
  textTransform?: TextTransform;
  width?: number;
  height?: number;
}): Promise<Blob> {
  const width = params.width ?? CANVAS_SIZE;
  const height = params.height ?? CANVAS_SIZE;
  const textTf = params.textTransform;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  drawGradient(ctx, params.gradient, width, height);

  const paddingX = width * 0.08;
  const textMaxWidth = width - paddingX * 2;
  const textMaxHeight = height * 0.6;
  const lineHeight = 1.4;

  const preferredSize = textTf ? (textTf.fontSize / 100) * height : undefined;
  const fontSize = getOptimalFontSize(ctx, params.message, textMaxWidth, textMaxHeight, lineHeight, preferredSize);
  ctx.font = `bold ${fontSize}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#333333';

  const lines = wrapText(ctx, params.message, textMaxWidth);
  const totalTextHeight = lines.length * fontSize * lineHeight;

  if (textTf) {
    const cx = (textTf.x / 100) * width;
    const cy = (textTf.y / 100) * height;
    ctx.save();
    ctx.translate(cx, cy);
    if (textTf.rotation) ctx.rotate((textTf.rotation * Math.PI) / 180);
    let startY = -totalTextHeight / 2 + fontSize * lineHeight / 2;
    for (const line of lines) {
      ctx.fillText(line, 0, startY);
      startY += fontSize * lineHeight;
    }
    ctx.restore();
  } else {
    let startY = (height - totalTextHeight) / 2;
    for (const line of lines) {
      ctx.fillText(line, width / 2, startY + fontSize * lineHeight / 2);
      startY += fontSize * lineHeight;
    }
  }

  const nickFontSize = Math.min(24, width * 0.04);
  ctx.font = `${nickFontSize}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = '#666666';
  ctx.fillText(`— ${params.nickname} —`, width / 2, height - height * 0.08);

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

  const useWebp = await supportsWebp();
  const outputType = useWebp ? 'image/webp' : 'image/jpeg';

  let blob = await canvasToBlob(canvas, outputType, 0.85);
  const qualities = useWebp ? [0.75, 0.6, 0.5] : [0.7, 0.5, 0.35];
  for (const q of qualities) {
    if (blob.size <= HARD_MAX_UPLOAD_BYTES) break;
    blob = await canvasToBlob(canvas, outputType, q);
  }

  return blob;
}
