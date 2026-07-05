export type StickerType = 'heart' | 'rings' | 'veil' | 'sparkle';

export type Sticker = {
  id: string;
  type: StickerType;
  x: number;
  y: number;
  size: number;
};
