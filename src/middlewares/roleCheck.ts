import { NextFunction, Request, Response } from 'express';
import { User, UserInterface } from '../entities/User';
import { getRepository } from 'typeorm';
import { responseError } from '../utils/response.utils';

/**
 * Middleware to check user role before granting access to protectered routes.
 * @param {("ADMIN" | "VENDOR" | "BUYER")} role - The role required to access the route.
 * @returns {function} Helper function for making responses.
 */

declare module 'express' {
  interface Request {
    user?: Partial<UserInterface>;
  }
}

export const hasRole =
  (role: 'ADMIN' | 'VENDOR' | 'BUYER') => async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return responseError(res, 401, 'Authentication required');
      }

      const userId = req.user.id;

      const userRepository = getRepository(User);

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return responseError(res, 401, 'User not found');
      }
      if (user.role !== role) {
        return responseError(res, 403, 'Unauthorized action');
      }

      next();
    } catch (error) {
      responseError(res, 400, (error as Error).message);
    }
  };
