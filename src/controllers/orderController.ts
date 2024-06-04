import { Request, Response } from 'express';
import { createOrderService } from '../services/orderServices/createOrder';
import { getOrderService, getOrdersService } from '../services/orderServices/getOrderService';
import { updateOrderService } from '../services/orderServices/updateOrderService';
import { getTransactionHistoryService } from '../services/orderServices/getOrderTransactionHistory';

export const createOrder = async (req: Request, res: Response) => {
  await createOrderService(req, res);
};
export const getOrders = async (req: Request, res: Response) => {
  await getOrdersService(req, res);
};

export const getOrder = async (req: Request, res: Response) => {
  await getOrderService(req, res);
};
export const updateOrder = async (req: Request, res: Response) => {
  await updateOrderService(req, res);
};
export const getOrdersHistory = async (req: Request, res: Response) => {
  await getTransactionHistoryService(req, res);
};
