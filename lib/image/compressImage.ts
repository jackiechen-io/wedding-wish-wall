import type { CompressedImage } from '@/types/upload';
import { canvasToBlob } from './canvasToBlob';
import { supportsWebp } from './supportsWebp';
import {
  FALLBACK_LONG_EDGE,
  MAX_LONG_EDGE,
  TARGET_MAX_BYTES,
  getCanvasSize,
  loadImageFromFile
} from './imageUtils';

async function renderToCanvas(file: File, maxLongEdge: number) {
  const img = await loadImageFromFile(file);
  const { width, height } = getCanvasSize(img.naturalWidth, img.naturalHeight, maxLongEdge);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return { canvas, width, height };
}

export async function compressImage(file: File): Promise<CompressedImage> {
  if (!file.type.startsWith('image/')) throw new Error('請選擇圖片檔案');

  const outputType = (await supportsWebp()) ? 'image/webp' : 'image/jpeg';

  for (const maxLongEdge of [MAX_LONG_EDGE, FALLBACK_LONG_EDGE]) {
    for (let quality = 0.8; quality >= 0.75 - 0.001; quality -= 0.05) {
      const { canvas, width, height } = await renderToCanvas(file, maxLongEdge);
      const blob = await canvasToBlob(canvas, outputType, quality);
      if (blob.size <= TARGET_MAX_BYTES) {
        return {
          blob,
          previewUrl: URL.createObjectURL(blob),
          width,
          height,
          contentType: outputType
        };
      }
    }
  }

  const { canvas, width, height } = await renderToCanvas(file, FALLBACK_LONG_EDGE);
  const blob = await canvasToBlob(canvas, outputType, 0.75);

  return {
    blob,
    previewUrl: URL.createObjectURL(blob),
    width,
    height,
    contentType: outputType
  };
}
