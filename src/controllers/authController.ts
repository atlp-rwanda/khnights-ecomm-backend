import { Request, Response } from 'express';
import {
  userVerificationService,
  userRegistrationService,
  userLoginService,
  userEnableTwoFactorAuth,
  userDisableTwoFactorAuth,
  userValidateOTP,
  userResendOtpService,
  logoutService,
} from '../services';
import { userPasswordResetService } from '../services/userServices/userPasswordResetService';
import { sendPasswordResetLinkService } from '../services/userServices/sendResetPasswordLinkService';
import { activateUserService } from '../services/updateUserStatus/activateUserService';
import { deactivateUserService } from '../services/updateUserStatus/deactivateUserService';
import { userProfileUpdateServices } from '../services/userServices/userProfileUpdateServices';
import getAllUsers from '../services/userServices/getAllUsers';
import getUserById from '../services/userServices/getUserById';

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

export const sampleAPI = async (req: Request, res: Response) => {
  res.status(200).json({ message: 'Token is valid' });
};
export const userPasswordReset = async (req: Request, res: Response) => {
  await userPasswordResetService(req, res);
};
export const sendPasswordResetLink = async (req: Request, res: Response) => {
  await sendPasswordResetLinkService(req, res);
};

export async function activateUser(req: Request, res: Response) {
  await activateUserService(req, res);
}

export async function disactivateUser(req: Request, res: Response) {
  await deactivateUserService(req, res);
}

export const logout = async (req: Request, res: Response) => {
  await logoutService(req, res);
};
export const userProfileUpdate = async (req: Request, res: Response) => {
  await userProfileUpdateServices(req, res);
};

export const getAllUsersController = async (req: Request, res: Response) => {
  await getAllUsers(req, res);
};

export const getUserByIdController = async (req: Request, res: Response) => {
  await getUserById(req, res);
};