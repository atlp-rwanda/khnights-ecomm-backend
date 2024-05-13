import { Request, Response } from 'express';
import { addProductService } from '../services/wishListServices/addProduct';
import { removeProductService } from '../services/wishListServices/removeProducts';
import {getProductsService} from '../services/wishListServices/getProducts'
import {clearAllProductService} from '../services/wishListServices/clearAll'

export const wishlistAddProduct = async (req: Request, res: Response) => {
    await addProductService(req, res);
  };

  export const wishlistRemoveProduct = async (req: Request, res:Response) => {
    await removeProductService(req, res);
  }

  export const wishlistGetProducts = async (req: Request, res:Response) => {
    await getProductsService(req, res);
  }

  export const wishlistClearAllProducts = async (req: Request, res:Response) => {
    await clearAllProductService(req, res);
  }





