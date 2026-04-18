import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/http.js';

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Validation failed',
      issues: error.flatten(),
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    message: 'Internal server error',
  });
}
