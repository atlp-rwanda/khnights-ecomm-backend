import { Request, Response } from 'express';
import { Product } from '../../entities/Product';
import { getRepository } from 'typeorm';
import { validateProduct } from '../../helper/productValidator';
import cloudinary from '../../utils/cloudinary';
import { User } from '../../entities/User';
import { Category } from '../../entities/Category';

declare module 'express' {
  interface Request {
    files?: any;
  }
}

export const createProductService = async (req: Request, res: Response) => {
  try {
    const { error } = validateProduct(req.body);
    if (error !== undefined) {
      return res.status(400).json({ status: 'error', error: error?.details[0].message });
    }

    const existingProduct = await getRepository(Product).findOne({
      where: {
        name: req.body.name,
        vendor: {
          id: req.user?.id,
        },
      },
    });

    if (existingProduct) {
      return res.status(409).json({ status: 'error', error: 'Its looks like Product already exists' });
    }

    const files: any = req.files;

    if (files.length < 2) {
      return res.status(400).json({ status: 'error', error: 'Please upload more than one image' });
    }
    if (files.length > 6) {
      return res.status(400).json({ status: 'error', error: 'Product cannot have more than 6 images' });
    }

    const imageUrls: string[] = [];
    for (const file of files) {
      const image = file.path;
      const link = await cloudinary.uploader.upload(image);
      imageUrls.push(link.secure_url);
    }

    const product = new Product();
    product.name = req.body.name;
    product.description = req.body.description;
    product.newPrice = req.body.newPrice;
    product.quantity = req.body.quantity;
    product.images = imageUrls;

    if (req.body.expirationDate) {
      product.expirationDate = req.body.expirationDate;
    }
    product.vendor = req.user as User;

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

    const productRepository = getRepository(Product);
    const savedProduct = await productRepository.save(product);

    product.vendor = product.vendor.id as unknown as User;
    return res.status(201).json({
      status: 'success',
      data: {
        message: 'Product created successfully',
        product: { ...savedProduct },
      },
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};