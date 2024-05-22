import { RequestHandler, Router } from 'express';
import {
  createCoupon,
  updateCoupon,
  accessAllCoupon,
  readCoupon,
  deleteCoupon,
  buyerApplyCoupon,
} from '../controllers/couponController';
import { hasRole } from '../middlewares/roleCheck';
import { authMiddleware } from '../middlewares/verifyToken';

const router = Router();

router.post('/vendor/:id', authMiddleware as RequestHandler, hasRole('VENDOR'), createCoupon);
router.put('/vendor/:id/update-coupon/:code', authMiddleware as RequestHandler, hasRole('VENDOR'), updateCoupon);
router.get('/vendor/:id/checkout/:code', authMiddleware as RequestHandler, hasRole('VENDOR'), readCoupon);
router.get('/vendor/:id/access-coupons', authMiddleware as RequestHandler, hasRole('VENDOR'), accessAllCoupon);
router.delete('/vendor/:id/checkout/delete', authMiddleware as RequestHandler, hasRole('VENDOR'), deleteCoupon);
router.post('/apply', authMiddleware as RequestHandler, hasRole('BUYER'), buyerApplyCoupon);

export default router;
