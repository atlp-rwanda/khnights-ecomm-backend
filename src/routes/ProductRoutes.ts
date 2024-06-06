import { RequestHandler, Router } from 'express';

import { productStatus, searchProduct, } from '../controllers/index';
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
  getOrders, getOrder,
  updateOrder,
  getOrdersHistory,Payment,
  getSingleVendorOrder,
  getVendorOrders,
  updateVendorOrder,
  getBuyerVendorOrders,
  getSingleBuyerVendorOrder,
  updateBuyerVendorOrder,
} from '../controllers';
const router = Router();

router.get('/search', searchProduct);
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
router.get('/client/orders/:orderId', authMiddleware as RequestHandler, hasRole('BUYER'), getOrder);
router.put('/client/orders/:orderId', authMiddleware as RequestHandler, hasRole('BUYER'), updateOrder);
router.get('/orders/history', authMiddleware as RequestHandler, hasRole('BUYER'), getOrdersHistory);

// Vendor order management
router.get('/vendor/orders', authMiddleware as RequestHandler, hasRole('VENDOR'), getVendorOrders);
router.get('/vendor/orders/:id', authMiddleware as RequestHandler, hasRole('VENDOR'), getSingleVendorOrder);
router.put('/vendor/orders/:id', authMiddleware as RequestHandler, hasRole('VENDOR'), updateVendorOrder);

// Admin order management
router.get('/admin/orders', authMiddleware as RequestHandler, hasRole('ADMIN'), getBuyerVendorOrders);
router.get('/admin/orders/:id', authMiddleware as RequestHandler, hasRole('ADMIN'), getSingleBuyerVendorOrder);
router.put('/admin/orders/:id', authMiddleware as RequestHandler, hasRole('ADMIN'), updateBuyerVendorOrder);
router.post('/payment/:id', authMiddleware as RequestHandler, hasRole('BUYER'), Payment);


export default router;
