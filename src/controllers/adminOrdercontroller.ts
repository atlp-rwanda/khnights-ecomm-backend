import { Request, Response } from 'express';
import {
  getSingleBuyerVendorOrderService,
  getBuyerVendorOrdersService,
  updateBuyerVendorOrderService,
} from '../services';

export const getBuyerVendorOrders = async (req: Request, res: Response) => {
  await getBuyerVendorOrdersService(req, res);
};

export const getSingleBuyerVendorOrder = async (req: Request, res: Response) => {
  await getSingleBuyerVendorOrderService(req, res);
};

export const updateBuyerVendorOrder = async (req: Request, res: Response) => {
  await updateBuyerVendorOrderService(req, res);
};
