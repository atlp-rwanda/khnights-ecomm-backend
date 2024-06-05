import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { wishList } from '../../entities/wishList';
import { Product } from '../../entities/Product';

export const getProductsService = async (req: Request, res: Response) => {
  try {
    const wishListRepository = getRepository(wishList);
    const productRepository = getRepository(Product);

    const productsForBuyer = await wishListRepository.find({ where: { buyer: { id: req.user?.id } } });

    if (productsForBuyer.length === 0) {
      return res.status(404).json({ message: 'No products in wish list', products: productsForBuyer });
    }

    const buyerWishProducts = await Promise.all(
      productsForBuyer.map(async product => {
        const productDetails = await productRepository.findOne({ where: { id: product.productId } });
        if (productDetails) {
          return {
            wishListDetails: product,
            productInfo: {
              productId: productDetails.id,
              name: productDetails.name,
              image: productDetails.images,
              newPrice: productDetails.newPrice,
              vendorId: productDetails.vendor,
            },
          };
        }
      })
    );

    return res.status(200).json({ message: 'Products retrieved', productsForBuyer: buyerWishProducts });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};