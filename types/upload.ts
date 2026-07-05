export type UploadUrlResponse = {
  uploadUrl: string;
  key: string;
  publicUrl: string;
};

export type CompressedImage = {
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  contentType: 'image/webp' | 'image/jpeg';
};
