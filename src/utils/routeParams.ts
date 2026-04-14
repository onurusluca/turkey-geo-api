/**
 * Express may type path params as `string | string[]` (e.g. with @types/express v5).
 */
export type PathParam = string | string[] | undefined;

export type ParsedPathInt = "missing" | "invalid" | number;

export function parsePathIntParam(param: PathParam): ParsedPathInt {
  if (param === undefined) return "missing";
  const s = Array.isArray(param) ? param[0] : param;
  if (s === undefined || s === "") return "missing";
  const n = Number.parseInt(s, 10);
  if (Number.isNaN(n)) return "invalid";
  return n;
}
