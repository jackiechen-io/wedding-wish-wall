export function normalizeText(input: string) {
  return input
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .toLowerCase();
}
