import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { wishList } from '../../entities/wishList';

export const clearAllProductService = async (req: Request, res: Response) => {
  try {
    const wishListRepository = getRepository(wishList);
    const productsForBuyer = await wishListRepository.find({ where: { buyer: { id: req.user?.id } } });

    if (productsForBuyer.length === 0) {
      return res.status(404).json({ message: 'No products in wish list' });
    }

    await wishListRepository.remove(productsForBuyer);
    return res.status(200).json({ message: 'All products removed successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
