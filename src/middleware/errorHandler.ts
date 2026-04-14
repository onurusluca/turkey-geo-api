import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/HttpError";
import { logger } from "../utils/logger";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId;

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: err.message,
      requestId,
    });
    return;
  }

  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  logger.error({
    requestId,
    err: message,
    stack,
  });

  res.status(500).json({
    error: "Something went wrong",
    requestId,
  });
}
