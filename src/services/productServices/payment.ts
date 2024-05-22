//
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
const stripeInstance = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Handle payment intent creation
export const createPaymentIntent = async (req:Request,res:Response)=>{
  try {
    const { amount, currency, description } = req.body; // Data from the front end

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount,
      currency,
      description,
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Something went wrong with your payment' });
  }
};

// // Handle webhook events (optional)
// export const handleWebhook = async (req:Request,res:Response)=>{
//   try {
//     const event = stripeInstance.webhooks.constructEvent(
//       req.body,
//       req.headers['stripe-signature'],
//       'YOUR_WEBHOOK_SECRET' // Replace with your actual webhook secret
//     );

//     // Handle specific events (e.g., payment succeeded, charge refunded, etc.)
//     // Implement your custom logic here

//     res.status(200).send('Webhook received successfully');
//   } catch (error) {
//     console.error('Error handling webhook:', error);
//     res.status(400).send('Webhook error');
//   }
// };
