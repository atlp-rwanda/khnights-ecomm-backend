import { Request, Response, Router } from 'express';
import { responseSuccess } from '../utils/response.utils';
import userRoutes from './UserRoutes';
import productRoutes from './ProductRoutes';
import wishListRoutes from './wishListRoute'

const router = Router();

router.get('/', (req: Request, res: Response) => {
  return responseSuccess(res, 200, 'This is a testing route.');
});

router.use('/user', userRoutes);
router.use('/product', productRoutes);
router.use('/wish-list',wishListRoutes);

export default router;
