import { Request, Response, Router } from 'express';
import userRoutes from './UserRoutes';
import { responseSuccess } from '../utils/response.utils';

const router = Router();

router.get('/api/v1/status', (req: Request, res: Response) => {
  return responseSuccess(res, 202, 'This is a testing route that returns: 201');
});

router.use('/user', userRoutes);

export default router;