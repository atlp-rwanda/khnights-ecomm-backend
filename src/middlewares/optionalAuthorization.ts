import { Request, Response, NextFunction } from 'express';
import { User, UserInterface } from '../entities/User';
import { getRepository } from 'typeorm';
import jwt, { type JwtPayload, type Secret } from 'jsonwebtoken';
import { responseError } from '../utils/response.utils';
import dotenv from 'dotenv';

dotenv.config();

interface AuthRequest extends Request {
  user?: UserInterface;
}

export const optinalAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader !== undefined) {
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || token === undefined) {
      responseError(res, 401, 'Please login');
    }

    if (token !== undefined) {
      try {
        jwt.verify(token, process.env.JWT_SECRET as Secret, async (err, decodedToken) => {
          if (err !== null) {
            responseError(res, 403, 'Access denied');
          }

          if (decodedToken !== undefined) {
            const { email } = decodedToken as JwtPayload;
            const userRepository = getRepository(User);
            const user = await userRepository.findOneBy({ email });

            if (!user) {
              responseError(res, 401, 'You are not Authorized');
            }

            req.user = user as UserInterface;
            next();
          }
        });
      } catch (error) {
        responseError(res, 401, 'Invalid token');
      }
    }
  } else {
    next();
  }
};
