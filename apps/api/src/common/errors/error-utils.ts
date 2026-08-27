import { ZodError } from 'zod';

import { AppError, type ErrorDetail } from './app-error.js';

export function formatZodError(error: ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || undefined,
    message: issue.message,
  }));
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return AppError.validation(formatZodError(error));
  }

  if (error instanceof Error) {
    return AppError.internal(error.message, error);
  }

  return AppError.internal('An unexpected error occurred', error);
}
