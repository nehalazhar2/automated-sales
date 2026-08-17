import 'server-only';

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const DATA_URI_PATTERN = /^data:(image\/[a-z]+);base64,(.+)$/i;

export function isImageDataUri(value: string): boolean {
  return /^data:image\//i.test(value);
}

export function parseImageDataUri(dataUri: string): { base64: string; extension: string } | null {
  const match = DATA_URI_PATTERN.exec(dataUri.trim());
  if (!match) return null;
  const extension = EXT_BY_MIME[match[1].toLowerCase()];
  if (!extension) return null;
  return { base64: match[2], extension };
}
