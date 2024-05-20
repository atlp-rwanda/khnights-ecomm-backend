import { RequestHandler, Router } from 'express';

import { productStatus } from '../controllers/index';
import { hasRole } from '../middlewares/roleCheck';
import upload from '../middlewares/multer';
import { authMiddleware } from '../middlewares/verifyToken';

import {
  createProduct,
  updateProduct,
  removeProductImage,
  readProducts,
  readProduct,
  deleteProduct,
  getRecommendedProducts,
  listAllProducts,
  singleProduct,
} from '../controllers';
const router = Router();
router.get('/all', listAllProducts);
router.get('/recommended', authMiddleware as RequestHandler, hasRole('BUYER'), getRecommendedProducts);
router.get('/collection', authMiddleware as RequestHandler, hasRole('VENDOR'), readProducts);
router.get('/', authMiddleware as RequestHandler, hasRole('BUYER'), readProducts);
router.get('/:id', singleProduct);
router.get('/collection/:id', authMiddleware as RequestHandler, hasRole('VENDOR'), readProduct);
router.post('/', authMiddleware as RequestHandler, hasRole('VENDOR'), upload.array('images', 10), createProduct);
router.put('/:id', authMiddleware as RequestHandler, hasRole('VENDOR'), upload.array('images', 10), updateProduct);
router.delete('/images/:id', authMiddleware as RequestHandler, hasRole('VENDOR'), removeProductImage);
router.delete('/:id', authMiddleware as RequestHandler, hasRole('VENDOR'), deleteProduct);
router.put('/availability/:id', authMiddleware as RequestHandler, hasRole('VENDOR'), productStatus);

export default router;
