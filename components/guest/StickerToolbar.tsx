import type { StickerType } from '@/types/sticker';
import { STICKER_LABEL, STICKER_PNG, STICKER_TYPES } from '@/lib/stickers/stickerConfig';

export default function StickerToolbar({
  onAdd,
  usedStickers = [],
}: {
  onAdd: (type: StickerType) => void;
  usedStickers?: StickerType[];
}) {
  const usedSet = new Set(usedStickers);

  return (
    <div className="grid grid-cols-5 gap-2">
      {STICKER_TYPES.map((type) => {
        const isUsed = usedSet.has(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => onAdd(type)}
            className={`flex items-center justify-center rounded-2xl border bg-white p-2 shadow-sm transition active:scale-95 ${
              isUsed
                ? 'border-neutral-300 opacity-50 hover:scale-105 hover:shadow-md hover:shadow-amber-200/30 hover:opacity-80'
                : 'border-neutral-200 hover:scale-110 hover:shadow-lg hover:shadow-amber-200/50'
            }`}
            aria-label={`新增${STICKER_LABEL[type]}`}
          >
            <img
              src={STICKER_PNG[type]}
              alt={STICKER_LABEL[type]}
              className="h-10 w-10 object-contain"
            />
          </button>
        );
      })}
    </div>
  );
}
