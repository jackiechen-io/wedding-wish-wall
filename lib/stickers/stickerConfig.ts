import type { StickerType } from '@/types/sticker';

export const STICKER_SVG: Record<StickerType, string> = {
  heart: '/heart.svg',
  rings: '/rings.svg',
  veil: '/veil.svg',
  sparkle: '/sparkle.svg'
};

export const STICKER_TEXT: Record<StickerType, string> = {
  heart: '♡',
  rings: '∞',
  veil: '♕',
  sparkle: '✧'
};

export const STICKER_LABEL: Record<StickerType, string> = {
  heart: '愛心',
  rings: '對戒',
  veil: '頭飾',
  sparkle: '星光'
};
