import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse, ValidationError } from '../types/task.types';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Express middleware that reads express-validator results and
 * returns a 422 Unprocessable Entity if validation failed.
 */
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors: ValidationError[] = errors.array().map((err) => ({
      field: (err as { path?: string; param?: string }).path ?? (err as { path?: string; param?: string }).param ?? 'unknown',
      message: err.msg as string,
    }));

    const response: ApiResponse<null> = {
      success: false,
      message: 'Validation failed',
      errors: validationErrors,
    };

    res.status(422).json(response);
    return;
  }

  next();
}

/**
 * Global error handler — must be the last middleware registered.
 */
export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const response: ApiResponse<null> = {
      success: false,
      message: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // SQLite constraint errors
  if (err.message?.includes('CHECK constraint failed')) {
    const response: ApiResponse<null> = {
      success: false,
      message: 'Invalid data provided — database constraint violated',
    };
    res.status(400).json(response);
    return;
  }

  console.error('[GlobalErrorHandler]', err);

  const response: ApiResponse<null> = {
    success: false,
    message: 'An unexpected internal server error occurred',
  };
  res.status(500).json(response);
}

/**
 * 404 Not Found handler for unmatched routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse<null> = {
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  };
  res.status(404).json(response);
}
