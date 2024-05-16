import { RequestHandler, Router } from 'express';
import { createCart, readCart, removeProductInCart, clearCart } from '../controllers/cartController';
import { optinalAuthMiddleware } from '../middlewares/optionalAuthorization';

const router = Router();

router.post('/', optinalAuthMiddleware as RequestHandler, createCart);
router.get('/', optinalAuthMiddleware as RequestHandler, readCart);
router.delete('/:id', optinalAuthMiddleware as RequestHandler, removeProductInCart);
router.delete('/', optinalAuthMiddleware as RequestHandler, clearCart);

export default router;
