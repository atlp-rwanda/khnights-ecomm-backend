import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Coupon } from '../../entities/coupon';
import { Cart } from '../../entities/Cart';
import { CartItem } from '../../entities/CartItem';

export const buyerApplyCouponService = async (req: Request, res: Response) => {
    try {
      const {couponCode} = req.body

      if (!couponCode) return res.status(400).json({ message: 'Coupon Code is required' });

      const couponRepository = getRepository(Coupon);
      const coupon = await couponRepository.findOne({
        where: { code: couponCode },
        relations: ['product'],
      });

      if(!coupon) return res.status(404).json({message: 'Invalid Coupon Code'});

      if(coupon){
        if(coupon.expirationDate && coupon.expirationDate < new Date()){
          return res.status(400).json({message: 'Coupon is expired'});
        }

        if(coupon.usageTimes == coupon.maxUsageLimit){
          return res.status(400).json({message: 'Coupon Discount Ended'});
        }
      }
      const couponProductId = coupon.product.id; 

      const cartRepository = getRepository(Cart)
      let cart = await cartRepository.findOne({where: { user: { id: req.user?.id },isCheckedOut: false },
        relations: ['items', 'items.product'],
      });

      if(!cart) return res.status(400).json({message: "You don't have a product in cart"});

      const cartItemRepository = getRepository(CartItem);
      const couponCartItem = await cartItemRepository.findOne({
        where: {
          cart: { id: cart.id },
          product: { id: couponProductId },
        },
        relations: ['product'],
      });

      if(!couponCartItem) return res.status(404).json({message: 'No product in Cart with that coupon code'});

      let amountReducted;
      if(coupon.discountType === 'percentage'){
        const reduction = (couponCartItem.product.newPrice * coupon.discountRate)/ 100;
        amountReducted = reduction;
        couponCartItem.newPrice = couponCartItem.product.newPrice - reduction;

        await cartItemRepository.save(couponCartItem)
      } 
      else {
        amountReducted = coupon.discountRate;
        couponCartItem.newPrice = couponCartItem.product.newPrice - amountReducted;
        await cartItemRepository.save(couponCartItem)
      }

      cart = await cartRepository.findOne({where: { id: cart.id},
        relations: ['items', 'items.product'],
      });
      if(cart){
        cart.updateTotal();
        await cartRepository.save(cart);
      }

      coupon.usageTimes +=1;     

      if(req.user?.id){
        coupon.usedBy.push(req.user?.id);
      }

      await couponRepository.save(coupon);

      return (res.status(200).json({message: `Coupon Code successfully activated discount on product: ${couponCartItem.product.name}`, amountDiscounted: amountReducted }));

    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };