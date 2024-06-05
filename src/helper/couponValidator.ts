import Joi from 'joi';
import { Coupon } from '../entities/coupon';

export const validateCoupon = (
  coupon: Pick<Coupon, 'code' | 'discountRate' | 'expirationDate' | 'maxUsageLimit'>
): Joi.ValidationResult<any> => {
  const schema = Joi.object({
    code: Joi.string().min(5).required().messages({
      'any.required': 'code is required.',
      'string.min': 'code must be at least 5 characters long.',
    }),
    discountRate: Joi.number().required().messages({
      'any.required': 'discountRate is required.',
    }),
    expirationDate: Joi.date().required().messages({
      'any.required': 'expirationDate is required.',
    }),
    maxUsageLimit: Joi.number().required().messages({
      'any.required': 'maxUsageLimit is required.',
    }),
    discountType: Joi.string().required().messages({
      'any.required': 'discountType is required.',
    }),
    product: Joi.string().required().messages({
      'any.required': 'product is required.',
    }),
  });

  return schema.validate(coupon);
};

export const validateCouponUpdate = (
  coupon: Partial<Pick<Coupon, 'code' | 'discountRate' | 'expirationDate' | 'maxUsageLimit'>>
): Joi.ValidationResult<any> => {
  const schema = Joi.object({
    code: Joi.string().min(5).messages({
      'string.min': 'code must be at least 5 characters long.',
    }),
    discountRate: Joi.number().messages({
      'number.base': 'discountRate must be a number.',
    }),
    expirationDate: Joi.date().messages({
      'date.base': 'expirationDate must be a valid date.',
    }),
    product: Joi.string().messages({
      'string.base': 'product must be a string.',
    }),
    maxUsageLimit: Joi.number().messages({
      'number.base': 'maxUsageLimit must be a number.',
    }),
    discountType: Joi.string().messages({
      'string.base': 'discountType must be a string.',
    }),
  })
    .min(1)
    .messages({
      'object.min': 'At least one field must be updated.',
    });

  return schema.validate(coupon);
};
