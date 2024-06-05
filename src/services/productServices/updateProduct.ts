import { Request, Response } from 'express';
import { Product } from '../../entities/Product';
import { getRepository } from 'typeorm';
import { validateProduct } from '../../helper/productValidator';
import cloudinary from '../../utils/cloudinary';
import { User } from '../../entities/User';
import { Category } from '../../entities/Category';
import { responseError } from '../../utils/response.utils';

declare module 'express' {
  interface Request {
    files?: any;
  }
}

export const updateProductService = async (req: Request, res: Response) => {
  try {
    const { error } = validateProduct(req.body);
    if (error !== undefined) {
      return res.status(400).json({ status: 'error', error: error?.details[0].message });
    }

    const { id } = req.params;
    const productRepository = getRepository(Product);
    const product = await productRepository.findOne({
      where: {
        id,
        vendor: {
          id: req.user?.id,
        },
      },
      relations: ['vendor'],
    });

    if (!product) {
      return res.status(404).json({ status: 'error', error: 'Product not found' });
    }

    product.name = req.body.name;
    product.description = req.body.description;
    product.newPrice = req.body.newPrice;

    if (parseInt(req.body.quantity) === 0) {
      product.isAvailable = false;
      product.quantity = req.body.quantity;
    } else {
      product.isAvailable = true;
      product.quantity = req.body.quantity;
    }

    if (req.files) {
      if (product.images.length + req.files.length > 6) {
        return res.status(400).json({ status: 'error', error: 'Product cannot have more than 6 images' });
      }

      const imageUrls: string[] = [];
      for (const image of req.files) {
        const link = await cloudinary.uploader.upload(image.path);
        imageUrls.push(link.secure_url);
      }
      product.images = [...product.images, ...imageUrls];
    }

    if (req.body.expirationDate) {
      product.expirationDate = req.body.expirationDate;
    }

    if (req.body.oldPrice) {
      product.oldPrice = req.body.oldPrice;
    }

    const categoryRepository = getRepository(Category);
    let categories = [];
    if (typeof req.body.categories === 'string') {
      let category = await categoryRepository.findOne({
        where: { name: req.body.categories.toLowerCase() },
      });
      if (!category) {
        category = new Category();
        category.name = req.body.categories.toLowerCase();
        category = await categoryRepository.save(category);
      }
      categories.push(category);
    } else {
      categories = await Promise.all(
        req.body.categories.map(async (categoryName: string) => {
          let category = await categoryRepository.findOne({ where: { name: categoryName.toLowerCase() } });
          if (!category) {
            category = new Category();
            category.name = categoryName.toLowerCase();
            await categoryRepository.save(category);
          }
          return category;
        })
      );
    }

    product.categories = categories;

    await productRepository.save(product);

    product.vendor = {
      id: product.vendor.id,
      name: product.vendor.firstName + ' ' + product.vendor.lastName,
    } as unknown as User;

    return res.status(200).json({
      status: 'success',
      data: {
        message: 'Product updated successfully',
        product,
      },
    });
  } catch (error) {
    responseError(res, 400, (error as Error).message);
  }
};
