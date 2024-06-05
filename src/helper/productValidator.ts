import Joi from 'joi';
import { Product } from '../lib/types';

export const validateProduct = (
  product: Pick<Product, 'name' | 'description' | 'newPrice' | 'quantity' | 'expirationDate'>
): Joi.ValidationResult<any> => {
  const schema = Joi.object({
    name: Joi.string().min(3).required().messages({
      'any.required': 'name is required.',
    }),
    description: Joi.string().min(3).required().messages({
      'any.required': 'description is required.',
    }),
    newPrice: Joi.number().required().messages({
      'any.required': 'newPrice is required.',
    }),
    quantity: Joi.number().required().messages({
      'any.required': 'quantity is required.',
    }),
    categories: Joi.alternatives()
      .try(Joi.array().items(Joi.string()).min(1).required(), Joi.string().required())
      .messages({
        'any.required': 'at least one category is required.',
      }),
    expirationDate: Joi.date(),
    oldPrice: Joi.number(),
  });

  return schema.validate(product);
};
