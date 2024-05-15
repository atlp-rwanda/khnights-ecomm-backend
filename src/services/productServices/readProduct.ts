import { Request, Response } from 'express';
import { Product } from '../../entities/Product';
import { getRepository } from 'typeorm';
import { responseError, responseSuccess } from '../../utils/response.utils';

export const readProductsService = async (req: Request, res: Response) => {
    try {
        // Define pagination parameters
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;

        // Retrieve products
        const productRepository = getRepository(Product);
        const products = await productRepository.find({
            where: {
                vendor: {
                    id: req.user?.id,
                },
            },
            skip,
            take: limit,
            relations: ['categories', 'vendor'],
            select: {
                vendor: {
                    id: true, firstName: true, lastName: true,
                    email: true, phoneNumber: true, photoUrl: true
                }
            }
        });

        if (products.length < 1) {
            return responseSuccess(res, 200, 'You have no products yet');
        }
        return responseSuccess(res, 200, 'Products retrieved', { products });
    } catch (error) {
        responseError(res, 400, (error as Error).message);
    }
};

export const readProductService = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const productRepository = getRepository(Product);
        const product = await productRepository.findOne({
            where: {
                id: id,
                vendor: {
                    id: req.user?.id,
                },
            },
            relations: ['categories', 'vendor'],
            select: {
                vendor: {
                    id: true, firstName: true, lastName: true,
                    email: true, phoneNumber: true, photoUrl: true
                }
            }
        });

        if (!product) {
            return responseError(res, 404, 'Product not found');
        }

        return responseSuccess(res, 200, 'Product retrieved', { product });
    } catch (error) {
        responseError(res, 400, (error as Error).message);
    }
};
