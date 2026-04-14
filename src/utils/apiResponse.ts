import type { Request, Response } from "express";

export function jsonError(
  res: Response,
  req: Request,
  status: number,
  error: string
): void {
  res.status(status).json({ error, requestId: req.requestId });
}
