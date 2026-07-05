'use client';

import { useRef, useState } from 'react';
import ImagePreviewCanvas from './ImagePreviewCanvas';
import StickerToolbar from './StickerToolbar';
import UploadProgress from './UploadProgress';
import { useImageCompression } from '@/hooks/useImageCompression';
import { useStickerDrag } from '@/hooks/useStickerDrag';
import { uploadSubmission } from '@/hooks/useSubmissionUpload';
import { getFileSizeLabel } from '@/lib/image/imageUtils';

export default function GuestUploader() {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { image, isCompressing, compress, reset } = useImageCompression();
  const { stickers, draggingId, setDraggingId, addSticker, moveSticker, clearStickers } = useStickerDrag();

  async function onPickFile(file?: File) {
    if (!file) return;
    setSubmitting(true);
    setLoadingText('正在將照片變成輕盈的小卡片…');
    setProgress(20);

    try {
      const result = await compress(file);
      setProgress(100);
      setLoadingText(`壓縮完成：${getFileSizeLabel(result.blob.size)}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : '圖片處理失敗');
    } finally {
      setTimeout(() => {
        setSubmitting(false);
        setLoadingText('');
        setProgress(0);
      }, 700);
    }
  }

  async function submit() {
    if (!nickname.trim() || !message.trim()) {
      alert('請填寫暱稱與祝福');
      return;
    }
    if (!image || !previewRef.current) {
      alert('請先選擇照片');
      return;
    }

    setSubmitting(true);
    try {
      await uploadSubmission({
        nickname,
        message,
        previewUrl: image.previewUrl,
        contentType: image.contentType,
        stickers,
        previewWidth: previewRef.current.clientWidth,
        onProgress: (value, text) => {
          setProgress(value);
          setLoadingText(text);
        }
      });

      alert('已送出！通過審核後會出現在大螢幕上 ♡');
      setNickname('');
      setMessage('');
      reset();
      clearStickers();
    } catch (error) {
      alert(error instanceof Error ? error.message : '送出失敗');
    } finally {
      setSubmitting(false);
      setLoadingText('');
      setProgress(0);
    }
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <section className="mx-auto max-w-md px-5 py-8">
        <p className="text-xs tracking-[0.4em] text-neutral-400">WEDDING WALL</p>
        <h1 className="mt-2 font-serif text-4xl tracking-wide">Wedding Wishes</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">留下一張照片與一句溫柔的祝福，審核通過後會出現在現場大螢幕。</p>

        <div className="mt-8 space-y-4">
          <input
            className="w-full rounded-2xl border border-neutral-200 bg-[#F8F9FA] px-4 py-3 outline-none focus:border-neutral-400"
            placeholder="暱稱"
            value={nickname}
            maxLength={30}
            onChange={(e) => setNickname(e.target.value)}
          />

          <textarea
            className="min-h-28 w-full rounded-2xl border border-neutral-200 bg-[#F8F9FA] px-4 py-3 outline-none focus:border-neutral-400"
            placeholder="寫下給新人的祝福…"
            value={message}
            maxLength={300}
            onChange={(e) => setMessage(e.target.value)}
          />

          <label className="block rounded-2xl border border-dashed border-neutral-300 bg-[#F8F9FA] px-4 py-5 text-center text-sm text-neutral-500 active:scale-[0.99]">
            選擇照片，本機壓縮後才上傳
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={submitting || isCompressing}
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
          </label>

          <UploadProgress text={loadingText} progress={progress} />

          {image && (
            <>
              <ImagePreviewCanvas
                previewRef={previewRef}
                previewUrl={image.previewUrl}
                stickers={stickers}
                draggingId={draggingId}
                setDraggingId={setDraggingId}
                moveSticker={moveSticker}
              />
              <StickerToolbar onAdd={addSticker} />
              <p className="text-xs text-neutral-400">
                已轉為 {image.contentType.replace('image/', '').toUpperCase()}，大小約 {getFileSizeLabel(image.blob.size)}
              </p>
            </>
          )}

          <button
            disabled={submitting || !image}
            onClick={submit}
            className="w-full rounded-2xl bg-neutral-900 px-4 py-4 font-serif text-lg text-white shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {submitting ? '處理中…' : '送出祝福'}
          </button>

          <button
            type="button"
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-500"
            onClick={() => { window.location.href = '/api/auth/line'; }}
          >
            LINE 快速登入，Coming Soon
          </button>
        </div>
      </section>
    </main>
  );
}
