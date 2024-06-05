import { Request, Response } from 'express';
import { createCartService, readCartService, removeProductInCartService, clearCartService } from '../services';

export const createCart = async (req: Request, res: Response) => {
  await createCartService(req, res);
};

export const readCart = async (req: Request, res: Response) => {
  await readCartService(req, res);
};

export const removeProductInCart = async (req: Request, res: Response) => {
  await removeProductInCartService(req, res);
};

export const clearCart = async (req: Request, res: Response) => {
  await clearCartService(req, res);
};
