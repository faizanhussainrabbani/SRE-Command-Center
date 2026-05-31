import type { ErrorRequestHandler } from "express";
import { logger } from "../lib/logger";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error({ err }, "Unhandled error");

  if (res.headersSent) {
    return;
  }

  const zodIssues = extractZodLikeIssues(err);
  if (zodIssues.length > 0) {
    res.status(400).json({
      code: "bad_request",
      message: "Request validation failed.",
      details: zodIssues,
    });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
};

function extractZodLikeIssues(error: unknown): Array<{ path: string; message: string }> {
  if (!error || typeof error !== "object") {
    return [];
  }

  const candidate = error as { name?: unknown; issues?: unknown };
  if (candidate.name !== "ZodError" || !Array.isArray(candidate.issues)) {
    return [];
  }

  return candidate.issues
    .map((issue) => {
      if (!issue || typeof issue !== "object") {
        return null;
      }
      const typedIssue = issue as { path?: unknown; message?: unknown };
      if (typeof typedIssue.message !== "string") {
        return null;
      }
      const path = Array.isArray(typedIssue.path)
        ? typedIssue.path
            .filter((segment) => typeof segment === "string" || typeof segment === "number")
            .join(".")
        : "";
      return { path, message: typedIssue.message };
    })
    .filter((issue): issue is { path: string; message: string } => issue != null);
}
