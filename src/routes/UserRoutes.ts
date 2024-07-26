import { RequestHandler, Router } from 'express';
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
  getUserProfileController,
  userUpdateProfilePictureController,
  googleOAuthController,
} from '../controllers';

import { activateUser, disactivateUser, userProfileUpdate } from '../controllers/index';
import { hasRole } from '../middlewares/roleCheck';
import upload from '../middlewares/multer';
import passport from 'passport';
import '../utils/auth';
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
router.get('/profile', authMiddleware as RequestHandler, getUserProfileController);
router.put('/profile', authMiddleware as RequestHandler, upload.array('images', 1), userUpdateProfilePictureController);

router.get('/google-auth', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login/google-auth?status='GoogleOAuthFailure'`,
  }),
  googleOAuthController
);

export default router;
