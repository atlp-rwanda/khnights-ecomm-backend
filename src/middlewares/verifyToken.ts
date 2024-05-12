import { Request, Response, NextFunction } from 'express';
import { User, UserInterface } from '../entities/User';
import { getRepository } from 'typeorm';
import jwt, { type JwtPayload, type Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface AuthRequest extends Request {
  user?: UserInterface;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader === undefined) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || token === undefined) {
    return res.status(401).json({ error: 'Please login' });
  }

  if (token !== undefined) {
    try {
      jwt.verify(token, process.env.JWT_SECRET as Secret, async (err, decodedToken) => {
        if (err !== null) {
          return res.status(403).json({ status: 'error', error: 'Access denied' });
        }

        if (decodedToken !== undefined) {
          const { email } = decodedToken as JwtPayload;
          const userRepository = getRepository(User);
          const user = await userRepository.findOneBy({ email });

          if (!user) {
            return res.status(401).json({ status: 'error', error: 'You are not Authorized' });
          }

          req.user = user as UserInterface;
          next();
        }
      });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
};
