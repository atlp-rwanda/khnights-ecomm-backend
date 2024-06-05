import { Request, Response } from 'express';
import { CartItem } from '../../entities/CartItem';
import { Cart } from '../../entities/Cart';
import { User } from '../../entities/User';
import { getRepository } from 'typeorm';
import { responseSuccess, responseError } from '../../utils/response.utils';

export const removeProductInCartService = async (req: Request, res: Response) => {
  try {
    const cartItemRepository = getRepository(CartItem);
    const cartRepository = getRepository(Cart);

    if (!req.params.id) {
      responseError(res, 400, 'Cart item id is required');
      return;
    }

    const cartItem = await cartItemRepository.findOne({
      where: {
        id: req.params.id,
      },
      relations: ['cart', 'cart.user'],
    });

    if (!cartItem) {
      responseError(res, 404, 'Cart item not found');
      return;
    }

    if (req.user) {
      if (cartItem?.cart.user.id !== req.user.id) {
        responseError(res, 401, 'You are not authorized to perform this action');
        return;
      }

      await cartItemRepository.remove(cartItem as CartItem);

      const cart = await cartRepository.findOne({
        where: {
          id: cartItem?.cart.id,
        },
        relations: ['items', 'items.product', 'user'],
      });

      if (cart) {
        if (cart.items.length === 0) {
          await cartRepository.remove(cart as Cart);

          responseSuccess(res, 200, 'cart removed successfully', { cart: [] });
          return;
        }

        cart.updateTotal();
        await cartRepository.save(cart as Cart);

        cart.user = cart?.user.id as unknown as User;

        responseSuccess(res, 200, 'Product removed from cart successfully', { cart });
        return;
      }
    }

    if (!req.user) {
      if (!req.params.id) {
        responseError(res, 400, 'Cart item id is required');
        return;
      }

      const cartItem = await cartItemRepository.findOne({
        where: {
          id: req.params.id,
        },
        relations: ['cart'],
      });

      if (!cartItem) {
        responseError(res, 404, 'Cart item not found');
        return;
      }

      await cartItemRepository.remove(cartItem);

      const cart = await cartRepository.findOne({
        where: {
          id: cartItem.cart.id,
        },
        relations: ['items', 'items.product'],
      });

      if (cart) {
        if (cart.items.length === 0) {
          await cartRepository.remove(cart);

          responseSuccess(res, 200, 'cart removed successfully', { cart: [] });
          return;
        }

        cart.updateTotal();
        await cartRepository.save(cart);

        responseSuccess(res, 200, 'Product removed from cart successfully', { cart });
        return;
      }
    }
  } catch (error) {
    responseError(res, 400, (error as Error).message);
    return;
  }
};
