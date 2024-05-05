import { Router } from 'express';
import { userRegistration, userVerification, enable2FA, disable2FA } from '../controllers/authController';

const router = Router();

router.post('/register', userRegistration);
router.get('/verify/:id', userVerification);
// router.post('/login', login);
router.post('/enable-2fa', enable2FA);
router.post('/disable-2fa', disable2FA);
// router.post('/verify-otp', verifyOTP);

export default router;
