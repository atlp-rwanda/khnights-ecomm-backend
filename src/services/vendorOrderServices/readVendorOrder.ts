import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { responseSuccess, responseError } from '../../utils/response.utils';
import { VendorOrderItem } from '../../entities/VendorOrderItem';
import { VendorOrders } from '../../entities/vendorOrders';

export const getVendorOrdersService = async (req: Request, res: Response) => {
  try {
    const vendorOrderRepository = getRepository(VendorOrders);
    const vendorId = req.user?.id;

    const vendorOrders = await vendorOrderRepository.find({
      where: {
        vendor: {
          id: vendorId,
        },
      },
      relations: ['vendor', 'order.buyer', 'vendorOrderItems', 'vendorOrderItems.product'],
      order: {
        createdAt: 'DESC', // Order by creation date, most recent first
      },
    });

    if (!vendorOrders.length) {
      return responseError(res, 200, `You don't have any pending orders from buyer`, { orders: [] });
    }

    const sanitizedOrderResponse = vendorOrders.map(order => ({
      id: order.id,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
      address: order.order.address,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      vendor: {
        id: order.vendor.id,
        firstName: order.vendor.firstName,
        lastName: order.vendor.lastName,
        email: order.vendor.email,
        gender: order.vendor.gender,
        phoneNumber: order.vendor.phoneNumber,
        photoUrl: order.vendor.photoUrl,
      },
      buyer: {
        id: order.order.buyer.id,
        firstName: order.order.buyer.firstName,
        lastName: order.order.buyer.lastName,
        email: order.order.buyer.email,
        gender: order.order.buyer.gender,
        phoneNumber: order.order.buyer.phoneNumber,
        photoUrl: order.order.buyer.photoUrl,
      },
      vendorOrderItems: order.vendorOrderItems,
    }));
    responseSuccess(res, 200, 'Orders retrieved successfully', {
      orders: sanitizedOrderResponse,
    });
  } catch (error) {
    return responseError(res, 400, (error as Error).message);
  }
};

// Get single vendor order info
export const getSingleVendorOrderService = async (req: Request, res: Response) => {
  try {
    const vendorOrderId = req.params.id;

    const vendorOrderRepository = getRepository(VendorOrders);
    const vendorId = req.user?.id;

    const vendorOrder = await vendorOrderRepository.findOne({
      where: {
        id: vendorOrderId,
        vendor: {
          id: vendorId,
        },
      },
      relations: ['vendor', 'order.buyer', 'vendorOrderItems', 'vendorOrderItems.product'],
    });

    if (!vendorOrder) {
      return responseError(res, 404, `Order Not Found.`);
    }

    const sanitizedOrderResponse = {
      id: vendorOrder.id,
      totalPrice: vendorOrder.totalPrice,
      orderStatus: vendorOrder.orderStatus,
      address: vendorOrder.order.address,
      createdAt: vendorOrder.createdAt,
      updatedAt: vendorOrder.updatedAt,
      vendor: {
        id: vendorOrder.vendor.id,
        firstName: vendorOrder.vendor.firstName,
        lastName: vendorOrder.vendor.lastName,
        email: vendorOrder.vendor.email,
        gender: vendorOrder.vendor.gender,
        phoneNumber: vendorOrder.vendor.phoneNumber,
        photoUrl: vendorOrder.vendor.photoUrl,
      },
      buyer: {
        id: vendorOrder.order.buyer.id,
        firstName: vendorOrder.order.buyer.firstName,
        lastName: vendorOrder.order.buyer.lastName,
        email: vendorOrder.order.buyer.email,
        gender: vendorOrder.order.buyer.gender,
        phoneNumber: vendorOrder.order.buyer.phoneNumber,
        photoUrl: vendorOrder.order.buyer.photoUrl,
      },
      vendorOrderItems: vendorOrder.vendorOrderItems,
    };

    responseSuccess(res, 200, 'Order retrieved successfully', {
      order: sanitizedOrderResponse,
    });
  } catch (error) {
    return responseError(res, 400, (error as Error).message);
  }
};
