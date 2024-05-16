import { Request, Response } from "express";
import { getRepository, Like } from 'typeorm';
import { Product } from '../../entities/Product';

interface SearchProductParams {
  name?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export const searchProductService = async (params: SearchProductParams) => {
  const { name, sortBy, sortOrder, page = 1, limit = 10 } = params;

  const productRepository = getRepository(Product);
  let query = productRepository.createQueryBuilder('product');

  if (name) {
    query = query.where('product.name LIKE :name', { name: `%${name}%` });
  }

  if (sortBy && sortOrder) {
    query = query.orderBy(`product.${sortBy}`, sortOrder as 'ASC' | 'DESC');
  }

  const skip = (page - 1) * limit;

  const [products, total] = await query
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  const totalPages = Math.ceil(total / limit);

  return {
    data: products,
    pagination: {
      totalItems: total,
      currentPage: page,
      totalPages,
      itemsPerPage: limit,
    },
  };
};
