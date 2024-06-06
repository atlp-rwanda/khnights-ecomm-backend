import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { responseSuccess, responseError } from '../../utils/response.utils';
import { Order } from '../../entities/Order';
import { OrderItem } from '../../entities/OrderItem';

// Example usage:

export const getOrdersService = async (req: Request, res: Response) => {
  try {
    const orderRepository = getRepository(Order);
    const buyerId = req.user?.id;

    const orders = await orderRepository.find({
      where: {
        buyer: {
          id: buyerId,
        },
      },
      relations: ['buyer', 'orderItems', 'orderItems.product'],
      order: {
        createdAt: 'DESC', // Order by creation date, most recent first
      },
    });

    if (!orders || orders.length === 0) {
      return responseSuccess(res, 404, `You haven't made any orders yet`, { orders: [] });
    }

    const sanitezedResponse = orders.map(order => ({
      id: order.id,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
      quantity: order.quantity,
      address: order.address,
      orderDate: order.orderDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      buyer: {
        id: order.buyer.id,
        firstName: order.buyer.firstName,
        lastName: order.buyer.lastName,
        accountBalance: order.buyer.accountBalance,
      },
      orderItems: order.orderItems.map((item: OrderItem) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          images: item.product.images,
          price: item.product.newPrice,
          expirationDate: item.product.expirationDate,
        },
      })),
    }));
    responseSuccess(res, 200, 'Orders retrieved successfully', { orders: sanitezedResponse });
  } catch (error) {
    return responseError(res, 400, (error as Error).message);
  }
};

export const getOrderService = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId;
    const orderRepository = getRepository(Order);
    const buyerId = req.user?.id;

    const order = await orderRepository.findOne({
      where: {
        id: orderId,
        buyer: {
          id: buyerId,
        },
      },
      relations: ['buyer', 'orderItems', 'orderItems.product']
    });

    if (!order) {
      return responseSuccess(res, 404, `Order not found.`);
    }

    const sanitizedResponse = {
      id: order.id,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
      quantity: order.quantity,
      address: order.address,
      orderDate: order.orderDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      buyer: {
        id: order.buyer.id,
        firstName: order.buyer.firstName,
        lastName: order.buyer.lastName,
        accountBalance: order.buyer.accountBalance,
      },
      orderItems: order.orderItems.map((item: OrderItem) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          images: item.product.images,
          price: item.product.newPrice,
          expirationDate: item.product.expirationDate,
        },
      })),
    };

    responseSuccess(res, 200, 'Order retrieved successfully', { order: sanitizedResponse });
  } catch (error) {
    return responseError(res, 400, (error as Error).message);
  }
};