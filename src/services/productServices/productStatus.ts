import { Request, Response } from 'express';
import { User } from '../../entities/User';
import { Product } from '../../entities/Product';
import { getRepository } from 'typeorm';
import { responseSuccess, responseError, responseServerError } from '../../utils/response.utils';

export const productStatusServices = async (req: Request, res: Response) => {
  try {
    const { isAvailable } = req.body;
    const { id } = req.params;

    if (isAvailable === undefined) {
      console.log('Error: Please fill all the required fields');
      return responseError(res, 400, 'Please fill all t he required fields');
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.user?.id } });

    if (!user) {
      responseError(res, 404, 'User not found');
      return;
    }

    const productRepository = getRepository(Product);
    const product = await productRepository.findOne({ where: { id: id } });

    if (!product) return responseError(res, 404, 'Product not found');

    const hasProduct = await productRepository.findOne({
      where: {
        id,
        vendor: {
          id: req.user?.id,
        },
      },
      relations: ['vendor'],
    });

    if (!hasProduct) {
      return responseError(res, 404, 'Product not found in your stock');
    }

    if (hasProduct.expirationDate && hasProduct.expirationDate < new Date()) {
      hasProduct.isAvailable = false;
      await productRepository.save(hasProduct);
      return responseSuccess(res, 200, 'Product status is set to false because it is expired.');
    } else if (hasProduct.quantity < 1) {
      product.isAvailable = false;
      await productRepository.save(hasProduct);
      return responseSuccess(res, 200, 'Product status is set to false because it is out of stock.');
    }

    if (hasProduct.isAvailable === isAvailable) {
      responseError(res, 400, 'Product status is already up to date');
      return;
    }

    hasProduct.isAvailable = isAvailable;
    await productRepository.save(hasProduct);

    return responseSuccess(res, 200, 'Product status updated successfully');
  } catch (error) {
    return responseServerError(res, 'Sorry, Something went wrong. Try again later.');
  }
};
