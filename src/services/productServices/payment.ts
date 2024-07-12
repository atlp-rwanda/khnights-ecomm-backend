import { Request, Response } from 'express';
import { Cart } from '../../entities/Cart'; // Import your Cart entity
import { Order } from '../../entities/Order'; // Import your Order entity

import { getRepository, getTreeRepository } from 'typeorm';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { VendorOrders } from '../../entities/vendorOrders';
dotenv.config();
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
});

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const cartId = req.params.id; // Get the cart ID from the params
    const cartRepository = getRepository(Cart);
    const orderRepository = getTreeRepository(Order);
    const vendorOrderRepository = getRepository(VendorOrders);
    const cart = await cartRepository.findOne({ where: { id: cartId } });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found.' });
    }

    const order = await orderRepository.findOne({
      where: { buyer: cart.user, orderStatus: 'order placed' },
      order: { createdAt: 'DESC' },
    });

    if (!order) {
      return res.status(404).json({ error: 'order not found.' });
    }
    const vendorOrders = await vendorOrderRepository.find({
      where: {
        order: { id: order.id },
      },
    });

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: cart.totalAmount,
      currency: 'Rwf',
      description: `Order #${cart.id}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    order.orderStatus = 'awaiting shipment';
    await orderRepository.save(order);

    for (const VendorOrder of vendorOrders) {
      VendorOrder.orderStatus = 'is-accepted';
      await vendorOrderRepository.save(VendorOrder);
    }

    res.status(200).send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// export const confirmPayment = async (req: Request, res: Response) => {
//   try {
//     const paymentIntent = await stripeInstance.paymentIntents.create({
//       currency: 'eur',
//       amount: 2000,
//       automatic_payment_methods: {
//         enabled: true,
//       },
//     });
//     res.send({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// };
