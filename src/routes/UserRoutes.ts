import {  Router } from 'express';
import { UserController } from '../controllers/index';


const { registerUser } = UserController;

const router = Router();

router.post('/register', registerUser);

export default router;
