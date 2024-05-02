import { Router } from 'express';
import * as authController from '../controllers/google.auth';

const routerGmail = Router();

routerGmail.get('/users/google-auth', authController.initiateGoogleLogin);
routerGmail.get('/users/google-auth/callback', authController.handleGoogleCallback);

export default routerGmail;
