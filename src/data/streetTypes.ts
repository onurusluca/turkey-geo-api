/** UAVT CSBM `turKod` labels observed in the bundled dataset. */
export const STREET_TYPE_NAMES: Record<number, string> = {
  0: "Köy Sokağı",
  1: "Meydan",
  2: "Bulvar",
  3: "Cadde",
  4: "Sokak",
  5: "Küme Evler",
};

export function streetTypeName(code: number | null): string | null {
  if (code === null) return null;
  return STREET_TYPE_NAMES[code] ?? null;
}
