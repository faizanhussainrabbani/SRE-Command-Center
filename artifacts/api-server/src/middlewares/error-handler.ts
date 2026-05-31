import type { ErrorRequestHandler } from "express";
import { logger } from "../lib/logger";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error({ err }, "Unhandled error");

  if (res.headersSent) {
    return;
  }

  res.status(500).json({ error: "Internal server error" });
};
