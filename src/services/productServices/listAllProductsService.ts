import { Request, Response } from 'express';
import { Product } from '../../entities/Product';
import { getRepository } from 'typeorm';
import { responseError, responseSuccess } from '../../utils/response.utils';
import { validate } from 'uuid';

export const listAllProductsService = async (req: Request, res: Response) => {
    try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const category = req.query.category ;

        
        const productRepository = getRepository(Product);
        const products = await productRepository.find({
            where: {
                categories: {
                    name: category as string
                }
            },
            skip,
            take: limit,
            relations: ["categories","vendor"],
            select: {
                vendor: {
                    id: true, firstName: true, lastName: true,
                    email: true, phoneNumber: true, photoUrl: true
                }
            }
        }
        );

        if (products.length < 1) {
            return responseSuccess(res, 200, 'No products found');
        }

        return responseSuccess(res, 200, 'Products retrieved', { products });
    } catch (error) {
        responseError(res, 400, (error as Error).message);
    }
};
