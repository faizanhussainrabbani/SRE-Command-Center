import type { Response } from "express";

type ParsableSchema<T> = {
  parse: (input: unknown) => T;
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
