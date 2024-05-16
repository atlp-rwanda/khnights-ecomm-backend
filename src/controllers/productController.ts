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
  viewSingleProduct
} from '../services';

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

export const productStatus = async (req: Request, res: Response) => {
  await productStatusServices(req, res);
};
export const singleProduct = async (req: Request, res: Response) => {
  await viewSingleProduct(req, res);
};