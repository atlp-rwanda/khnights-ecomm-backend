import { Request, Response } from 'express';
import { User } from '../../entities/User';
import { getRepository } from 'typeorm';
import { otpTemplate } from '../../helper/emailTemplates';
import { sendOTPEmail } from './userSendOTPEmail';
import { sendOTPSMS } from './userSendOTPMessage';
import { start2FAProcess } from './userStartTwoFactorAuthProcess';
import dotenv from 'dotenv';

dotenv.config();

export const userResendOtpService = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ status: 'error', message: 'Please provide an email' });
  }

  const userRepository = getRepository(User);
  const user = await userRepository.findOneBy({ email });

  if (!user) {
    return res.status(404).json({ status: 'error', message: 'Incorrect email' });
  }

  const otpCode = await start2FAProcess(user.email);
  const OTPEmailcontent = otpTemplate(user.firstName, otpCode.toString());
  await sendOTPEmail('Login OTP', user.email, OTPEmailcontent);
  if (process.env.APP_ENV !== 'test') {
    await sendOTPSMS(user.phoneNumber, otpCode.toString());
  }
  return res.status(200).json({
    status: 'success',
    data: {
      message: 'OTP sent successfully',
    },
  });
};
