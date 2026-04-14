import type { Request, Response } from "express";
import type { PaginatedList } from "../types";
import { jsonError } from "./apiResponse";
import { parsePagination } from "./pagination";
import { normalizeTurkish } from "./turkishSearch";

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

/** Paginate + optional `q` search. `match` receives normalized query substring. */
export function sendPaginated<T>(
  res: Response,
  req: Request,
  rows: T[],
  match: (row: T, qNormalized: string) => boolean
): void {
  const qRaw = queryString(req.query, "q");
  const qNorm =
    qRaw !== undefined && qRaw.trim() !== ""
      ? normalizeTurkish(qRaw.trim())
      : null;

  const filtered =
    qNorm === null ? rows : rows.filter((row) => match(row, qNorm));

  const pag = parsePagination(req.query);
  if (!pag.ok) {
    jsonError(res, req, 400, pag.message);
    return;
  }

  const { limit, offset } = pag;
  const total = filtered.length;
  const items = filtered.slice(offset, offset + limit);

  const body: PaginatedList<T> = { items, total, limit, offset };
  res.json(body);
}
