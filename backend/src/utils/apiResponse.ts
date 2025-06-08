import { Response } from 'express';

/**
 * Utility class for consistent API responses
 */
export class ApiResponse {
  /**
   * Send a success response
   */
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
  /**
   * Send an error response
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors?: Record<string, unknown>
  ): void {
    const response: {
      success: boolean;
      message: string;
      errors?: Record<string, unknown>;
    } = {
      success: false,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Send a 'not found' response
   */
  static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, 404);
  }

  /**
   * Send an unauthorized response
   */
  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    this.error(res, message, 401);
  }

  /**
   * Send a forbidden response
   */
  static forbidden(res: Response, message: string = 'Access denied'): void {
    this.error(res, message, 403);
  }

  /**
   * Send a server error response
   */
  static serverError(res: Response, message: string = 'Internal server error'): void {
    this.error(res, message, 500);
  }
  /**
   * Send a validation error response
   */
  static validationError(
    res: Response,
    errors: Record<string, unknown>,
    message: string = 'Validation error'
  ): void {
    this.error(res, message, 422, errors);
  }

  /**
   * Send a created response
   */
  static created<T>(res: Response, data: T, message?: string): void {
    this.success(res, data, message, 201);
  }

  /**
   * Send a no content response
   */
  static noContent(res: Response): void {
    res.status(204).end();
  }
}
