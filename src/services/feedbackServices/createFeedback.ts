import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Feedback } from '../../entities/Feedback';
import { Product } from '../../entities/Product';
import { User } from '../../entities/User';
import { responseError, responseSuccess } from '../../utils/response.utils';
import { Order } from '../../entities/Order';

interface AuthRequest extends Request {
  user?: User;
}

export const createFeedbackService = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { comment, orderId } = req.body;

  try {
    const feedbackRepository = getRepository(Feedback);
    const productRepository = getRepository(Product);
    const orderRepository = getRepository(Order);
    if (!orderId) {
      return responseError(res, 404, `Your feedback can't be recorded at this time Your order doesn't exist `);
    }
    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return responseError(res, 404, `Your feedback can't be recorded at this time product not found`);
    }
    const order = await orderRepository.findBy({ id: orderId, orderStatus: 'completed', buyer: { id: req.user?.id }, orderItems: { product: { id: productId } } })
    if (!order.length) {
      return responseError(res, 404, `Your feedback can't be recorded at this time Your order haven't been completed yet or doesn't contain this product`);
    }

    const feedback = new Feedback();
    feedback.comment = comment;
    feedback.user = req.user as User;
    feedback.product = product;

    await feedbackRepository.save(feedback);

    return responseSuccess(res, 201, 'Feedback created successfully', feedback);
  } catch (error) {
    return responseError(res, 500, 'Server error');
  }
};
