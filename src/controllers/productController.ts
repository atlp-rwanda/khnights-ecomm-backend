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
  listAllProductsService,
  confirmPayment,
  getAllCategories,
  transaction,
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

export const listAllProducts = async (req: Request, res: Response) => {
  await listAllProductsService(req, res);
};
export const productStatus = async (req: Request, res: Response) => {
  await productStatusServices(req, res);
};
export const singleProduct = async (req: Request, res: Response) => {
  await viewSingleProduct(req, res);
};
export const searchProduct = async (req: Request, res: Response) => {
  await searchProductService(req, res);
};
export const Payment = async (req: Request, res: Response) => {
  await confirmPayment(req, res);
};
export const getAllCategory = async (req: Request, res: Response) => {
  await getAllCategories(req, res);
};
export const getAllTransaction = async (req: Request, res: Response) => {
  await transaction(req, res);
};
