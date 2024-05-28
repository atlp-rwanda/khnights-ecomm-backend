import request from 'supertest';
import express, { Request, Response } from 'express';
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
import { activateUser, disable2FA, disactivateUser, enable2FA, login, logout, resendOTP, sampleAPI, sendPasswordResetLink, userPasswordReset, userProfileUpdate, userRegistration, userVerification, verifyOTP } from '../controllers';

// Mock the services
jest.mock('../services', () => ({
  userVerificationService: jest.fn(),
  userRegistrationService: jest.fn(),
  userLoginService: jest.fn(),
  userEnableTwoFactorAuth: jest.fn(),
  userDisableTwoFactorAuth: jest.fn(),
  userValidateOTP: jest.fn(),
  userResendOtpService: jest.fn(),
  logoutService: jest.fn(),
}));

jest.mock('../services/userServices/userPasswordResetService', () => ({
  userPasswordResetService: jest.fn(),
}));

jest.mock('../services/userServices/sendResetPasswordLinkService', () => ({
  sendPasswordResetLinkService: jest.fn(),
}));

jest.mock('../services/updateUserStatus/activateUserService', () => ({
  activateUserService: jest.fn(),
}));

jest.mock('../services/updateUserStatus/deactivateUserService', () => ({
  deactivateUserService: jest.fn(),
}));

jest.mock('../services/userServices/userProfileUpdateServices', () => ({
  userProfileUpdateServices: jest.fn(),
}));

const app = express();
app.use(express.json());

app.post('/register', userRegistration);
app.post('/verify', userVerification);
app.post('/login', login);
app.post('/enable-2fa', enable2FA);
app.post('/disable-2fa', disable2FA);
app.post('/verify-otp', verifyOTP);
app.post('/resend-otp', resendOTP);
app.get('/sample', sampleAPI);
app.post('/reset-password', userPasswordReset);
app.post('/send-reset-link', sendPasswordResetLink);
app.post('/activate', activateUser);
app.post('/deactivate', disactivateUser);
app.post('/logout', logout);
app.put('/update-profile', userProfileUpdate);

describe('User Controller', () => {
  it('should call userRegistrationService on /register', async () => {
    (userRegistrationService as jest.Mock).mockImplementationOnce((req: Request, res: Response) => res.status(201).send());
    await request(app).post('/register').send({});
    expect(userRegistrationService).toHaveBeenCalled();
  });

  it('should call userVerificationService on /verify', async () => {
    (userVerificationService as jest.Mock).mockImplementationOnce((req: Request, res: Response) => res.status(200).send());
    await request(app).post('/verify').send({});
    expect(userVerificationService).toHaveBeenCalled();
  });

  it('should call userLoginService on /login', async () => {
    (userLoginService as jest.Mock).mockImplementationOnce((req: Request, res: Response) => res.status(200).send());
    await request(app).post('/login').send({});
    expect(userLoginService).toHaveBeenCalled();
  });

  it('should call userEnableTwoFactorAuth on /enable-2fa', async () => {
    (userEnableTwoFactorAuth as jest.Mock).mockImplementationOnce((req: Request, res: Response) => res.status(200).send());
    await request(app).post('/enable-2fa').send({});
    expect(userEnableTwoFactorAuth).toHaveBeenCalled();
  });

  it('should call userDisableTwoFactorAuth on /disable-2fa', async () => {
    (userDisableTwoFactorAuth as jest.Mock).mockImplementationOnce((req: Request, res: Response) => res.status(200).send());
    await request(app).post('/disable-2fa').send({});
    expect(userDisableTwoFactorAuth).toHaveBeenCalled();
  });

  it('should call userValidateOTP on /verify-otp', async () => {
    (userValidateOTP as jest.Mock).mockImplementationOnce((req: Request, res: Response) => res.status(200).send());
    await request(app).post('/verify-otp').send({});
    expect(userValidateOTP).toHaveBeenCalled();
  });

  it('should call userResendOtpService on /resend-otp', async () => {
    (userResendOtpService as jest.Mock).mockImplementationOnce((req: Request, res: Response) => res.status(200).send());
    await request(app).post('/resend-otp').send({});
    expect(userResendOtpService).toHaveBeenCalled();
  });

  it('should return 200 on /sample', async () => {
    const response = await request(app).get('/sample');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Token is valid' });
  });

  it('should call userPasswordResetService on /reset-password', async () => {
    (userPasswordResetService as jest.Mock).mockImplementationOnce((req: Request, res: Response) => res.status(200).send());
    await request(app).post('/reset-password').send({});
    expect(userPasswordResetService).toHaveBeenCalled();
  });

  it('should call sendPasswordResetLinkService on /send-reset-link', async () => {
    (sendPasswordResetLinkService as jest.Mock).mockImplementationOnce((req: Request, res: Response) => res.status(200).send());
    await request(app).post('/send-reset-link').send({});
    expect(sendPasswordResetLinkService).toHaveBeenCalled();
  });

  it('should call activateUserService on /activate', async () => {
    (activateUserService as jest.Mock).mockImplementationOnce((req: Request, res: Response) => res.status(200).send());
    await request(app).post('/activate').send({});
    expect(activateUserService).toHaveBeenCalled();
  });

  it('should call deactivateUserService on /deactivate', async () => {
    (deactivateUserService as jest.Mock).mockImplementationOnce((req: Request, res: Response) => res.status(200).send());
    await request(app).post('/deactivate').send({});
    expect(deactivateUserService).toHaveBeenCalled();
  });

  it('should call logoutService on /logout', async () => {
    (logoutService as jest.Mock).mockImplementationOnce((req: Request, res: Response) => res.status(200).send());
    await request(app).post('/logout').send({});
    expect(logoutService).toHaveBeenCalled();
  });

  it('should call userProfileUpdateServices on /update-profile', async () => {
    (userProfileUpdateServices as jest.Mock).mockImplementationOnce((req: Request, res: Response) => res.status(200).send());
    await request(app).put('/update-profile').send({});
    expect(userProfileUpdateServices).toHaveBeenCalled();
  });
});
