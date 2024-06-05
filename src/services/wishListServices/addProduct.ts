import { Request, Response } from 'express';
import { User } from '../../entities/User';
import { getRepository } from 'typeorm';
import { wishList } from '../../entities/wishList';
import { Product } from '../../entities/Product';

export const addProductService = async (req:Request,res:Response)=>{
    try {

        const id = req.params.id;
        const wishListRepository = getRepository(wishList);
        const productRepository = getRepository(Product);


        const product = await productRepository.findOne({where: { id }});

        if(!product){
          return res.status(404).json({message: "Product not found"});
        }

        const productDetails = {
          productId: product.id,
          name: product.name,
          image: product.images,
          newPrice: product.newPrice,
          vendorId: product.vendor
        }

        const alreadyIn = await wishListRepository.findOne({where: {productId: id, buyer:{ id: req.user?.id} }})

        if(alreadyIn){
          return res.status(401).json({
            data: {
              message: 'Product Already in the wish list',
              wishlistAdded: alreadyIn,
              product: productDetails,
              },
            })
        }

        const addNewProduct = new wishList();
        addNewProduct.productId = id;
        addNewProduct.buyer = req.user as User;  

        await wishListRepository.save(addNewProduct);

        addNewProduct.buyer = { id: addNewProduct.buyer.id } as unknown as User;

        return res.status(201).json({
        data: {
          message: 'Product Added to wish list',
          wishlistAdded: addNewProduct,
          product: productDetails,
          },
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}