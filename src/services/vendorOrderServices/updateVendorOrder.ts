import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { OrderItem } from '../../entities/OrderItem';
import { responseError, responseSuccess } from '../../utils/response.utils';
import sendMail from '../../utils/sendOrderMail';
import { VendorOrders } from '../../entities/vendorOrders';
import { getIO } from '../../utils/socket';

export const updateVendorOrderService = async (req: Request, res: Response) => {
  try {
    const vendorOrderId = req.params.id;
    const { orderStatus } = req.body;
    if (
      !['pending', 'is-accepted', 'in-transit', 'cancelled', 'delivered'].includes(
        (orderStatus as string).toLowerCase()
      )
    ) {
      return responseError(res, 400, `Please provide one of defined statuses.`);
    }

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

    // Check if order can be updated
    if (['delivered', 'cancelled', 'completed'].includes(vendorOrder.orderStatus)) {
      return responseError(res, 409, `Order cannot be updated once it is marked as ${vendorOrder.orderStatus}`);
    }

    vendorOrder.orderStatus = (orderStatus as string).toLowerCase();

    // Save updated order status
    const updatedVendorOrder = await vendorOrderRepository.save(vendorOrder);

    const sanitizedOrderResponse = {
      id: updatedVendorOrder.id,
      totalPrice: updatedVendorOrder.totalPrice,
      orderStatus: updatedVendorOrder.orderStatus,
      address: updatedVendorOrder.order.address,
      createdAt: updatedVendorOrder.createdAt,
      updatedAt: updatedVendorOrder.updatedAt,
      vendor: {
        id: updatedVendorOrder.vendor.id,
        firstName: updatedVendorOrder.vendor.firstName,
        lastName: updatedVendorOrder.vendor.lastName,
        email: updatedVendorOrder.vendor.email,
        gender: updatedVendorOrder.vendor.gender,
        phoneNumber: updatedVendorOrder.vendor.phoneNumber,
        photoUrl: updatedVendorOrder.vendor.photoUrl,
      },
      buyer: {
        id: updatedVendorOrder.order.buyer.id,
        firstName: updatedVendorOrder.order.buyer.firstName,
        lastName: updatedVendorOrder.order.buyer.lastName,
        email: updatedVendorOrder.order.buyer.lastName,
        gender: updatedVendorOrder.order.buyer.gender,
        phoneNumber: updatedVendorOrder.order.buyer.phoneNumber,
        photoUrl: updatedVendorOrder.order.buyer.photoUrl,
      },
      vendorOrderItems: updatedVendorOrder.vendorOrderItems,
    };

    getIO().emit('orders', {
      action: 'vendor update',
      order: sanitizedOrderResponse,
    });

    return responseSuccess(res, 200, 'Order updated successfully', {
      order: sanitizedOrderResponse,
    });
  } catch (error) {
    return responseError(res, 400, (error as Error).message);
  }
};
