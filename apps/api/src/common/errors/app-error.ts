export type ErrorDetail = {
  field?: string;
  message: string;
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ErrorDetail[];
  public readonly isOperational: boolean;

  constructor(options: {
    statusCode: number;
    code: string;
    message: string;
    details?: ErrorDetail[];
    isOperational?: boolean;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = 'AppError';
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
    this.isOperational = options.isOperational ?? true;
  }

  static badRequest(message: string, details?: ErrorDetail[]): AppError {
    return new AppError({
      statusCode: 400,
      code: 'BAD_REQUEST',
      message,
      details,
    });
  }

  static validation(details: ErrorDetail[], message = 'Validation failed'): AppError {
    return new AppError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message,
      details,
    });
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError({
      statusCode: 404,
      code: 'NOT_FOUND',
      message,
    });
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError({
      statusCode: 401,
      code: 'UNAUTHORIZED',
      message,
    });
  }

  static forbidden(message = 'Insufficient permissions'): AppError {
    return new AppError({
      statusCode: 403,
      code: 'FORBIDDEN',
      message,
    });
  }

  static conflict(message = 'Resource conflict'): AppError {
    return new AppError({
      statusCode: 409,
      code: 'CONFLICT',
      message,
    });
  }

  static internal(message = 'Internal server error', cause?: unknown): AppError {
    return new AppError({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message,
      isOperational: false,
      cause,
    });
  }
}
