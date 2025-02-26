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
import { VendorOrders } from '../../entities/vendorOrders';
import { CartItem } from '../../entities/CartItem';
import { VendorOrderItem } from '../../entities/VendorOrderItem';
import { sendNotification } from '../../utils/sendNotification';

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
    const newOrder = new Order();
    newOrder.buyer = buyer;
    newOrder.totalPrice = totalPrice;
    newOrder.orderItems = orderItems;
    newOrder.quantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    newOrder.orderDate = new Date();
    newOrder.address = `${address.country}, ${address.city}, ${address.street}`;
    newOrder.cartId = cart.id;

    await getManager().transaction(async transactionalEntityManager => {
      for (const item of cart.items) {
        const product = item.product;
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
      orderTransaction.type = 'debit';
      orderTransaction.description = 'Purchase of products';
      await transactionalEntityManager.save(Transaction, orderTransaction);

      cart.isCheckedOut = true;
      await transactionalEntityManager.save(Cart, cart);
    });

    const orderResponse = {
      id: newOrder.id,
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
      cartId: newOrder.cartId
    };

    const message = {
      subject: 'Order created successfully',
      ...orderResponse,
    };

    await sendMail(message);

    // separate order by each vendor getting order related to his products
    await saveVendorRelatedOrder(newOrder, cart.items);

    return sendSuccessResponse(res, 201, 'Order created successfully', orderResponse);
  } catch (error) {
    return sendErrorResponse(res, 500, (error as Error).message);
  }
};

const saveVendorRelatedOrder = async (order: Order, CartItem: CartItem[]) => {
  try {
    for (const item of CartItem) {
      const productRepository = getRepository(Product);
      let sendNotif: boolean = false

      const product = await productRepository.findOne({
        where: {
          id: item.product.id,
        },
        relations: ['vendor'],
      });

      if (!product) return;

      const orderItem = new VendorOrderItem();
      orderItem.product = product;
      orderItem['price/unit'] = product.newPrice;
      orderItem.quantity = item.quantity;

      const vendorOrdersRepository = getRepository(VendorOrders);
      let vendorOrders = await vendorOrdersRepository.findOne({
        where: {
          vendor: {
            id: product.vendor.id,
          },
          order: {
            id: order.id,
          },
        },
        relations: ['vendorOrderItems'],
      });

      if (vendorOrders) {
        vendorOrders.totalPrice = Number(vendorOrders.totalPrice) + +product.newPrice * +item.quantity;
        vendorOrders.vendorOrderItems = [...vendorOrders.vendorOrderItems, orderItem];
      } else {
        const newVendorOrders = new VendorOrders();
        newVendorOrders.vendor = product.vendor;
        newVendorOrders.vendorOrderItems = [orderItem];
        newVendorOrders.order = order;
        newVendorOrders.totalPrice = product.newPrice * item.quantity;
        vendorOrders = newVendorOrders;

        sendNotif = true;
      }

      await vendorOrdersRepository.save(vendorOrders);

      if (sendNotif) {
        await sendNotification({
          content: `Buyer "${vendorOrders.order.buyer.firstName} ${vendorOrders.order.buyer.lastName}" has added one of your products to their order. Please confirm that you'll be able to deliver it.`,
          type: 'order',
          user: vendorOrders.vendor,
          link: `/vendor/dashboard/orders/${vendorOrders.id}`
        });
      }
    }
  } catch (error) {
    console.log((error as Error).message);
  }
};