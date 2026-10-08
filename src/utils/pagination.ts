import type { Request } from "express";
import { HttpError } from "../errors/HttpError";
import { queryString } from "./query";

const DEFAULT_LIMIT = 100;
export const MAX_LIMIT = 1_000;

export function parsePagination(query: Request["query"]): {
  limit: number;
  offset: number;
} {
  const limitRaw = queryString(query, "limit");
  const offsetRaw = queryString(query, "offset");

  const limit =
    limitRaw === undefined || limitRaw === ""
      ? DEFAULT_LIMIT
      : Number(limitRaw);
  const offset =
    offsetRaw === undefined || offsetRaw === "" ? 0 : Number(offsetRaw);

  if (!Number.isInteger(limit) || limit < 1) {
    throw new HttpError(400, "limit must be a positive integer");
  }
  if (limit > MAX_LIMIT) {
    throw new HttpError(400, `limit must be at most ${MAX_LIMIT}`);
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new HttpError(400, "offset must be a non-negative integer");
  }

  return { limit, offset };
}
