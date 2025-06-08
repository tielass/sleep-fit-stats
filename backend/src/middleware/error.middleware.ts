import { Request, Response, NextFunction } from 'express';

// Error handling middleware for JWT errors
export const handleJwtErrors = (
  err: Error & { name?: string },
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ message: 'Token expired' });
    return;
  }

  next(err);
};
