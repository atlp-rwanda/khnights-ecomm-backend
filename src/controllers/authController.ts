import { Request, Response } from 'express';
import {
  userVerificationService,
  userRegistrationService,
  userLoginService,
  userEnableTwoFactorAuth,
  userDisableTwoFactorAuth,
  userValidateOTP,
  userResendOtpService,
} from '../services';

export const userRegistration = async (req: Request, res: Response) => {
  await userRegistrationService(req, res);
};

export const userVerification = async (req: Request, res: Response) => {
  await userVerificationService(req, res);
};

export const login = async (req: Request, res: Response) => {
  await userLoginService(req, res);
};

export const enable2FA = async (req: Request, res: Response) => {
  await userEnableTwoFactorAuth(req, res);
};

export const disable2FA = async (req: Request, res: Response) => {
  await userDisableTwoFactorAuth(req, res);
};

export const verifyOTP = async (req: Request, res: Response) => {
  await userValidateOTP(req, res);
};

export const resendOTP = async (req: Request, res: Response) => {
  await userResendOtpService(req, res);
};
