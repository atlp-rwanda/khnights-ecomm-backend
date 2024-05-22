import { Request, Response } from 'express';
import {
 
  createProductService,
  updateProductService,
  removeProductImageService, 
  readProductService,
  readProductsService, 
  deleteProductService,
  getRecommendedProductsService,
  productStatusServices,
  viewSingleProduct,
  searchProductService,
  createPaymentIntent, 
  listAllProductsService}
from '../services';


export const readProduct = async (req: Request, res: Response) => {
  await readProductService(req, res);
};

export const readProducts = async (req: Request, res: Response) => {
  await readProductsService(req, res);
};

export const createProduct = async (req: Request, res: Response) => {
  await createProductService(req, res);
};

export const updateProduct = async (req: Request, res: Response) => {
  await updateProductService(req, res);
};

export const removeProductImage = async (req: Request, res: Response) => {
  await removeProductImageService(req, res);
};

export const deleteProduct = async (req: Request, res: Response) => {
  await deleteProductService(req, res);
};

export const getRecommendedProducts = async (req: Request, res: Response) => {
  await getRecommendedProductsService(req, res);
};


export const listAllProducts = async (req: Request, res: Response) => {
  await listAllProductsService(req, res);
};export const productStatus = async (req: Request, res: Response) => {
  await productStatusServices(req, res);
};
export const singleProduct = async (req: Request, res: Response) => {
  await viewSingleProduct(req, res);
};
export const searchProduct = async (req: Request, res: Response) => {
  const { name, sortBy, sortOrder, page, limit } = req.query;

  try {
    const searchParams = {
      name: name as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'ASC' | 'DESC',
      page: parseInt(page as string, 10) || 1,
      limit: parseInt(limit as string, 10) || 10,
    };

    const result = await searchProductService(searchParams);

    res.json(result);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const payment = async (req: Request, res:Response) => {
  await createPaymentIntent(req, res)
}
