import { Request, Response } from 'express';
import { responseError } from '../../utils/response.utils';
import { UserInterface } from '../../entities/User';
import jwt from 'jsonwebtoken';
import { start2FAProcess } from './userStartTwoFactorAuthProcess';
import { otpTemplate } from '../../helper/emailTemplates';
import { sendOTPEmail } from './userSendOTPEmail';
import { sendOTPSMS } from './userSendOTPMessage';

const googleAuth = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserInterface;
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login/google-auth?status=userNotFound`);
    }

    if (user.status === 'suspended') {
      return res.redirect(`${process.env.CLIENT_URL}/login/google-auth?status=userSuspended`);
    }

    if (!user.twoFactorEnabled) {
      const payload = {
        id: user?.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user?.email,
        role: user?.role,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '24h' });
      return res.redirect(`${process.env.CLIENT_URL}/login/google-auth?status=success&token=${token}&role=${user.role?.toLowerCase()}`);
    }

    const otpCode = await start2FAProcess(user.email);
    const OTPEmailcontent = otpTemplate(user.firstName, otpCode.toString());
    await sendOTPEmail('Login OTP Code', user.email, OTPEmailcontent);
    await sendOTPSMS(user.phoneNumber, otpCode.toString());
    return res.redirect(`${process.env.CLIENT_URL}/login/google-auth?status=otp&email=${user.email}`);
  } catch (error) {
    return res.redirect(`${process.env.CLIENT_URL}/login/google-auth?status=error`);
  }
};

export default googleAuth;