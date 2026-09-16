/**
 * Normalize Vietnamese name for comparison.
 * - trim leading/trailing spaces
 * - collapse multiple spaces
 * - normalize Unicode (NFD → strip combining marks → NFC)
 * - uppercase
 */
export function normalizeVietnameseName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC')
    .toUpperCase();
}

/**
 * Check if two Vietnamese names match after normalization.
 */
export function namesMatch(inputName: string, verifiedName: string): boolean {
  return normalizeVietnameseName(inputName) === normalizeVietnameseName(verifiedName);
}
