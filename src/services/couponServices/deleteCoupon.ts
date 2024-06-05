import { Request, Response } from 'express';
import { responseSuccess, responseError, responseServerError } from '../../utils/response.utils';
import { getRepository } from 'typeorm';
import { Coupon } from '../../entities/coupon';

export const deleteCouponService = async (req: Request, res: Response) => {
  try {
    const couponRepository = getRepository(Coupon);
    const coupon = await couponRepository.findOne({ where: { code: req.body.code } });

    if (!coupon) {
      console.log('Invalid coupon.');
      return responseError(res, 404, 'Invalid coupon');
    }

    await couponRepository.remove(coupon);

    return responseSuccess(res, 200, 'Coupon deleted successfully');
  } catch (error: any) {
    console.log('Error deleting coupon:\n', error);
    return responseServerError(res, error);
  }
};
