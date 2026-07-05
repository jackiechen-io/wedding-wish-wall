export type StickerType = 'sticker-1' | 'sticker-2' | 'sticker-3' | 'sticker-4' | 'sticker-5' | 'sticker-6' | 'sticker-7' | 'sticker-8' | 'sticker-9' | 'sticker-10';

export type Sticker = {
  id: string;
  type: StickerType;
  x: number;
  y: number;
  size: number;
};
