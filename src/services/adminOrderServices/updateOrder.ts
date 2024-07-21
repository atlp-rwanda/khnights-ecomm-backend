import { Request, Response } from 'express';
import { Not, getRepository } from 'typeorm';
import { responseSuccess, responseError } from '../../utils/response.utils';
import { VendorOrderItem } from '../../entities/VendorOrderItem';
import { VendorOrders } from '../../entities/vendorOrders';
import { Order } from '../../entities/Order';
import { getIO } from '../../utils/socket';
import { sendNotification } from '../../utils/sendNotification';

export const updateBuyerVendorOrderService = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;

    const vendorOrderRepository = getRepository(VendorOrders);
    const orderRepository = getRepository(Order);

    const order = await orderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: ['buyer', 'orderItems'],
    });

    if (!order) {
      return responseError(res, 404, `Order Not Found.`);
    }

    if (order.orderStatus === 'completed') {
      return responseError(res, 409, 'The order has already been completed.');
    }

    if (order.orderStatus !== 'received') {
      return responseError(res, 409, 'Order closure failed: The buyer has not received the item yet.');
    }

    const vendorOrders = await vendorOrderRepository.find({
      where: {
        order: {
          id: order.id,
        },
      },
      relations: ['vendor', 'vendorOrderItems', 'vendorOrderItems.product'],
    });

    for (const order of vendorOrders) {
      if (order.orderStatus !== 'delivered') {
        return responseError(res, 409, 'Order closure failed: Some vendors have not yet delivered items to the buyer.');
      }
    }

    // Update Whole Order

    order.orderStatus = 'completed';
    await orderRepository.save(order);

    await sendNotification({
      content: 'Your order was marked completed',
      type: 'order',
      user: order.buyer,
      link: `/orders/${order.id}`,
    });

    const updatedVendorOrder = vendorOrders.map(async vendorOrder => {
      vendorOrder.orderStatus = 'completed';
      await vendorOrderRepository.save(vendorOrder);

      await sendNotification({
        content: `Order from buyer "${order.buyer.firstName} ${order.buyer.lastName}" has been marked completed`,
        type: 'order',
        user: vendorOrder.vendor,
        link: `/vendor/dashboard/orders/${order.id}`,
      });
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

    getIO().emit('orders', {
      action: 'admin update',
      order: sanitizedOrderResponse,
    });

    responseSuccess(res, 200, 'Order updated successfully', {
      order: sanitizedOrderResponse,
    });
  } catch (error) {
    return responseError(res, 400, (error as Error).message);
  }
};
