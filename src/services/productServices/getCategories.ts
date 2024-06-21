import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Category } from '../../entities/Category';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categoryRepository = getRepository(Category);
    const categories = await categoryRepository.find({
      relations: {
        products: true
      },
      select: {
        products: {
          id: true
        }
      }
    });

    res.status(200).json({ status: 'success', categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ status: 'error', message: 'Error fetching categories' });
  }
};
