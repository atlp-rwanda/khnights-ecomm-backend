import { Request, RequestHandler, Response, Router } from 'express';
import { responseServerError, responseSuccess } from '../utils/response.utils';
import userRoutes from './UserRoutes';
import productRoutes from './ProductRoutes';
import wishListRoutes from './wishListRoute';
import couponRoute from './couponRoutes';
import cartRoutes from './CartRoutes';
import notificationRoute from './NoficationRoutes'
import feedbackRoute from './feedbackRoutes';
import { authMiddleware } from '../middlewares/verifyToken';

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

// ROUTES FOR TESTING PURPOSE
router.get('/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Route works!' });
});
router.post('/test/posting', (req: Request, res: Response) =>{
  return responseSuccess(res, 200, req.body);
});

router.get('/test/secure', authMiddleware as RequestHandler, (req: Request, res: Response) =>{
  responseSuccess(res, 200, 'This is a secured route.');
});

router.get('/test/error', (req: Request, res: Response) => {
  responseServerError(res, 'This is server error route.');
});
router.use('/feedback', feedbackRoute);
router.use('/notification', notificationRoute);

// ROUTES FOR TESTING PURPOSE
router.get('/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Route works!' });
});
router.post('/test/posting', (req: Request, res: Response) =>{
  return responseSuccess(res, 200, req.body);
});

router.get('/test/secure', authMiddleware as RequestHandler, (req: Request, res: Response) =>{
  responseSuccess(res, 200, 'This is a secured route.');
});

router.get('/test/error', (req: Request, res: Response) => {
  responseServerError(res, 'This is server error route.');
});

export default router;