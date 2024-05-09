import { Request, Response, Router } from 'express';
import { responseSuccess } from '../utils/response.utils';
import userRoutes from './UserRoutes';
import productRoutes from './ProductRoutes';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  return responseSuccess(res, 200, 'This is a testing route.');
});

router.use('/user', userRoutes);
router.use('/product', productRoutes);

export default router;
