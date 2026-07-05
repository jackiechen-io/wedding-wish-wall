'use client';

import { useRef, useState } from 'react';
import ImagePreviewCanvas from './ImagePreviewCanvas';
import StickerToolbar from './StickerToolbar';
import UploadProgress from './UploadProgress';
import { useImageCompression } from '@/hooks/useImageCompression';
import { useStickerDrag } from '@/hooks/useStickerDrag';
import { uploadSubmission } from '@/hooks/useSubmissionUpload';
import { getFileSizeLabel } from '@/lib/image/imageUtils';

type FieldErrors = {
  nickname?: string;
  message?: string;
  image?: string;
};

type SubmitStatus = 'idle' | 'success' | 'error';

export default function GuestUploader() {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);

  const { image, isCompressing, compress, reset } = useImageCompression();
  const { stickers, draggingId, setDraggingId, addSticker, moveSticker, clearStickers } = useStickerDrag();

  function validate(): boolean {
    const e: FieldErrors = {};
    if (!nickname.trim()) e.nickname = '請填寫暱稱';
    else if (nickname.length > 30) e.nickname = '暱稱不得超過30個字';
    if (!message.trim()) e.message = '請填寫祝福';
    else if (message.length > 300) e.message = '祝福不得超過300個字';
    if (!image) e.image = '請選擇照片';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onPickFile(file?: File) {
    if (!file) return;
    setSubmitting(true);
    setLoadingText('正在將照片變成輕盈的小卡片…');
    setProgress(20);

    try {
      const result = await compress(file);
      setProgress(100);
      setLoadingText(`壓縮完成：${getFileSizeLabel(result.blob.size)}`);
      setErrors((prev) => ({ ...prev, image: undefined }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, image: error instanceof Error ? error.message : '圖片處理失敗' }));
    } finally {
      setTimeout(() => {
        setSubmitting(false);
        setLoadingText('');
        setProgress(0);
      }, 700);
    }
  }

  async function submit() {
    if (!validate()) return;
    if (!image || !previewRef.current) return;

    setSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    try {
      await uploadSubmission({
        nickname,
        message,
        previewUrl: image.previewUrl,
        contentType: image.contentType,
        stickers,
        previewWidth: previewRef.current.clientWidth,
        imageWidth: image.width,
        imageHeight: image.height,
        onProgress: (value, text) => {
          setProgress(value);
          setLoadingText(text);
        }
      });

      setSubmitStatus('success');
      setNickname('');
      setMessage('');
      reset();
      clearStickers();
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '送出失敗');
    } finally {
      setSubmitting(false);
      setLoadingText('');
      setProgress(0);
    }
  }

  if (submitStatus === 'success') {
    return (
      <main className="min-h-screen bg-white text-neutral-900">
        <section className="mx-auto max-w-md px-5 py-8 text-center">
          <div className="mt-24">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-6 font-serif text-3xl tracking-wide">已送出</p>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              通過審核後會出現在大螢幕上 ♡
            </p>
            <button
              onClick={() => setSubmitStatus('idle')}
              className="mt-10 w-full rounded-2xl bg-neutral-900 px-4 py-4 font-serif text-lg text-white shadow-sm active:scale-[0.99]"
            >
              再寫一張
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <section className="mx-auto max-w-md px-5 py-8">
        <p className="text-xs tracking-[0.4em] text-neutral-400">WEDDING WALL</p>
        <h1 className="mt-2 font-serif text-4xl tracking-wide">Wedding Wishes</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">留下一張照片與一句溫柔的祝福，審核通過後會出現在現場大螢幕。</p>

        <div className="mt-8 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-neutral-400">暱稱</label>
              <span className={`text-xs ${nickname.length > 30 ? 'text-red-400' : 'text-neutral-300'}`}>
                {nickname.length}/30
              </span>
            </div>
            <input
              className={`mt-1 w-full rounded-2xl border px-4 py-3 outline-none ${
                errors.nickname ? 'border-red-300 bg-red-50' : 'border-neutral-200 bg-[#F8F9FA] focus:border-neutral-400'
              }`}
              placeholder="你的暱稱"
              value={nickname}
              maxLength={30}
              onChange={(e) => { setNickname(e.target.value); setErrors((prev) => ({ ...prev, nickname: undefined })); }}
            />
            {errors.nickname && <p className="mt-1 text-xs text-red-500">{errors.nickname}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-neutral-400">祝福</label>
              <span className={`text-xs ${message.length > 300 ? 'text-red-400' : 'text-neutral-300'}`}>
                {message.length}/300
              </span>
            </div>
            <textarea
              className={`mt-1 min-h-28 w-full rounded-2xl border px-4 py-3 outline-none ${
                errors.message ? 'border-red-300 bg-red-50' : 'border-neutral-200 bg-[#F8F9FA] focus:border-neutral-400'
              }`}
              placeholder="寫下給新人的祝福…"
              value={message}
              maxLength={300}
              onChange={(e) => { setMessage(e.target.value); setErrors((prev) => ({ ...prev, message: undefined })); }}
            />
            {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
          </div>

          <div>
            <label
              className={`block rounded-2xl border-2 border-dashed px-4 py-6 text-center text-sm transition ${
                errors.image
                  ? 'border-red-300 bg-red-50'
                  : isDragOver
                    ? 'border-neutral-900 bg-neutral-50'
                    : image
                      ? 'border-green-300 bg-green-50'
                      : 'border-neutral-300 bg-[#F8F9FA] text-neutral-500 active:scale-[0.99]'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); onPickFile(e.dataTransfer.files?.[0]); }}
            >
              {image ? (
                <span className="text-green-600">✓ 已選擇照片（點擊更換）</span>
              ) : (
                <>
                  <span className="block">{isDragOver ? '放開以上傳' : '點擊選擇照片'}</span>
                  <span className="mt-1 block text-xs text-neutral-400">或拖放照片到此區域，本機壓縮後才上傳</span>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={submitting || isCompressing}
                onChange={(e) => onPickFile(e.target.files?.[0])}
              />
            </label>
            {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
          </div>

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
              <StickerToolbar onAdd={addSticker} usedStickers={stickers.map((s) => s.type)} />
              <p className="text-xs text-neutral-400">
                已轉為 {image.contentType.replace('image/', '').toUpperCase()}，大小約 {getFileSizeLabel(image.blob.size)}
              </p>
              <button
                type="button"
                onClick={() => { reset(); clearStickers(); }}
                className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-400 active:scale-[0.99]"
              >
                清除照片重選
              </button>
            </>
          )}

          <button
            disabled={submitting || !image}
            onClick={submit}
            className="w-full rounded-2xl bg-neutral-900 px-4 py-4 font-serif text-lg text-white shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {submitting ? '處理中…' : '送出祝福'}
          </button>

          {submitStatus === 'error' && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

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
