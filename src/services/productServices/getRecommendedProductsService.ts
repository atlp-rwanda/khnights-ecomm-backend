import { Request, Response } from "express";
import { responseError, responseSuccess } from "../../utils/response.utils";
import { getRepository } from "typeorm";
import { Product } from "../../entities/Product";

interface conditionDoc {
    categories: any[] | null;
    vendor: any | null
}

export const getRecommendedProductsService = async (req: Request, res: Response) => {

    try {
        // Define pagination parameters
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const condition: conditionDoc = {
            categories: null,
            vendor: null
        };

        if (req.query.categories) {
            const categoryIds = Array.isArray(req.query.categories) ? req.query.categories : [req.query.categories];
console.log(categoryIds)
            condition.categories = categoryIds;
        };
        if (req.query.vendor) condition.vendor = req.query.vendor;

        const productRepository = getRepository(Product);
        const productsQuery = productRepository.createQueryBuilder("product")
            .leftJoinAndSelect("product.categories", "category")
            .leftJoinAndSelect("product.vendor", "vendor")
            .where("1 = 1");

        // Apply conditions if available
        if (condition.categories && condition.categories.length > 0) {
            productsQuery.andWhere("category.id IN (:...categories)", { categories: condition.categories });
        }
        if (condition.vendor) {
            productsQuery.andWhere("vendor.id = :vendorId", { vendorId: condition.vendor });
        }

        console.log("+++++++++++++++++++++++++++++");
        console.log(condition);
        console.log("+++++++++++++++++++++++++++++");
        const products = await productsQuery
            .skip(skip)
            .take(limit)
            .getMany();
        if (products.length < 1) {
            return responseSuccess(res, 200, `No products found for the specified ${ condition.vendor ? 'vendor' : 'category'}`);
        }
        // { categories: null, vendor: 'e8150556-8737-47dd-a365-da3e82fa84be' }
        return responseSuccess(res, 200, 'Products retrieved', {products});
    } catch (error) {
        console.log("**************");
        console.log(error);
        console.log("**************");
        return responseError(res, 400, (error as Error).message);
    }
};

