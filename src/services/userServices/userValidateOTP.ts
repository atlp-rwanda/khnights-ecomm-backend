import { Request, Response } from 'express';
import { is2FAValid } from './userIsOTPValid';

export const userValidateOTP = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ status: 'error', message: 'Please provide your email and code' });
    }

    const [isValid, message] = await is2FAValid(email, code);

    if (!isValid) {
      return res.status(400).json({ status: 'error', message });
    }

    return res.status(200).json({ status: 'success', message: 'Authentication successful' });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
};
