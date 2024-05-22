import { RequestHandler, Router } from 'express';
import {
    createFeedback,
    updateFeedback,
    deleteFeedback,
    adminDeleteFeedback
} from '../controllers/feedbackController'
import { authMiddleware } from '../middlewares/verifyToken';
import { hasRole } from '../middlewares/roleCheck';


const router = Router();

router.post('/:productId/new', authMiddleware as RequestHandler, hasRole('BUYER'), createFeedback);
router.put('/update/:feedbackId', authMiddleware as RequestHandler, hasRole('BUYER'), updateFeedback );
router.delete('/delete/:feedbackId', authMiddleware as RequestHandler, hasRole('BUYER'), deleteFeedback);
router.delete('/admin/delete/:feedbackId', authMiddleware as RequestHandler, hasRole('ADMIN'), adminDeleteFeedback );

export default router;
