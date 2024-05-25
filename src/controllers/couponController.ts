import { Request, Response } from 'express';
import { createCouponService } from '../services/couponServices/createCouponService';
import { updateCouponService } from '../services/couponServices/updateService';
import { deleteCouponService } from '../services/couponServices/deleteCoupon';
import { accessAllCouponService } from '../services/couponServices/accessAllCoupon';
import { readCouponService } from '../services/couponServices/readCoupon';

export const createCoupon = async (req: Request, res: Response) => {
  await createCouponService(req, res);
};

export const updateCoupon = async (req: Request, res: Response) => {
  await updateCouponService(req, res);
};

export const deleteCoupon = async (req: Request, res: Response) => {
  await deleteCouponService(req, res);
};

export const accessAllCoupon = async (req: Request, res: Response) => {
  await accessAllCouponService(req, res);
};

export const readCoupon = async (req: Request, res: Response) => {
  await readCouponService(req, res);
};
