/** Lowercase for Turkish substring matching (İ/I, i/ı, etc.). */
export function normalizeTurkish(s: string): string {
  return s.normalize("NFKC").toLocaleLowerCase("tr-TR");
}
