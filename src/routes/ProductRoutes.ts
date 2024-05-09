import { Router } from 'express';

import upload from '../middlewares/multer';
import { authMiddleware } from '../middlewares/verifyToken';
import { hasRole } from '../middlewares';
import {
  createProduct,
  updateProduct,
  removeProductImage,
  readProducts,
  readProduct,
  deleteProduct,
} from '../controllers/productController';
import { checkUserStatus } from '../middlewares/isAllowed';

const router = Router();

router.get('/collection', authMiddleware, checkUserStatus, hasRole('VENDOR'), readProducts);
router.get('/collection/:id', authMiddleware, checkUserStatus, hasRole('VENDOR'), readProduct);
router.post('/', authMiddleware, checkUserStatus, hasRole('VENDOR'), upload.array('images', 10), createProduct);
router.put('/:id', authMiddleware, checkUserStatus, hasRole('VENDOR'), upload.array('images', 10), updateProduct);
router.delete('/images/:id', authMiddleware, checkUserStatus, hasRole('VENDOR'), removeProductImage);
router.delete('/:id', authMiddleware, checkUserStatus, hasRole('VENDOR'), deleteProduct);

export default router;
