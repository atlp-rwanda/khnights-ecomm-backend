import { Request, Response } from 'express';
import { Product } from '../../entities/Product';
import { getRepository } from 'typeorm';
import { responseError, responseSuccess } from '../../utils/response.utils';

export const deleteProductService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productRepository = getRepository(Product);

    const product = await productRepository.findOne({
      where: {
        id: id,
        vendor: {
          id: req.user?.id,
        },
      },
    });

    if (product) {
      await productRepository.remove(product);
      return responseSuccess(res, 200, 'Product successfully deleted');
    }

    return responseError(res, 404, 'Product not found');
  } catch (error) {
    responseError(res, 400, (error as Error).message);
  }
};
