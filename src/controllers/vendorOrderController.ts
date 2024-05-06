import { Request, Response } from 'express';
import { getVendorOrdersService, getSingleVendorOrderService, updateVendorOrderService } from '../services';

export const getVendorOrders = async (req: Request, res: Response) => {
  await getVendorOrdersService(req, res);
};

export const getSingleVendorOrder = async (req: Request, res: Response) => {
  await getSingleVendorOrderService(req, res);
};

export const updateVendorOrder = async (req: Request, res: Response) => {
  await updateVendorOrderService(req, res);
};
