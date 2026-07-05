import type { Sticker } from '@/types/sticker';
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

export async function composeImageWithStickers(params: {
  previewUrl: string;
  stickers: Sticker[];
  contentType: 'image/webp' | 'image/jpeg';
  previewWidth: number;
}): Promise<Blob> {
  const image = await loadImage(params.previewUrl);

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const scale = canvas.width / params.previewWidth;

  for (const sticker of params.stickers) {
    try {
      const pngImg = await loadImage(STICKER_PNG[sticker.type]);
      const stickerSize = Math.round(sticker.size * scale);

      ctx.drawImage(
        pngImg,
        (sticker.x / 100) * canvas.width - stickerSize / 2,
        (sticker.y / 100) * canvas.height - stickerSize / 2,
        stickerSize,
        stickerSize
      );
    } catch {
      // skip sticker if image fails to load
    }
  }

  let blob = await canvasToBlob(canvas, params.contentType, 0.78);

  if (blob.size > HARD_MAX_UPLOAD_BYTES) {
    blob = await canvasToBlob(canvas, params.contentType, 0.7);
  }

  return blob;
}
