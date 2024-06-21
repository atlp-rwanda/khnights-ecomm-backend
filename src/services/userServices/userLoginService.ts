import { Request, Response } from 'express';
import { User } from '../../entities/User';
import { getRepository } from 'typeorm';
import { otpTemplate } from '../../helper/emailTemplates';
import { sendOTPEmail } from './userSendOTPEmail';
import { sendOTPSMS } from './userSendOTPMessage';
import { start2FAProcess } from './userStartTwoFactorAuthProcess';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const userLoginService = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Please provide an email and password' });
  }

  const userRepository = getRepository(User);
  const user = await userRepository.findOneBy({ email });

  if (!user) {
    return res.status(404).json({ status: 'error', message: 'Incorrect email or password' });
  }

  if (!user.verified) {
    return res.status(400).json({ status: 'error', message: 'Please verify your account' });
  }

  if (user.status === 'suspended') {
    return res.status(400).json({ status: 'error', message: 'Your account has been suspended' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ status: 'error', message: 'Incorrect email or password' });
  }

  if (!user.twoFactorEnabled) {
    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    if (process.env.APP_ENV === 'production') {
      res.cookie('token', token, { httpOnly: true, sameSite: false, secure: true });
    } else {
      res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        token,
        message: 'Login successful',
      },
    });
  }

  const otpCode = await start2FAProcess(user.email);
  const OTPEmailcontent = otpTemplate(user.firstName, otpCode.toString());
  await sendOTPEmail('Login OTP Code', user.email, OTPEmailcontent);
  await sendOTPSMS(user.phoneNumber, otpCode.toString());
  return res.status(200).json({
    status: 'success',
    data: {
      email: user.email,
      message: 'Please provide the OTP sent to your email or phone',
    },
  });
};
