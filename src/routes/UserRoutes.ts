import { Router } from 'express';
import {
  userRegistration,
  userVerification,
  login,
  enable2FA,
  disable2FA,
  verifyOTP,
  resendOTP,
} from '../controllers/authController';

const router = Router();

router.post('/register', userRegistration);
router.get('/verify/:id', userVerification);
router.post('/login', login);
router.post('/enable-2fa', enable2FA);
router.post('/disable-2fa', disable2FA);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

export default router;
