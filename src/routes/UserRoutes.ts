import { Router } from 'express';
import { userRegistration, userVerification} from '../controllers/index';

const router = Router();

router.post('/register', userRegistration);
router.get('/verify/:id', userVerification);

export default router;
