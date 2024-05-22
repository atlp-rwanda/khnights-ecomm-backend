import { Request, Response } from 'express';
import { Cart } from '../../entities/Cart'; // Import your Cart entity
import { Order } from '../../entities/Order'; // Import your Order entity
import { getRepository, getTreeRepository } from 'typeorm';
import dotenv from 'dotenv';
import Stripe from 'stripe';
dotenv.config();
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10",
});

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const {  payment_method } = req.body;
    const cartId = req.params.cartId; // Get the cart ID from the params
  
    const cartRepository = getRepository(Cart);
    const orderRepository = getTreeRepository(Order)
    const cart = await cartRepository.findOne({where: {id : cartId}});
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found.' });
    }
    const order = await orderRepository.findOne({ where: { buyer: cart.user } });
    if (!order) {
        return res.status(404).json({ error: 'order not found.' });
      }
   
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: cart.totalAmount, // Convert total to cents
      currency: 'usd',
      description: `Order #${cartId}`,
      return_url: 'https://frontend-website.com/success', 
      confirm: true,
      payment_method,
    });

      order.orderStatus = 'awaiting shipment';
      await orderRepository.save(order);

   
    if (paymentIntent.status === 'succeeded') {
      // Payment succeeded
      res.status(200).json({ message: 'Payment successful!' });
    } else {
      // Payment failed
      res.status(400).json({ error: 'Payment failed.' });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};