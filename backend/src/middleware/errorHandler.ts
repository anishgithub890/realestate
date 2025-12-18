import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { ValidationError as ExpressValidationError } from 'express-validator';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  // Handle known AppError
  if (err instanceof AppError) {
    return sendError(res, err.message, err.code, err.statusCode);
  }

  // Handle express-validator errors
  if (err.name === 'ValidationError' || Array.isArray((err as any).errors)) {
    const validationErrors = (err as any).errors || [];
    const messages = validationErrors.map((e: ExpressValidationError) => e.msg || e.message).join(', ');
    return sendError(res, messages, 'VALIDATION_ERROR', 400);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      return sendError(res, 'Duplicate entry. This record already exists.', 'DUPLICATE_ENTRY', 409);
    }
    if (prismaError.code === 'P2025') {
      return sendError(res, 'Record not found.', 'NOT_FOUND', 404);
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token.', 'INVALID_TOKEN', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired.', 'TOKEN_EXPIRED', 401);
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Default error response
  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    'INTERNAL_ERROR',
    500
  );
};

