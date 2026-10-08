import type { Response } from "express";
import { HttpError } from "../errors/HttpError";
import { parsePathIntParam, type PathParam } from "./routeParams";

export function requirePathInt(param: PathParam, label: string): number {
  const parsed = parsePathIntParam(param);
  if (parsed === "missing") {
    throw new HttpError(400, `${label} is required`);
  }
  if (parsed === "invalid") {
    throw new HttpError(400, `Invalid ${label}`);
  }
  return parsed;
}

export function sendById<T>(
  res: Response,
  map: Map<number, T>,
  id: number,
  notFoundMessage: string
): void {
  const row = map.get(id);
  if (!row) {
    throw new HttpError(404, notFoundMessage);
  }
  res.json(row);
}

export function rowsForParent<T>(map: Map<number, T[]>, id: number): T[] {
  return map.get(id) ?? [];
}
