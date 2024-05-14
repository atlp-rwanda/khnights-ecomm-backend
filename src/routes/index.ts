import { Request, Response, Router } from 'express';
import { responseSuccess } from '../utils/response.utils';
import userRoutes from './UserRoutes';


const router = Router();

router.get('/', (req: Request, res: Response) => {
  return responseSuccess(res, 200, 'This is a testing route.');
});

router.use('/user', userRoutes);


export default router;
