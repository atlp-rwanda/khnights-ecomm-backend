import { RequestHandler, Router } from 'express';

import { productStatus, searchProduct } from '../controllers/index';
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
  createOrder,
  getOrders,
  updateOrder,
  getOrdersHistory
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
router.post('/orders', authMiddleware as RequestHandler, hasRole('BUYER'), createOrder);
router.get('/client/orders', authMiddleware as RequestHandler, hasRole('BUYER'), getOrders);
router.put('/client/orders/:orderId', authMiddleware as RequestHandler, hasRole('BUYER'), updateOrder);
router.get('/orders/history', authMiddleware as RequestHandler, hasRole('BUYER'), getOrdersHistory);

export default router;
