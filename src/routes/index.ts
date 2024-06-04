import { Request, Response, Router } from 'express';
import { responseSuccess } from '../utils/response.utils';
import userRoutes from './UserRoutes';
import productRoutes from './ProductRoutes';
import wishListRoutes from './wishListRoute';
import couponRoute from './couponRoutes';
import cartRoutes from './CartRoutes';
import feedbackRoute from './feedbackRoutes';
import notificationRoute from './NoficationRoutes'

const router = Router();

router.get('/', (req: Request, res: Response) => {
  return responseSuccess(res, 200, 'This is a testing route.');
});

router.use('/user', userRoutes);
router.use('/product', productRoutes);
router.use('/wish-list', wishListRoutes);
router.use('/cart', cartRoutes);
router.use('/coupons', couponRoute);
router.use('/feedback', feedbackRoute);
router.use('/notification', notificationRoute);

export default router;
