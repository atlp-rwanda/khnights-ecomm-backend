import { Router } from 'express';
import { disable2FA, enable2FA, login, resendOTP, sendPasswordResetLink, userPasswordReset , userRegistration, userVerification, verifyOTP} from '../controllers';



import { activateUser,disactivateUser } from '../controllers/index';
import {hasRole} from '../middlewares/roleCheck';
import { isTokenValide } from '../middlewares/isValid';

const router = Router();

router.post('/register', userRegistration);
router.get('/verify/:id', userVerification);
router.post('/login', login);
router.post('/enable-2fa', enable2FA);
router.post('/disable-2fa', disable2FA);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/activate',isTokenValide,hasRole("ADMIN"),activateUser);
router.post('/deactivate',isTokenValide,hasRole("ADMIN"),disactivateUser);
router.post("/password/reset", userPasswordReset);
router.post("/password/reset/link", sendPasswordResetLink);

export default router;
