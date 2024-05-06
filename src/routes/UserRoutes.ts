import { Router } from 'express';
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
  sampleAPI,
} from '../controllers';
import { isTokenValide } from '../middlewares/index';

const router = Router();

router.post('/register', userRegistration);
router.get('/verify/:id', userVerification);
router.post('/login', login);
router.post('/enable-2fa', enable2FA);
router.post('/disable-2fa', disable2FA);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
// sample usage of isValide middleware. it validate a token and permit to continue if token is valide
router.get('/verifyMiddleware', isTokenValide, sampleAPI);
router.post('/password/reset', userPasswordReset);
router.post('/password/reset/link', sendPasswordResetLink);

export default router;
