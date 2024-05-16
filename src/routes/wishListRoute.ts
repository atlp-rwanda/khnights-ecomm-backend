import { Router } from 'express';
import { authMiddleware } from '../middlewares/verifyToken';
import { hasRole } from '../middlewares';
import { checkUserStatus } from '../middlewares/isAllowed';
import { wishlistAddProduct,wishlistRemoveProduct,wishlistGetProducts,wishlistClearAllProducts } from '../controllers/wishListController';

const router = Router();

router.post('/add/:id', authMiddleware, checkUserStatus, hasRole('BUYER'), wishlistAddProduct);
router.get('/',authMiddleware, checkUserStatus, hasRole('BUYER'),wishlistGetProducts);
router.delete('/delete/:id',authMiddleware, checkUserStatus, hasRole('BUYER'),wishlistRemoveProduct);
router.delete('/clearAll',authMiddleware, checkUserStatus, hasRole('BUYER'),wishlistClearAllProducts);

export default router;