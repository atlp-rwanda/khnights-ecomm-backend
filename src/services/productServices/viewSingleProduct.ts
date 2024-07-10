import { Request, Response } from 'express';
import { Product } from '../../entities/Product';
import { getRepository } from 'typeorm';
import { responseError } from '../../utils/response.utils';
import { validate } from 'uuid';

export const viewSingleProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;

    if (!validate(productId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid product ID' });
    }
    if (productId) {
      const products = getRepository(Product);
      const product = await products.findOne({
        where: { id: productId }, relations: ['categories', 'vendor', 'feedbacks', 'feedbacks.user', 'feedbacks.order'], select: {
          vendor: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            photoUrl: true,
          },
          feedbacks: {
            id: true,
            comment: true,
            createdAt: true,
            updatedAt: true,
            user: {
              id: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
            },
            order: {
              id: true,
              orderItems: true,
            }
          }
        },
      });

      if (!product) {
        return res.status(404).send({ status: 'error', message: 'Product not found' });
      }
      res.status(200).json({ status: 'success', product: product });
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).send('Error fetching product details');
  }
};