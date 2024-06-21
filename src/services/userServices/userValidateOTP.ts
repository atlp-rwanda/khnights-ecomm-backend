import { Request, Response } from 'express';
import { is2FAValid } from './userIsOTPValid';
import { User } from '../../entities/User';
import { getRepository } from 'typeorm';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const userValidateOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ status: 'error', message: 'Please provide an email and OTP code' });
    }
    const [isvalid, message] = await is2FAValid(email, otp);

    if (!isvalid) {
      return res.status(403).json({ status: 'error', message });
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOneBy({ email });

    const token = jwt.sign(
      {
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        role: user?.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );
    return res.status(200).json({
      status: 'success',
      data: {
        token,
        message: 'Login successful',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
};
