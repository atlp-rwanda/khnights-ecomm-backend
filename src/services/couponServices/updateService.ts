import { Coupon } from '../../entities/coupon';
import { Request, Response } from 'express';
import { responseSuccess, responseError, responseServerError } from '../../utils/response.utils';
import { getRepository } from 'typeorm';
import { validateCouponUpdate } from '../../helper/couponValidator';
import { Product } from '../../entities/Product';

export const updateCouponService = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { error } = validateCouponUpdate(req.body);
    if (error) {
      console.log(error);
      return res.status(400).json({ status: 'error', error: error?.details[0].message });
    }

    const couponRepository = getRepository(Coupon);
    const coupon = await couponRepository.findOne({ where: { code } });
    if (coupon) {
      if (req.body.code !== undefined) {
        const existtCoupon = await couponRepository.findOne({ where: { code: req.body.code } });
        if (existtCoupon) return responseError(res, 400, 'Coupon code already exists');
        if (req.body.code === coupon.code) return responseError(res, 400, 'Coupon code already up to date');
        coupon.code = req.body.code;
      }
      if (req.body.discountRate !== undefined) {
        coupon.discountRate = req.body.discountRate;
      }
      if (req.body.expirationDate !== undefined) {
        coupon.expirationDate = req.body.expirationDate;
      }
      if (req.body.maxUsageLimit !== undefined) {
        coupon.maxUsageLimit = req.body.maxUsageLimit;
      }
      if (req.body.discountType !== undefined) {
        coupon.discountType = req.body.discountType;
      }
      if (req.body.product !== undefined) {
        const { id } = req.body.product;
        const productRepository = getRepository(Product);
        const product = await productRepository.findOne({ where: { id } });
        if (!product) {
          console.log('Error updating coupon: Product not found', product);
          return responseError(res, 404, 'Product not found');
        }

        coupon.product = product;
      }

      await couponRepository.save(coupon);
      return responseSuccess(res, 200, 'Coupon updated successfully', coupon);
    } else {
      console.log('Error updating coupon: Coupon not found', coupon);
      return responseError(res, 404, 'Coupon not found');
    }
  } catch (error: any) {
    console.log('Error while updating coupon:\n', error);
    return responseServerError(res, error);
  }
};
