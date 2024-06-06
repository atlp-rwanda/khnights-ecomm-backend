import { Request, Response } from 'express';
import { responseSuccess, responseError, responseServerError } from '../../utils/response.utils';
import { getRepository } from 'typeorm';
import { Coupon } from '../../entities/coupon';
import { validateCoupon } from '../../helper/couponValidator';
import { User } from '../../entities/User';
import { Product } from '../../entities/Product';

export const createCouponService = async (req: Request, res: Response) => {
  try {
    const { error } = validateCoupon(req.body);
    if (error) {
      console.log('Validation Error creating coupon:\n', error);
      return res.status(400).json({ status: 'error', error: error?.details[0].message });
    }

    const { code, discountRate, expirationDate, maxUsageLimit, discountType, product: productId } = req.body;
    const { id: vendorId } = req.params;

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: vendorId } });
    if (!user) {
      return responseError(res, 404, 'User not found');
    }

    const productRepository = getRepository(Product);
    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return responseError(res, 403, 'Product not found');
    }

    const couponRepository = getRepository(Coupon);
    const existingCoupon = await couponRepository.findOne({ where: { code } });
    if (existingCoupon) {
      return responseError(res, 402, 'Coupon code already exists');
    }

    const newCoupon = new Coupon();
    newCoupon.code = code;
    newCoupon.discountRate = discountRate;
    newCoupon.expirationDate = expirationDate;
    newCoupon.maxUsageLimit = maxUsageLimit;
    newCoupon.discountType = discountType;
    newCoupon.product = product;
    newCoupon.vendor = user;

    await couponRepository.save(newCoupon);
    responseSuccess(res, 201, 'Coupon created successfully');
  } catch (error: any) {
    return responseServerError(res, error);
  }
};
