import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers["x-request-id"];
  const id =
    typeof header === "string" && header.trim() !== ""
      ? header.trim()
      : randomUUID();
  req.requestId = id;
  res.setHeader("X-Request-ID", id);
  next();
}
