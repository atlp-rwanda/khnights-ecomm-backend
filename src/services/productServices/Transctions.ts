import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
});

export const transaction = async (req: Request, res: Response) => {
  try {
    const payments = await stripe.paymentIntents.list();
    const paymentData = payments.data;

    // Calculate statistics
    const totalPayments = paymentData.length;
    const totalAmount = paymentData.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCapturedAmount = paymentData.reduce((sum, payment) => sum + payment.amount_received, 0);
    const successfulPayments = paymentData.filter(payment => payment.status === 'succeeded').length;
    const pendingPayments = paymentData.filter(payment => payment.status !== 'succeeded').length;
    const averagePaymentAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;

    // Prepare the response data
    const responseData = {
      payments: paymentData,
      statistics: {
        totalPayments,
        totalAmount,
        totalCapturedAmount,
        successfulPayments,
        pendingPayments,
        averagePaymentAmount,
      },
    };

    res.json(responseData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
