import { Router } from 'express';
import { userRegistration, userVerification} from '../controllers/index';
import { login } from '../controllers/index';


const router = Router();

router.post('/register', userRegistration);
router.get('/verify/:id', userVerification);
router.post('/login', login);

export default router;
