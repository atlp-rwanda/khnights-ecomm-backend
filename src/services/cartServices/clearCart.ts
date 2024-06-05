import { Request, Response } from 'express';
import { Cart } from '../../entities/Cart';
import { responseSuccess, responseError } from '../../utils/response.utils';
import { getRepository } from 'typeorm';

export const clearCartService = async (req: Request, res: Response) => {
  try {
    const cartRepository = getRepository(Cart);

    if (req.user) {
      const cart = await cartRepository.findOne({
        where: {
          user: {
            id: req.user.id,
          },
          isCheckedOut: false,
        },
        relations: ['items', 'items.product', 'user'],
      });

      if (!cart) {
        responseSuccess(res, 200, 'Cart is empty', { cart: [] });
        return;
      }

      await cartRepository.remove(cart as Cart);

      responseSuccess(res, 200, 'Cart cleared successfully', { cart: [] });
      return;
    }

    if (!req.user) {
      if (!req.cookies.cartId) {
        responseSuccess(res, 200, 'Cart is empty', { cart: [] });
        return;
      }

      const cart = await cartRepository.findOne({
        where: {
          id: req.cookies.cartId,
          isCheckedOut: false,
        },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        console.log(cart);
        
        responseSuccess(res, 200, 'Cart is empty', { cart: [] });
        return;
      }

      await cartRepository.remove(cart as Cart);

      responseSuccess(res, 200, 'Cart cleared successfully', { cart: [] });
      return;
    }
  } catch (error) {
    responseError(res, 400, (error as Error).message);
    return;
  }
};
