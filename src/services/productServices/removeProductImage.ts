import { Request, Response } from 'express';
import { Product } from '../../entities/Product';
import { getRepository } from 'typeorm';
import { User } from '../../entities/User';

declare module 'express' {
  interface Request {
    files?: any;
  }
}

export const removeProductImageService = async (req: Request, res: Response) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ status: 'error', error: 'Please provide an image to remove' });
  }

  const { id } = req.params;
  const productRepository = getRepository(Product);
  const product = await productRepository.findOne({
    where: {
      id,
      vendor: { id: req.user?.id }
    },
    relations: ['vendor'],
  });

  if (!product) {
    return res.status(404).json({ status: 'error', error: 'Product not found' });
  }

  const index = product.images.indexOf(image);

  if (index === -1) {
    return res.status(404).json({ status: 'error', error: 'Image not found' });
  }

  if (product.images.length === 2) {
    return res.status(400).json({ status: 'error', error: 'Product must have at least two image' });
  }

  product.images.splice(index, 1);
  await productRepository.save(product);
  product.vendor = product.vendor.id as unknown as User;

  return res.status(200).json({
    status: 'success',
    data: {
      message: 'Image removed successfully',
      product,
    },
  });
};
