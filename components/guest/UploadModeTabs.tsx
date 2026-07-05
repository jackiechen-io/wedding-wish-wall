'use client';

export type UploadMode = 'text' | 'photo';

export default function UploadModeTabs({
  mode,
  onChange,
}: {
  mode: UploadMode;
  onChange: (mode: UploadMode) => void;
}) {
  return (
    <div className="flex rounded-2xl border border-neutral-200 bg-neutral-50 p-1">
      <button
        type="button"
        onClick={() => onChange('text')}
        className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
          mode === 'text'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-400 hover:text-neutral-600'
        }`}
      >
        💌 寫祝福
      </button>
      <button
        type="button"
        onClick={() => onChange('photo')}
        className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
          mode === 'photo'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-400 hover:text-neutral-600'
        }`}
      >
        📷 上傳照片
      </button>
    </div>
  );
}
