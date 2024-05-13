import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { wishList } from '../../entities/wishList';

export const removeProductService = async (req:Request,res:Response)=>{
    try {

        const id = parseInt(req.params.id);
        const wishListRepository = getRepository(wishList);

        const product = await wishListRepository.findOne({where: { id }});

        if(!product){
        return res.status(404).json({message: "Product not found in wish list"});
        }

        await wishListRepository.remove(product);
        return res.status(200).json({ message: "Product removed from wish list" });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}