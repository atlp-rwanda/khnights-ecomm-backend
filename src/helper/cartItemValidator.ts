import Joi from 'joi';

interface CartItem {
  productId: string;
  quantity: number;
}

export const validateCartItem = (product: CartItem): Joi.ValidationResult<any> => {
  const schema = Joi.object({
    productId: Joi.string().min(3).required().messages({
      'any.required': 'id is required.',
    }),
    quantity: Joi.number().required().messages({
      'any.required': 'quantity is required.',
    }),
  });

  return schema.validate(product);
};
