import { RequestHandler, Router } from 'express';
import { chatBotController } from '../controllers/chatBotController';
import { optinalAuthMiddleware } from '../middlewares/optionalAuthorization';

const router = Router();

router.post('/', optinalAuthMiddleware as RequestHandler, chatBotController);


export default router;
