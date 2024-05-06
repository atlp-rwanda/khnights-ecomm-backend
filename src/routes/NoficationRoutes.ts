import { RequestHandler, Router } from 'express';
import { authMiddleware } from '../middlewares/verifyToken';
import { getAllNotifications, updateNotifications, deleteSelectedNotifications, deleteAllNotifications, updateAllNotifications } from '../controllers/notificationControllers';

const router = Router();

router.get('/', authMiddleware as RequestHandler, getAllNotifications);

router.put('/', authMiddleware as RequestHandler, updateNotifications);

router.put('/all', authMiddleware as RequestHandler, updateAllNotifications);

router.delete('/', authMiddleware as RequestHandler, deleteSelectedNotifications);

router.delete('/all', authMiddleware as RequestHandler, deleteAllNotifications);

export default router;