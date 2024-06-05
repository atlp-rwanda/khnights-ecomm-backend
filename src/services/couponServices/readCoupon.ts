import { Request, Response } from 'express';
import { responseSuccess, responseError, responseServerError } from '../../utils/response.utils';
import { getRepository } from 'typeorm';
import { Coupon } from '../../entities/coupon';

export const readCouponService = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    if (!code) return responseError(res, 400, 'coupon code is required');

    const couponRepository = getRepository(Coupon);
    const coupon = await couponRepository.findOne({ where: { code: code } });

    if (!coupon) {
      return responseError(res, 404, 'Invalid coupon');
    }

    return responseSuccess(res, 200, 'Coupon retrieved successfully', coupon);
  } catch (error: any) {
    return responseServerError(res, error);
  }
};
