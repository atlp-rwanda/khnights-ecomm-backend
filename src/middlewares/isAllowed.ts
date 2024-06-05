import { NextFunction, Request, Response } from 'express';
import { User } from '../entities/User';
import { getRepository } from 'typeorm';
import { responseError } from '../utils/response.utils';

export interface UserInterface {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  phoneNumber: string;
  photoUrl?: string;
  verified: boolean;
  status: 'active' | 'suspended';
  userType: 'Admin' | 'Buyer' | 'Vendor';
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export const checkUserStatus = async (req: Request, res: Response, next: NextFunction) => {
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

    if (user.status === 'active') {
      next();
    } else if (user.status === 'suspended') {
      return responseError(res, 403, 'You have been suspended. Please contact our support team.');
    } else {
      return responseError(res, 403, 'Unauthorized action');
    }
  } catch (error) {
    responseError(res, 400, (error as Error).message);
  }
};
