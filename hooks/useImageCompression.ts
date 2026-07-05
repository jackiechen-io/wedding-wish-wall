'use client';

import { useState } from 'react';
import { compressImage } from '@/lib/image/compressImage';
import type { CompressedImage } from '@/types/upload';

export function useImageCompression() {
  const [image, setImage] = useState<CompressedImage | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  async function compress(file: File) {
    setIsCompressing(true);
    try {
      const result = await compressImage(file);
      setImage((old) => {
        if (old?.previewUrl) URL.revokeObjectURL(old.previewUrl);
        return result;
      });
      return result;
    } finally {
      setIsCompressing(false);
    }
  }

  function reset() {
    if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
  }

  return { image, isCompressing, compress, reset };
}
