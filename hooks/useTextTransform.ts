'use client';

import { useState } from 'react';
import type { TextTransform } from '@/types/textTransform';
import { DEFAULT_TEXT_TRANSFORM } from '@/types/textTransform';

export function useTextTransform() {
  const [textTransform, setTextTransform] = useState<TextTransform>(DEFAULT_TEXT_TRANSFORM);

  function moveText(x: number, y: number) {
    setTextTransform((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    }));
  }

  function rotateText(angle: number) {
    setTextTransform((prev) => ({
      ...prev,
      rotation: ((angle % 360) + 360) % 360,
    }));
  }

  function resizeText(fontSize: number) {
    setTextTransform((prev) => ({
      ...prev,
      fontSize: Math.max(32, Math.min(120, fontSize)),
    }));
  }

  function resetTextTransform() {
    setTextTransform(DEFAULT_TEXT_TRANSFORM);
  }

  return {
    textTransform,
    setTextTransform,
    moveText,
    rotateText,
    resizeText,
    resetTextTransform,
  };
}
