import { Request, Response } from 'express';
import { CartItem } from '../../entities/CartItem';
import { Cart } from '../../entities/Cart';
import { Product } from '../../entities/Product';
import { User } from '../../entities/User';
import { getRepository } from 'typeorm';
import { validateCartItem } from '../../helper/cartItemValidator';
import { responseSuccess, responseError } from '../../utils/response.utils';

export const createCartService = async (req: Request, res: Response) => {
  try {
    const { error } = validateCartItem(req.body);
    if (error) {
      responseError(res, 400, error.details[0].message);
      return;
    }

    if (req.body.quantity < 1) {
      responseError(res, 400, 'Quantity must be greater than 0');
      return;
    }

    const product = await getRepository(Product).findOne({
      where: { id: req.body.productId },
    });

    if (!product) {
      responseError(res, 404, 'Product not found, try again.');
      return;
    }

    if (req.user) {
      const cartRepository = getRepository(Cart);
      const cartItemRepository = getRepository(CartItem);

      let cart = await cartRepository.findOne({
        where: {
          user: { id: req.user.id },
          isCheckedOut: false,
        },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        cart = new Cart();
        cart.user = req.user as User;
        await cartRepository.save(cart);
      }

      let cartItem = await cartItemRepository.findOne({
        where: {
          cart: { id: cart.id },
          product: { id: req.body.productId },
        },
      });

      if (cartItem) {
        cartItem.quantity = req.body.quantity;
        cartItem.newPrice = product.newPrice;
        await cartItemRepository.save(cartItem);
      } else {
        cartItem = new CartItem();
        cartItem.cart = cart;
        cartItem.product = product;
        cartItem.newPrice = product.newPrice;
        cartItem.quantity = req.body.quantity;
        await cartItemRepository.save(cartItem);
      }

      // Fetch the updated cart with items and user
      cart = await cartRepository.findOne({
        where: { id: cart.id },
        relations: ['items', 'items.product', 'user'],
      });

      if (cart) {
        // Update the total amount in the cart
        cart.updateTotal();
        await cartRepository.save(cart);

        const responseCart = {
          ...cart,
          user: cart?.user.id,
        };

        responseSuccess(res, 201, 'cart updated successfully', { cart: responseCart });
        return;
      }
    }

    if (!req.user) {
      // guest user
      const cartRepository = getRepository(Cart);
      const cartItemRepository = getRepository(CartItem);

      let cart;
      if (req.cookies.cartId) {
        cart = await cartRepository.findOne({
          where: {
            id: req.cookies?.cartId,
            isCheckedOut: false,
          },
          relations: ['items', 'items.product'],
        });
      }

      if (!cart) {
        cart = new Cart();
        await cartRepository.save(cart);
      }

      let cartItem = await cartItemRepository.findOne({
        where: {
          cart: { id: cart.id },
          product: { id: req.body.productId },
        },
      });

      if (cartItem) {
        cartItem.quantity = req.body.quantity;
        cartItem.newPrice = product.newPrice;
        await cartItemRepository.save(cartItem);
      } else {
        cartItem = new CartItem();
        cartItem.cart = cart;
        cartItem.product = product;
        cartItem.newPrice = product.newPrice;
        cartItem.quantity = req.body.quantity;
        await cartItemRepository.save(cartItem);
      }

      // Fetch the updated cart with items and user
      cart = await cartRepository.findOne({
        where: { id: cart.id },
        relations: ['items', 'items.product', 'user'],
      });

      if (cart) {
        // Update the total amount in the cart
        cart.updateTotal();
        await cartRepository.save(cart);

        res.cookie('cartId', cart.id);
        responseSuccess(res, 201, 'cart updated successfully', { cart });
        return;
      }
    }
  } catch (error) {
    responseError(res, 400, (error as Error).message);
    return;
  }
};
