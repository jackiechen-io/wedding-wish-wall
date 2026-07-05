export async function supportsWebp(): Promise<boolean> {
  if (typeof document === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(!!blob && blob.type === 'image/webp'),
      'image/webp',
      0.8
    );
  });
}
