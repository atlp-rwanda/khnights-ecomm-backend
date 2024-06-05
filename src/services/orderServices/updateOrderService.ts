import { Request, Response } from 'express';
import { getManager, EntityManager, Repository, getRepository } from 'typeorm';
import { Order } from '../../entities/Order';
import { Product } from '../../entities/Product';
import { User } from '../../entities/User';
import { OrderItem } from '../../entities/OrderItem';
import { Transaction } from '../../entities/transaction';
import { responseError, sendErrorResponse, sendSuccessResponse } from '../../utils/response.utils';
import sendMail from '../../utils/sendOrderMailUpdated';
import { sendNotification } from '../../utils/sendNotification';
import { VendorOrders } from '../../entities/vendorOrders';
interface OrderStatusType {
  orderStatus:
    | 'order placed'
    | 'cancelled'
    | 'awaiting shipment'
    | 'in transit'
    | 'delivered'
    | 'received'
    | 'returned';
}
export const updateOrderService = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { orderStatus } = <OrderStatusType>req.body;

  try {
    await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
      const orderRepository: Repository<Order> = transactionalEntityManager.getRepository(Order);
      const productRepository: Repository<Product> = transactionalEntityManager.getRepository(Product);
      const userRepository: Repository<User> = transactionalEntityManager.getRepository(User);
      const orderItemRepository: Repository<OrderItem> = transactionalEntityManager.getRepository(OrderItem);
      const transactionRepository: Repository<Transaction> = transactionalEntityManager.getRepository(Transaction);

      const buyerId = req.user?.id;
      if (!buyerId) {
        throw new Error('Unauthorized');
      }

      // Fetch order and related entities
      const order: Order | null = await orderRepository.findOne({
        where: { id: orderId, buyer: { id: buyerId } },
        relations: ['orderItems', 'orderItems.product', 'buyer'],
      });

      if (!order) {
        return sendErrorResponse(res, 404, 'Order not found');
      }
      // Check if order can be updated
      if (isOrderFinalStatus(order.orderStatus)) {
        return sendErrorResponse(res, 401, `Order cannot be updated once it is ${order.orderStatus}`);
      }

      // Handle order status transitions
      if (orderStatus !== undefined && order.orderStatus !== orderStatus) {
        switch (orderStatus) {
          case 'cancelled':
          case 'returned':
            if (order.orderStatus !== 'delivered') {
              await processRefund(order, transactionalEntityManager);
            }
            break;
          default:
            break;
        }

        order.orderStatus = orderStatus;
      }

      // Save updated order status
      await orderRepository.save(order);
      
      if (orderStatus === 'received') {
        const admins = await getRepository(User).find({
          where: {
            role: 'ADMIN'
          }
        });
        
        admins.forEach( async (admin) => {
          await sendNotification({
            content: `The Buyer named "${order.buyer.firstName} ${order.buyer.lastName}", has confirmed that they have successfully received their order.`,
            type: 'order',
            user: admin,
            link: `/product/admin/orders/${order.id}`
          });
        });
      }

      const vendorOrders = await getRepository(VendorOrders).find({
        where: {
          order: {
            id: order.id
          }
        },
        relations: {
          vendor: true
        }
      });

      vendorOrders.forEach(async (vendorOrder) => {
        await sendNotification({
          content: `The Buyer named "${order.buyer.firstName} ${order.buyer.lastName}", has marked their order as "${orderStatus}". Please ensure that you update the order status on your side as well.`,
          type: 'order',
          user: vendorOrder.vendor,
          link: `/product/vendor/orders/${vendorOrder.id}`
        });
      });

      // Prepare response data
      const orderResponse = {
        fullName: `${order.buyer.firstName} ${order.buyer.lastName}`,
        email: order.buyer.email,
        products: order.orderItems.map((item: OrderItem) => ({
          name: item.product.name,
          newPrice: item.price,
          quantity: item.quantity,
        })),
        totalAmount: order.totalPrice,
        quantity: order.quantity,
        orderDate: order.orderDate,
        address: order.address,
      };

      // Send email notification
      const message = {
        subject: 'Order updated successfully',
        ...orderResponse,
      };
      await sendMail(message);

      // Respond with success
      return sendSuccessResponse(res, 200, 'Order updated successfully', orderResponse);
    });
  } catch (error) {
    console.error('Error updating order:', (error as Error).message);
    return sendErrorResponse(res, 500, (error as Error).message);
  }
};

async function processRefund (order: Order, entityManager: EntityManager) {
  const buyer = order.buyer;

  // Refund buyer
  await entityManager.save(buyer);

  // Record refund transaction
  const refundTransaction = new Transaction();
  refundTransaction.user = buyer;
  refundTransaction.order = order;
  refundTransaction.amount = order.totalPrice;
  refundTransaction.type = 'credit';
  refundTransaction.description = 'Refund for cancelled or returned order';
  await entityManager.save(refundTransaction);

  // Return products to store
  for (const orderItem of order.orderItems) {
    const product = orderItem.product;
    product.quantity += orderItem.quantity;
    await entityManager.save(product);
  }

  // Clear order details
  order.orderItems = [];
  order.totalPrice = 0;
  order.quantity = 0;
}

function isOrderFinalStatus (status: string): boolean {
  return ['cancelled', 'delivered', 'returned', 'completed'].includes(status);
}