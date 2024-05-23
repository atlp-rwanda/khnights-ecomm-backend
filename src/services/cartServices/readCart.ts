import { Request, Response } from 'express';
import { Cart } from '../../entities/Cart';
import { User } from '../../entities/User';
import { getRepository } from 'typeorm';
import { responseSuccess, responseError } from '../../utils/response.utils';

export const readCartService = async (req: Request, res: Response) => {
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

      cart.user = cart.user.id as unknown as User;
      responseSuccess(res, 200, 'Cart retrieved successfully', { cart });
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
        responseSuccess(res, 200, 'Cart is empty', { cart: [] });
        return;
      }

      responseSuccess(res, 200, 'Cart retrieved successfully', { cart });
      return;
    }
  } catch (error) {
    responseError(res, 400, (error as Error).message);
    return;
  }
};
