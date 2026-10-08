import type { Request, Response } from "express";
import type { PaginatedList } from "../types";
import { parsePagination } from "./pagination";
import { queryString } from "./query";
import { normalizeTurkish } from "./turkishSearch";

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

  const { limit, offset } = parsePagination(req.query);
  const total = filtered.length;
  const items = filtered.slice(offset, offset + limit);

  const body: PaginatedList<T> = { items, total, limit, offset };
  res.json(body);
}
