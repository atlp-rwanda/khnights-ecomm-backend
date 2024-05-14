import { Request, Response, Router } from 'express';
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
  logout
} from '../controllers';

import { activateUser, disactivateUser } from '../controllers/index';
import { hasRole } from '../middlewares/roleCheck';
import { isTokenValide } from '../middlewares/isValid';
import passport from 'passport';
import "../utils/auth";

const router = Router();

router.post('/register', userRegistration);
router.get('/verify/:id', userVerification);
router.post('/login', login);
router.post('/logout', logout);
router.post('/logout', logout);
router.post('/enable-2fa', enable2FA);
router.post('/disable-2fa', disable2FA);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/activate', isTokenValide, hasRole('ADMIN'), activateUser);
router.post('/deactivate', isTokenValide, hasRole('ADMIN'), disactivateUser);
router.post('/password/reset', userPasswordReset);
router.post('/password/reset/link', sendPasswordResetLink);

router.get('/google-auth', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get("/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/user/login/success",
    failureRedirect: "/user/login/failed"
  })
);
router.get("/login/success", async (_req, res) => {
  res.status(200).json({
    status: true,
    message: "Login success"
  })
});
router.get("/login/failed", async (req, res) => {
  res.status(401).json({
    status: false,
    message: "Login failed"
  });
});

export default router;