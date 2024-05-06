import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifiedToken } from '../helper/verify';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';

export interface DecodedUser {
  userType: string;
  id: string;
  email: string;
}

export const isTokenValide: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;
    const userPaylod = verifiedToken(token);
    if (!userPaylod) {
      res.status(401).json({ Message: 'Sorry, You are not authorized' });
      return;
    }
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({where: {id: userPaylod.id}})
    if(!user){
      res.status(404).json({Message: 'User not found'});
      return;
    }
    req.user = user;
    return next();
  } catch (error) {
    console.error('Error in token Validation middleware:\n', error);
    res.status(401).json({ Message: 'Sorry, Something went wrong' });
    return;
  }
};