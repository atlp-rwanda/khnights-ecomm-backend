import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Product } from '../../entities/Product';

interface SearchProductParams {
  name?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export const searchProductService = async (req: Request, res: Response) => {
  const { name, sortBy, sortOrder, page = 1, limit = 10 }: SearchProductParams = req.query as any;
  try {
    if (!name) {
      console.log("no name");
      return res.status(400).json({ status: 'error', error: 'Please provide a search term' });
    }

    const productRepository = getRepository(Product);
    let query = productRepository.createQueryBuilder('product');

    query = query.where('LOWER(product.name) LIKE :name', { name: `%${name.toLowerCase()}%` });

    if (sortBy && sortOrder) {
      query = query.orderBy(`product.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    }

    const skip = (page - 1) * limit;

    const [products, total] = await query.skip(skip).take(limit).getManyAndCount();

    if (total === 0) {
      return res.status(404).json({ status: 'error', error: 'No products found' });
    }

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      status: 'success',
      data: products,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', error: 'Something went wrong' });
  }
};