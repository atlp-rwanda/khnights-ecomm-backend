import { Router } from 'express';
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
} from '../controllers';

import { activateUser, disactivateUser, userProfileUpdate } from '../controllers/index';
import { hasRole } from '../middlewares/roleCheck';
import { isTokenValide } from '../middlewares/isValid';
import passport from 'passport';
import '../utils/auth';
const router = Router();

router.post('/register', userRegistration);
router.get('/verify/:id', userVerification);
router.post('/login', login);
router.post('/logout', logout);
router.post('/enable-2fa', enable2FA);
router.post('/disable-2fa', disable2FA);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/activate', isTokenValide, hasRole('ADMIN'), activateUser);
router.post('/deactivate', isTokenValide, hasRole('ADMIN'), disactivateUser);
router.post('/password/reset', userPasswordReset);
router.post('/password/reset/link', sendPasswordResetLink);
router.put('/update', userProfileUpdate);

router.get('/google-auth', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/user/login/success',
    failureRedirect: '/user/login/failed',
  })
);
router.get('/login/success', async (req, res) => {
  const user = req.user as UserInterface;
  if (!user) {
    responseError(res, 404, 'user not found');
  }
  const payload = {
    id: user?.id,
    email: user?.email,
    role: user?.role,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '24h' });
  res.status(200).json({
    status: 'success',
    data: {
      token: token,
      message: 'Login success',
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
