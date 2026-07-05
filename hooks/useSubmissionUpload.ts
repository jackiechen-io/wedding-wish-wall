'use client';

import type { Sticker } from '@/types/sticker';
import type { UploadUrlResponse } from '@/types/upload';
import { composeImageWithStickers } from '@/lib/image/composeImageWithStickers';
import { getFileSizeLabel, HARD_MAX_UPLOAD_BYTES } from '@/lib/image/imageUtils';

export async function uploadSubmission(params: {
  nickname: string;
  message: string;
  blob?: Blob;
  contentType?: string;
  imageWidth?: number;
  imageHeight?: number;
  previewUrl?: string;
  stickers?: Sticker[];
  previewWidth?: number;
  onProgress?: (value: number, text: string) => void;
}) {
  let finalBlob: Blob;
  let finalContentType: string;
  let finalWidth: number;
  let finalHeight: number;

  if (params.blob) {
    finalBlob = params.blob;
    finalContentType = params.contentType || 'image/webp';
    finalWidth = params.imageWidth || 1200;
    finalHeight = params.imageHeight || 1200;
  } else {
    params.onProgress?.(20, '正在合成貼圖…');
    if (!params.previewUrl || !params.stickers || !params.previewWidth || !params.imageWidth || !params.imageHeight) {
      throw new Error('Missing required fields for photo submission');
    }
    finalBlob = await composeImageWithStickers({
      previewUrl: params.previewUrl,
      contentType: params.contentType as 'image/webp' | 'image/jpeg',
      stickers: params.stickers,
      previewWidth: params.previewWidth
    });
    finalContentType = params.contentType || 'image/jpeg';
    finalWidth = params.imageWidth;
    finalHeight = params.imageHeight;
  }

  if (finalBlob.size > HARD_MAX_UPLOAD_BYTES) {
    throw new Error(`圖片過大：${getFileSizeLabel(finalBlob.size)}，請減少貼圖或更換照片`);
  }

  params.onProgress?.(40, '正在取得安全上傳通道…');

  const uploadUrlRes = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType: finalContentType, fileSize: finalBlob.size })
  });

  if (!uploadUrlRes.ok) throw new Error('取得上傳網址失敗');
  const uploadPayload = (await uploadUrlRes.json()) as UploadUrlResponse;

  params.onProgress?.(60, '正在上傳輕量化照片…');

  const putRes = await fetch(uploadPayload.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': finalContentType },
    body: finalBlob
  });

  if (!putRes.ok) throw new Error('照片上傳失敗');

  params.onProgress?.(85, '正在送出祝福…');

  const saveRes = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nickname: params.nickname,
      message: params.message,
      imageKey: uploadPayload.key,
      imageUrl: uploadPayload.publicUrl,
      contentType: finalContentType,
      fileSize: finalBlob.size,
      imageWidth: finalWidth,
      imageHeight: finalHeight
    })
  });

  const savePayload = await saveRes.json().catch(() => null);
  if (!saveRes.ok) throw new Error(savePayload?.message || '祝福送出失敗');

  params.onProgress?.(100, '完成');
  return savePayload;
}
