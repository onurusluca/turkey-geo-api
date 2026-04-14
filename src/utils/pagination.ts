import type { Request } from "express";

const DEFAULT_LIMIT = 100;
export const MAX_LIMIT = 50_000;

function queryString(
  query: Request["query"],
  key: string
): string | undefined {
  const v = query[key];
  if (Array.isArray(v)) {
    return typeof v[0] === "string" ? v[0] : undefined;
  }
  return typeof v === "string" ? v : undefined;
}

export function parsePagination(query: Request["query"]):
  | { ok: true; limit: number; offset: number }
  | { ok: false; message: string } {
  const limitRaw = queryString(query, "limit");
  const offsetRaw = queryString(query, "offset");

  const limit =
    limitRaw === undefined || limitRaw === ""
      ? DEFAULT_LIMIT
      : Number(limitRaw);
  const offset =
    offsetRaw === undefined || offsetRaw === "" ? 0 : Number(offsetRaw);

  if (!Number.isInteger(limit) || limit < 1) {
    return { ok: false, message: "limit must be a positive integer" };
  }
  if (limit > MAX_LIMIT) {
    return {
      ok: false,
      message: `limit must be at most ${MAX_LIMIT}`,
    };
  }
  if (!Number.isInteger(offset) || offset < 0) {
    return { ok: false, message: "offset must be a non-negative integer" };
  }

  return { ok: true, limit, offset };
}
