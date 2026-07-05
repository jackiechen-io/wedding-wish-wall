export const TARGET_MAX_BYTES = 400 * 1024;
export const HARD_MAX_UPLOAD_BYTES = 450 * 1024;
export const MAX_LONG_EDGE = 1200;
export const FALLBACK_LONG_EDGE = 1024;

export function getFileSizeLabel(bytes: number) {
  return `${Math.round(bytes / 1024)} KB`;
}

export function getCanvasSize(width: number, height: number, maxLongEdge: number) {
  const longEdge = Math.max(width, height);
  if (longEdge <= maxLongEdge) return { width, height };

  const scale = maxLongEdge / longEdge;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale)
  };
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
