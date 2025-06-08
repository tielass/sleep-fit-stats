import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No authentication token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // Find user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({ message: 'Invalid authentication token' });
      return;
    } // Add user to request object
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};
