import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { responseSuccess, responseError } from '../../utils/response.utils';
import { VendorOrderItem } from '../../entities/VendorOrderItem';
import { VendorOrders } from '../../entities/vendorOrders';
import { Order } from '../../entities/Order';

export const getBuyerVendorOrdersService = async (req: Request, res: Response) => {
  try {
    const vendorOrderRepository = getRepository(VendorOrders);
    const orderRepository = getRepository(Order);

    const orders = await orderRepository.find({
      relations: ['buyer', 'orderItems'],
      order: {
        createdAt: 'DESC', // Order by creation date, most recent first
      },
    });

    if (!orders.length) {
      return responseError(res, 200, `There is no pending orders from buyer`, { orders: [] });
    }

    const sanitizedOrdersResponse = [];

    for (const order of orders) {
      const vendorOrders = await vendorOrderRepository.find({
        where: {
          order: {
            id: order.id,
          },
        },
        relations: ['vendor', 'vendorOrderItems', 'vendorOrderItems.product'],
        order: {
          createdAt: 'DESC', // Order by creation date, most recent first
        },
      });

      sanitizedOrdersResponse.push({
        id: order.id,
        totalPrice: order.totalPrice,
        totalProducts: order.orderItems.length,
        orderStatus: order.orderStatus,
        address: order.address,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        buyer: {
          id: order.buyer.id,
          firstName: order.buyer.firstName,
          lastName: order.buyer.lastName,
          email: order.buyer.lastName,
          gender: order.buyer.gender,
          phoneNumber: order.buyer.phoneNumber,
          photoUrl: order.buyer.photoUrl,
        },
        vendors: vendorOrders.map(vendoOrder => ({
          id: vendoOrder.vendor.id,
          firstName: vendoOrder.vendor.firstName,
          lastName: vendoOrder.vendor.lastName,
          email: vendoOrder.vendor.lastName,
          gender: vendoOrder.vendor.gender,
          phoneNumber: vendoOrder.vendor.phoneNumber,
          photoUrl: vendoOrder.vendor.photoUrl,
          order: {
            id: vendoOrder.id,
            totalPrice: vendoOrder.totalPrice,
            orderStatus: vendoOrder.orderStatus,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            orderItems: vendoOrder.vendorOrderItems,
          },
        })),
      });
    }

    responseSuccess(res, 200, 'Orders retrieved successfully', {
      totalOrders: orders.length,
      orders: sanitizedOrdersResponse,
    });
  } catch (error) {
    return responseError(res, 400, (error as Error).message);
  }
};

// Get single vendor order info
export const getSingleBuyerVendorOrderService = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;

    const vendorOrderRepository = getRepository(VendorOrders);
    const orderRepository = getRepository(Order);

    const order = await orderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: ['buyer', 'orderItems'],
      order: {
        createdAt: 'DESC', // Order by creation date, most recent first
      },
    });

    if (!order) {
      return responseError(res, 404, `Order Not Found.`);
    }

    const vendorOrders = await vendorOrderRepository.find({
      where: {
        order: {
          id: order.id,
        },
      },
      relations: ['vendor', 'vendorOrderItems', 'vendorOrderItems.product'],
    });

    const sanitizedOrderResponse = {
      id: order.id,
      totalPrice: order.totalPrice,
      totalProducts: order.orderItems.length,
      orderStatus: order.orderStatus,
      address: order.address,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      buyer: {
        id: order.buyer.id,
        firstName: order.buyer.firstName,
        lastName: order.buyer.lastName,
        email: order.buyer.lastName,
        gender: order.buyer.gender,
        phoneNumber: order.buyer.phoneNumber,
        photoUrl: order.buyer.photoUrl,
      },
      vendors: vendorOrders.map(vendoOrder => ({
        id: vendoOrder.vendor.id,
        firstName: vendoOrder.vendor.firstName,
        lastName: vendoOrder.vendor.lastName,
        email: vendoOrder.vendor.lastName,
        gender: vendoOrder.vendor.gender,
        phoneNumber: vendoOrder.vendor.phoneNumber,
        photoUrl: vendoOrder.vendor.photoUrl,
        order: {
          id: vendoOrder.id,
          totalPrice: vendoOrder.totalPrice,
          orderStatus: vendoOrder.orderStatus,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          orderItems: vendoOrder.vendorOrderItems,
        },
      })),
    };

    responseSuccess(res, 200, 'Order retrieved successfully', {
      order: sanitizedOrderResponse,
    });
  } catch (error) {
    return responseError(res, 400, (error as Error).message);
  }
};
