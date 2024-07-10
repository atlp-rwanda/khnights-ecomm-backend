import { Request, Response } from 'express';
import { Product } from '../../entities/Product';
import { getRepository } from 'typeorm';
import { responseError, responseSuccess } from '../../utils/response.utils';

export const listAllProductsService = async (req: Request, res: Response) => {
  try {
    const category = req.query.category;

    const productRepository = getRepository(Product);
    const products = await productRepository.find({
      where: category ? { categories: { name: category as string } } : {},
      order: {
        createdAt: 'DESC',
      },
      relations: ['categories', 'vendor', 'feedbacks','feedbacks.user', 'feedbacks.order'],
      select: {
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

    if (products.length < 1) {
      return responseSuccess(res, 200, 'No products found');
    }

    return responseSuccess(res, 200, 'Products retrieved', { products });
  } catch (error) {
    responseError(res, 400, (error as Error).message);
  }
};
