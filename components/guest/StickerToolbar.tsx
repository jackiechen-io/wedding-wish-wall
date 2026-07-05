import type { StickerType } from '@/types/sticker';
import { STICKER_LABEL, STICKER_SVG } from '@/lib/stickers/stickerConfig';

const stickers: StickerType[] = ['heart', 'rings', 'veil', 'sparkle'];

export default function StickerToolbar({ onAdd }: { onAdd: (type: StickerType) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {stickers.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onAdd(type)}
          className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-3 py-3 shadow-sm active:scale-95"
          aria-label={`新增${STICKER_LABEL[type]}`}
        >
          <img src={STICKER_SVG[type]} alt={STICKER_LABEL[type]} className="h-8 w-8" />
        </button>
      ))}
    </div>
  );
}
