import {  Router } from 'express';
import { registerUser } from '../controllers/index';


const router = Router();

router.post('/register', registerUser);

export default router;