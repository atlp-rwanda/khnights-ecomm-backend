import { RequestHandler, Router } from 'express';
import { responseError } from '../utils/response.utils';
import { UserInterface } from '../entities/User';
import jwt from 'jsonwebtoken';
import {
  disable2FA,
  enable2FA,
  login,
  resendOTP,
  sendPasswordResetLink,
  userPasswordReset,
  userRegistration,
  userVerification,
  verifyOTP,
  logout,
  getAllUsersController,
  getUserByIdController,
} from '../controllers';

import { activateUser, disactivateUser, userProfileUpdate } from '../controllers/index';
import { hasRole } from '../middlewares/roleCheck';
import passport from 'passport';
import '../utils/auth';
import { start2FAProcess } from '../services/userServices/userStartTwoFactorAuthProcess';
import { otpTemplate } from '../helper/emailTemplates';
import { sendOTPEmail } from '../services/userServices/userSendOTPEmail';
import { sendOTPSMS } from '../services/userServices/userSendOTPMessage';
import { authMiddleware } from '../middlewares/verifyToken';
const router = Router();

router.post('/register', userRegistration);
router.get('/verify/:id', userVerification);
router.post('/login', login);
router.post('/logout', logout);
router.post('/enable-2fa', enable2FA);
router.post('/disable-2fa', disable2FA);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/allUsers', authMiddleware as RequestHandler, hasRole('ADMIN'), getAllUsersController);
router.get('/single/:id', authMiddleware as RequestHandler, hasRole('ADMIN'), getUserByIdController);
router.post('/activate', authMiddleware as RequestHandler, hasRole('ADMIN'), activateUser);
router.post('/deactivate', authMiddleware as RequestHandler, hasRole('ADMIN'), disactivateUser);
router.post('/password/reset', userPasswordReset);
router.post('/password/reset/link', sendPasswordResetLink);
router.put('/update', authMiddleware as RequestHandler, userProfileUpdate);

router.get('/google-auth', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: `${process.env.CLIENT_URL}/login/google-auth`,
    failureRedirect: `${process.env.CLIENT_URL}/login/google-auth`,
  })
);
router.get('/login/success', async (req, res) => {
  const user = req.user as UserInterface;

  if (!user) {
    responseError(res, 404, 'user not found');
    return;
  }

  if (user.status === 'suspended') {
    return res.status(400).json({ status: 'error', message: 'Your account has been suspended' });
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
    return res.status(200).json({
      status: 'success',
      data: {
        token: token,
        message: 'Login success',
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
});

router.get('/login/failed', async (req, res) => {
  res.status(401).json({
    status: false,
    message: 'Login failed',
  });
});

export default router;
