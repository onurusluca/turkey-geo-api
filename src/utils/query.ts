import type { Request } from "express";

export function queryString(
  query: Request["query"],
  key: string
): string | undefined {
  const v = query[key];
  if (Array.isArray(v)) {
    return typeof v[0] === "string" ? v[0] : undefined;
  }
  return typeof v === "string" ? v : undefined;
}
