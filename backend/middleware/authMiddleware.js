import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized. Please log in.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      throw new AppError('User no longer exists.', 401);
    }

    if (req.user.isBlocked) {
      throw new AppError('Your account has been blocked.', 403);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Not authorized. Invalid or expired token.', 401);
  }
});

export const isVerifiedHospital = (req, res, next) => {
  if (
    req.user &&
    req.user.role === 'hospital' &&
    !req.user.isVerified &&
    ['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)
  ) {
    return next(new AppError('Hospital account is pending admin verification', 403));
  }
  next();
};
