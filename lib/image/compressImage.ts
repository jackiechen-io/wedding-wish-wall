import type { CompressedImage } from '@/types/upload';
import { canvasToBlob } from './canvasToBlob';
import { supportsWebp } from './supportsWebp';
import {
  FALLBACK_LONG_EDGE,
  MAX_LONG_EDGE,
  TARGET_MAX_BYTES,
  getCanvasSize,
  loadImageFromBlob
} from './imageUtils';

async function renderToCanvas(blob: Blob, maxLongEdge: number) {
  const img = await loadImageFromBlob(blob);
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

export async function compressImage(sourceBlob: Blob): Promise<CompressedImage> {
  if ('type' in sourceBlob && sourceBlob.type && !sourceBlob.type.startsWith('image/')) throw new Error('請選擇圖片檔案');

  const outputType = (await supportsWebp()) ? 'image/webp' : 'image/jpeg';

  for (const maxLongEdge of [MAX_LONG_EDGE, FALLBACK_LONG_EDGE]) {
    for (let quality = 0.8; quality >= 0.75 - 0.001; quality -= 0.05) {
      const { canvas, width, height } = await renderToCanvas(sourceBlob, maxLongEdge);
      const compressed = await canvasToBlob(canvas, outputType, quality);
      if (compressed.size <= TARGET_MAX_BYTES) {
        return {
          blob: compressed,
          previewUrl: URL.createObjectURL(compressed),
          width,
          height,
          contentType: outputType
        };
      }
    }
  }

  const { canvas, width, height } = await renderToCanvas(sourceBlob, FALLBACK_LONG_EDGE);
  const compressed = await canvasToBlob(canvas, outputType, 0.75);

  return {
    blob: compressed,
    previewUrl: URL.createObjectURL(compressed),
    width,
    height,
    contentType: outputType
  };
}
