/* eslint-disable no-console */
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '../entities/User';
import { responseSuccess, signToken } from '../utils';

export const initiateGoogleLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(
    req,
    res,
    next
  );
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  passport.authenticate(
    'google',
    async (err: unknown, user: User | null) => {
      if (err) {
        return res.status(500).json({error: 'Failed to authenticate with Google'});
      }
      if (!user) {
        return res.status(401).json({error: 'User not found'});
      }

      try {
        const token = signToken({ id: user.id });
        
        responseSuccess(res, 200, token, 'User authenticated successfully');
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    
    }
  )(req, res);
};

export { passport };
