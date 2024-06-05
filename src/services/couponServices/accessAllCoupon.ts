import { Request, Response } from 'express';
import { responseSuccess, responseError, responseServerError } from '../../utils/response.utils';
import { getRepository } from 'typeorm';
import { Coupon } from '../../entities/coupon';
import { User } from '../../entities/User';

export const accessAllCouponService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Retrieve the user by id
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      return responseError(res, 404, 'User not found');
    }

    // Retrieve all coupons for the user
    const couponRepository = getRepository(Coupon);
    const coupons = await couponRepository.find({
      where: { vendor: { id: user.id } },
      relations: ['product'],
    });

    if (!coupons.length) {
      return responseError(res, 404, 'No coupons found');
    }

    return responseSuccess(res, 200, 'Coupons retrieved successfully', coupons);
  } catch (error: any) {
    return responseServerError(res, error);
  }
};
