import { Request, Response } from 'express';
import { otpTemplate } from '../helper/emailTemplates';
import {
  userVerificationService,
  userRegistrationService,
  userEnableTwoFactorAuth,
  userDisableTwoFactorAuth,
} from '../services';

export const userRegistration = async (req: Request, res: Response) => {
  await userRegistrationService(req, res);
};

export const userVerification = async (req: Request, res: Response) => {
  await userVerificationService(req, res);
};

export const enable2FA = async (req: Request, res: Response) => {
  await userEnableTwoFactorAuth(req, res);
};

export const disable2FA = async (req: Request, res: Response) => {
  await userDisableTwoFactorAuth(req, res);
};
