import { Router } from 'express';
import { UserController } from '../controllers/index';
import { login } from '../controllers/signinAndLogout';

const { registerUser } = UserController;

const router = Router();

router.post('/register', registerUser);
router.post('/login', login);

export default router;
