import type { Response } from "express";

type ParsableSchema<T> = {
  parse: (input: unknown) => T;
  safeParse?: (
    input: unknown,
  ) =>
    | { success: true; data: T }
    | { success: false; error: unknown };
};

type ValidationIssue = {
  path: string;
  message: string;
};

export function sendValidated<T>(
  res: Response,
  schema: ParsableSchema<T>,
  payload: unknown,
): void {
  res.json(schema.parse(payload));
}

export function sendValidatedWithStatus<T>(
  res: Response,
  statusCode: number,
  schema: ParsableSchema<T>,
  payload: unknown,
): void {
  res.status(statusCode).json(schema.parse(payload));
}

export function sendNotFound(res: Response, resource: string): void {
  res.status(404).json({
    code: "not_found",
    message: `${resource} not found`,
  });
}

export function sendValidationError(
  res: Response,
  message: string,
  details?: ValidationIssue[],
): void {
  res.status(400).json({
    code: "bad_request",
    message,
    ...(details && details.length > 0 ? { details } : {}),
  });
}

export function parseOrSendValidationError<T>(
  res: Response,
  schema: ParsableSchema<T>,
  payload: unknown,
  message: string,
): T | null {
  if (typeof schema.safeParse === "function") {
    const result = schema.safeParse(payload);
    if (result.success) {
      return result.data;
    }
    sendValidationError(res, message, extractValidationIssues(result.error));
    return null;
  }

  try {
    return schema.parse(payload);
  } catch (error) {
    sendValidationError(res, message, extractValidationIssues(error));
    return null;
  }
}

function extractValidationIssues(error: unknown): ValidationIssue[] {
  if (!error || typeof error !== "object") {
    return [];
  }

  const candidate = error as { issues?: unknown };
  if (!Array.isArray(candidate.issues)) {
    return [];
  }

  return candidate.issues
    .map((issue) => toValidationIssue(issue))
    .filter((issue): issue is ValidationIssue => issue != null);
}

function toValidationIssue(issue: unknown): ValidationIssue | null {
  if (!issue || typeof issue !== "object") {
    return null;
  }

  const candidate = issue as { path?: unknown; message?: unknown };
  if (typeof candidate.message !== "string") {
    return null;
  }

  const path = Array.isArray(candidate.path)
    ? candidate.path.filter((token) => typeof token === "string" || typeof token === "number").join(".")
    : "";

  return {
    path,
    message: candidate.message,
  };
}
