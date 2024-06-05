import { Request, Response } from 'express';
import { getRepository, getManager } from 'typeorm';
import { Order } from '../../entities/Order';
import { OrderItem } from '../../entities/OrderItem';
import { Product } from '../../entities/Product';
import { User } from '../../entities/User';
import { Cart } from '../../entities/Cart';
import { Transaction } from '../../entities/transaction';
import { responseError, sendErrorResponse, sendSuccessResponse } from '../../utils/response.utils';
import sendMail from '../../utils/sendOrderMail';

export const createOrderService = async (req: Request, res: Response) => {
  const { cartId, address } = req.body;
  const buyerId = req.user?.id;

  try {
    const userRepository = getRepository(User);
    const productRepository = getRepository(Product);
    const cartRepository = getRepository(Cart);

    const buyer = await userRepository.findOne({ where: { id: buyerId } });
    if (!buyer) {
      return responseError(res, 404, 'Buyer not found');
    }

    const cart = await cartRepository.findOne({
      where: {
        user: {
          id: buyerId,
        },
        isCheckedOut: false,
      },
      relations: ['items', 'items.product', 'user'],
    });

    if (!cart || cart.items.length === 0) {
      return sendErrorResponse(res, 400, 'Cart is empty or already checked out');
    }

    let totalPrice = 0;
    const orderItems: OrderItem[] = [];

    for (const item of cart.items) {
      const product = item.product;

      if (product.quantity < item.quantity) {
        return sendErrorResponse(res, 400, `Not enough ${product.name} in stock`);
      }

      totalPrice += product.newPrice * item.quantity;
      product.quantity -= item.quantity;

      const orderItem = new OrderItem();
      orderItem.product = product;
      orderItem.price = product.newPrice;
      orderItem.quantity = item.quantity;
      orderItems.push(orderItem);
    }

    if (!buyer.accountBalance || buyer.accountBalance < totalPrice) {
      return sendErrorResponse(res, 400, 'Not enough funds to perform this transaction');
    }

    const previousBalance = buyer.accountBalance;
    buyer.accountBalance -= totalPrice;
    const currentBalance = buyer.accountBalance;

    const newOrder = new Order();
    newOrder.buyer = buyer;
    newOrder.totalPrice = totalPrice;
    newOrder.orderItems = orderItems;
    newOrder.quantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    newOrder.orderDate = new Date();
    newOrder.address = `${address.country}, ${address.city}, ${address.street}`;

    await getManager().transaction(async transactionalEntityManager => {
      for (const item of cart.items) {
        const product = item.product;
        product.quantity -= item.quantity;
        await transactionalEntityManager.save(Product, product);
      }

      await transactionalEntityManager.save(User, buyer);

      await transactionalEntityManager.save(Order, newOrder);
      for (const orderItem of orderItems) {
        orderItem.order = newOrder;
        await transactionalEntityManager.save(OrderItem, orderItem);
      }

      const orderTransaction = new Transaction();
      orderTransaction.user = buyer;
      orderTransaction.order = newOrder;
      orderTransaction.amount = totalPrice;
      orderTransaction.previousBalance = previousBalance;
      orderTransaction.currentBalance = currentBalance;
      orderTransaction.type = 'debit';
      orderTransaction.description = 'Purchase of products';
      await transactionalEntityManager.save(Transaction, orderTransaction);

      cart.isCheckedOut = true;
      await transactionalEntityManager.save(Cart, cart);
    });

    const orderResponse = {
      fullName: `${newOrder.buyer.firstName} ${newOrder.buyer.lastName}`,
      email: newOrder.buyer.email,
      products: orderItems.map(item => ({
        name: item.product.name,
        newPrice: item.price,
        quantity: item.quantity,
      })),
      totalAmount: newOrder.totalPrice,
      quantity: newOrder.quantity,
      orderDate: newOrder.orderDate,
      address: newOrder.address,
    };

    const message = {
      subject: 'Order created successfully',
      ...orderResponse
    };

    await sendMail(message);

    return sendSuccessResponse(res, 201, 'Order created successfully', orderResponse);
  } catch (error) {
    console.error('Error creating order:', error);
    return sendErrorResponse(res, 500, (error as Error).message);
  }
};