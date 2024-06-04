import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import { getConnection } from 'typeorm';
import { dbConnection } from '../startups/dbConnection';
import { User, UserInterface } from '../entities/User';
import { Coupon } from '../entities/coupon';
import { CartItem } from '../entities/CartItem';
import { Cart } from '../entities/Cart';
import { Product } from '../entities/Product';
import { v4 as uuid } from 'uuid';
import { cleanDatabase } from './test-assets/DatabaseCleanup';

const vendor1Id = uuid();
const cart1Id = uuid();
const cartItemId = uuid();
const buyer1Id = uuid();
const buyer2Id = uuid();
const product1Id = uuid();
const product2Id = uuid();
const vendor2Id = uuid();
const couponCode = 'DISCOUNT20';
const couponCode1 = 'DISCOUNT10';
const couponCode2 = 'DISCOUNT99';
const couponCode3 = 'DISCOUNT22';
const expiredCouponCode = 'EXPIRED';
const finishedCouponCode = 'FINISHED';
const moneyCouponCode = 'MONEY';
const invalidCouponCode = 'INVALIDCODE';

const jwtSecretKey = process.env.JWT_SECRET || '';

const getAccessToken = (id: string, email: string) => {
  return jwt.sign(
    {
      id: id,
      email: email,
    },
    jwtSecretKey
  );
};

const sampleVendor2: UserInterface = {
  id: vendor2Id,
  firstName: 'Vendor',
  lastName: 'User',
  email: 'secondendor@example.com',
  password: 'password123',
  userType: 'Vendor',
  gender: 'Male',
  verified: true,
  phoneNumber: '98000867890',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'VENDOR',
};

const sampleVendor1: UserInterface = {
  id: vendor1Id,
  firstName: 'Vendor',
  lastName: 'User',
  email: 'vendor@example.com',
  password: 'password',
  userType: 'Vendor',
  gender: 'Male',
  phoneNumber: '1234567890',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'VENDOR',
};

const sampleBuyer1: UserInterface = {
  id: buyer1Id,
  firstName: 'buyer1',
  lastName: 'user',
  email: 'buyer1@example.com',
  password: 'password',
  userType: 'Buyer',
  gender: 'Male',
  phoneNumber: '126380996347',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'BUYER',
};
const buyerNoCart: UserInterface = {
  id: buyer2Id,
  firstName: 'buyer1',
  lastName: 'user',
  email: 'buyr122@example.com',
  password: 'password',
  userType: 'Buyer',
  gender: 'Male',
  phoneNumber: '159380996347',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'BUYER',
};

const sampleProduct1 = new Product();
sampleProduct1.id = product1Id;
sampleProduct1.name = 'Test Product';
sampleProduct1.description = 'Amazing product';
sampleProduct1.images = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
sampleProduct1.newPrice = 200;
sampleProduct1.quantity = 10;
sampleProduct1.vendor = sampleVendor1 as User;

const sampleProduct2 = new Product();
sampleProduct2.id = product2Id;
sampleProduct2.name = 'Test 2 Product';
sampleProduct2.description = 'Amazing product 2';
sampleProduct2.images = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
sampleProduct2.newPrice = 200;
sampleProduct2.quantity = 10;
sampleProduct2.vendor = sampleVendor1 as User;

const sampleCoupon = new Coupon();
sampleCoupon.code = couponCode;
sampleCoupon.discountRate = 20;
sampleCoupon.expirationDate = new Date('2025-01-01');
sampleCoupon.maxUsageLimit = 100;
sampleCoupon.discountType = 'percentage';
sampleCoupon.product = sampleProduct1;
sampleCoupon.vendor = sampleVendor1 as User;

const sampleCoupon1 = new Coupon();
sampleCoupon1.code = couponCode1;
sampleCoupon1.discountRate = 20;
sampleCoupon1.expirationDate = new Date('2025-01-01');
sampleCoupon1.maxUsageLimit = 100;
sampleCoupon1.discountType = 'percentage';
sampleCoupon1.product = sampleProduct1;
sampleCoupon1.vendor = sampleVendor1 as User;

const sampleCoupon2 = new Coupon();
sampleCoupon2.code = couponCode2;
sampleCoupon2.discountRate = 20;
sampleCoupon2.expirationDate = new Date('2026-01-01');
sampleCoupon2.maxUsageLimit = 100;
sampleCoupon2.discountType = 'percentage';
sampleCoupon2.product = sampleProduct1;
sampleCoupon2.vendor = sampleVendor1 as User;

const sampleCoupon3 = new Coupon();
sampleCoupon3.code = couponCode3;
sampleCoupon3.discountRate = 20;
sampleCoupon3.expirationDate = new Date('2026-01-01');
sampleCoupon3.maxUsageLimit = 100;
sampleCoupon3.discountType = 'percentage';
sampleCoupon3.product = sampleProduct2;
sampleCoupon3.vendor = sampleVendor1 as User;

const expiredCoupon = new Coupon();
expiredCoupon.code = expiredCouponCode;
expiredCoupon.discountRate = 20;
expiredCoupon.expirationDate = new Date('2023-01-01');
expiredCoupon.maxUsageLimit = 100;
expiredCoupon.discountType = 'percentage';
expiredCoupon.product = sampleProduct1;
expiredCoupon.vendor = sampleVendor1 as User;

const finishedCoupon = new Coupon();
finishedCoupon.code = finishedCouponCode;
finishedCoupon.discountRate = 20;
finishedCoupon.expirationDate = new Date('2028-01-01');
finishedCoupon.maxUsageLimit = 0;
finishedCoupon.discountType = 'percentage';
finishedCoupon.product = sampleProduct1;
finishedCoupon.vendor = sampleVendor1 as User;

const moneyCoupon = new Coupon();
moneyCoupon.code = moneyCouponCode;
moneyCoupon.discountRate = 50;
moneyCoupon.expirationDate = new Date('2028-01-01');
moneyCoupon.maxUsageLimit = 10;
moneyCoupon.discountType = 'money';
moneyCoupon.product = sampleProduct1;
moneyCoupon.vendor = sampleVendor1 as User;

const sampleCart1 = {
  id: cart1Id,
  user: sampleBuyer1,
  totalAmount: 200,
};

const sampleCartItem1 = {
  id: cartItemId,
  product: sampleProduct1,
  cart: sampleCart1,
  quantity: 2,
  newPrice: 200,
  total: 400,
};

beforeAll(async () => {
  const connection = await dbConnection();

  const userRepository = connection?.getRepository(User);
  await userRepository?.save(sampleVendor1);
  await userRepository?.save(sampleBuyer1);
  await userRepository?.save(buyerNoCart);
  await userRepository?.save(sampleVendor2);

  const productRepository = connection?.getRepository(Product);
  await productRepository?.save(sampleProduct1);
  await productRepository?.save(sampleProduct2);

  const couponRepository = connection?.getRepository(Coupon);
  await couponRepository?.save(sampleCoupon);
  await couponRepository?.save(sampleCoupon1);
  await couponRepository?.save(expiredCoupon);
  await couponRepository?.save(sampleCoupon2);
  await couponRepository?.save(sampleCoupon3);
  await couponRepository?.save(finishedCoupon);
  await couponRepository?.save(moneyCoupon);

  const cartRepository = connection?.getRepository(Cart);
  await cartRepository?.save({ ...sampleCart1 });

  const cartItemRepository = connection?.getRepository(CartItem);
  await cartItemRepository?.save({ ...sampleCartItem1 });
});

afterAll(async () => {
  await cleanDatabase();

  server.close();
});

describe('Coupon Management System', () => {
  describe('Create Coupon', () => {
    it('should create a new coupon', async () => {
      const response = await request(app)
        .post(`/coupons/vendor/${vendor1Id}/`)
        .send({
          code: 'NEWCOUPON10',
          discountRate: 10,
          expirationDate: '2025-12-31',
          maxUsageLimit: 50,
          discountType: 'PERCENTAGE',
          product: product1Id,
        })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
    }, 10000);

    it('should return 400 for invalid coupon data', async () => {
      const response = await request(app)
        .post(`/coupons/vendor/${vendor1Id}/`)
        .send({
          code: '',
          discountRate: 'invalid',
          expirationDate: 'invalid-date',
          maxUsageLimit: 'invalid',
          discountType: 'INVALID',
          product: 'invalid-product-id',
        })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
    }, 10000);

    it('should return 403 if product not found', async () => {
      const response = await request(app)
        .post(`/coupons/vendor/${vendor1Id}/`)
        .send({
          code: 'NEWCOUPON10',
          discountRate: 10,
          expirationDate: '2025-12-31',
          maxUsageLimit: 50,
          discountType: 'PERCENTAGE',
          product: uuid(),
        })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(403);
    })

    it('should return 402 if coupon already exist', async () => {
      const response = await request(app)
        .post(`/coupons/vendor/${vendor1Id}/`)
        .send({
          code: couponCode1,
          discountRate: 10,
          expirationDate: '2025-12-31',
          maxUsageLimit: 50,
          discountType: 'PERCENTAGE',
          product: product1Id,
        })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(402);
    })

    it('should return 500 if there is server error', async () => {
      const response = await request(app)
        .post(`/coupons/vendor/***** -- + ---/`)
        .send({
          code: 'NEWCOUPON',
          discountRate: 10,
          expirationDate: '2025-12-31',
          maxUsageLimit: 50,
          discountType: 'PERCENTAGE',
          product: product1Id,
        })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(500);
    })
  });

  describe('Get All Coupons', () => {
    it('should retrieve all coupons for a vendor', async () => {
      const response = await request(app)
        .get(`/coupons/vendor/${vendor1Id}/access-coupons`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Object);
    }, 10000);

    it('should return 404 if no coupons found', async () => {
      const newVendorId = uuid();
      const response = await request(app)
        .get(`/coupons/vendor/${newVendorId}/access-coupons`)
        .set('Authorization', `Bearer ${getAccessToken(newVendorId, 'newvendor@example.com')}`);

      expect(response.status).toBe(401);
    }, 10000);
  });

  describe('Vendor access all Coupon', () => {
    it('should return all coupons', async () => {
      const response = await request(app)
        .get(`/coupons/vendor/${vendor1Id}/access-coupons`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    }, 10000);

    it('should return 404 for invalid vendor id', async () => {
      const invalidVendorId = uuid();
      const response = await request(app)
        .get(`/coupons/vendor/${invalidVendorId}/access-coupons`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    }, 10000);

    it('should return 404 if no coupon found for VENDOR', async () => {
      const response = await request(app)
        .get(`/coupons/vendor/${vendor2Id}/access-coupons`)
        .set('Authorization', `Bearer ${getAccessToken(vendor2Id, sampleVendor2.email)}`);

      expect(response.status).toBe(404);
    })

    it('should return 500 server error', async () => {
      const response = await request(app)
        .get(`/coupons/vendor/uihoji 090j hh =/access-coupons`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(500);
    })
  });

  describe('Read Coupon', () => {
    it('should read a single coupon by code', async () => {
      const response = await request(app)
        .get(`/coupons/vendor/${vendor1Id}/checkout/${couponCode}`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(200);
    }, 10000);

    it('should return 404 for invalid coupon code', async () => {
      const response = await request(app)
        .get(`/coupons/vendor/${vendor1Id}/checkout/${invalidCouponCode}`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid coupon');
    }, 10000);
  });

  describe('Update Coupon', () => {
    it('should update an existing coupon', async () => {
      const response = await request(app)
        .put(`/coupons/vendor/${vendor1Id}/update-coupon/${couponCode1}`)
        .send({
          code: 'KAGAHEBUZO04',
        })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    }, 10000);

    it('should validate coupon update input', async () => {
      const response = await request(app)
        .put(`/coupons/vendor/${vendor1Id}/update-coupon/${couponCode1}`)
        .send()
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
    })

    it('should return 404 for updating a non-existent coupon', async () => {
      const response = await request(app)
        .put(`/coupons/vendor/${vendor1Id}/update-coupon/${invalidCouponCode}`)
        .send({
          discountRate: 25,
        })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(404);
    }, 10000);

    it('should return 200 for updating a discount of coupon', async () => {
      const response = await request(app)
        .put(`/coupons/vendor/${vendor1Id}/update-coupon/${couponCode}`)
        .send({ discountRate: 25 })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);
  
      expect(response.status).toBe(200);
    }, 10000);

    it('should return 200 for updating a expirationDate of coupon', async () => {
      const response = await request(app)
        .put(`/coupons/vendor/${vendor1Id}/update-coupon/${couponCode}`)
        .send({ expirationDate: '2025-12-31' })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);
  
      expect(response.status).toBe(200);
    }, 10000);

    it('should return 200 for updating a maxUsageLimit of coupon', async () => {
      const response = await request(app)
        .put(`/coupons/vendor/${vendor1Id}/update-coupon/${couponCode}`)
        .send({ maxUsageLimit: 40 })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);
  
      expect(response.status).toBe(200);
    }, 10000);

    it('should return 200 for updating a discountType of coupon', async () => {
      const response = await request(app)
        .put(`/coupons/vendor/${vendor1Id}/update-coupon/${couponCode}`)
        .send({ discountType: 'MONEY' })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);
  
      expect(response.status).toBe(200);
    }, 10000);

    it('should return 200 for updating a product of coupon', async () => {
      const response = await request(app)
        .put(`/coupons/vendor/${vendor1Id}/update-coupon/${couponCode}`)
        .send({ product: uuid() })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);
  
      expect(response.status).toBe(200);
    }, 10000);

    it('should return 404 for coupon not found', async () => {
      const response = await request(app)
        .put(`/coupons/vendor/${vendor1Id}/update-coupon/===__8899jjhh`)
        .send({ product: uuid() })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);
  
      expect(response.status).toBe(404);
    }, 10000);
  });

  describe('Delete Coupon', () => {
    it('should delete an existing coupon', async () => {
      const response = await request(app)
        .delete(`/coupons/vendor/${vendor1Id}/checkout/delete`)
        .send({
          code: couponCode,
        })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    }, 10000);

    it('should return 404 for deleting a non-existent coupon', async () => {
      const response = await request(app)
        .delete(`/coupons/vendor/${vendor1Id}/checkout/delete`)
        .send({
          code: invalidCouponCode,
        })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid coupon');
    }, 10000);
  });
});

describe('Buyer Coupon Application', () => {
  describe('Checking Coupon Conditions', () => {
    it('should return 400 when no coupon submitted', async () => {
      const response = await request(app)
        .post(`/coupons/apply`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Coupon Code is required');
    });
    it('should return 404 if coupon code is not found in the database', async () => {
      const response = await request(app)
        .post(`/coupons/apply`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`)
        .send({
          couponCode: 'InvalidCode',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Invalid Coupon Code');
    });
    it('should not allow use of expired tokens', async () => {
      const response = await request(app)
        .post(`/coupons/apply`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`)
        .send({
          couponCode: expiredCoupon.code,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Coupon is expired');
    });
    it('should not allow use of coupon that reach maximum users', async () => {
      const response = await request(app)
        .post(`/coupons/apply`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`)
        .send({
          couponCode: finishedCoupon.code,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Coupon Discount Ended');
    });
    it('Should not work when the product is not in cart', async () => {
      const response = await request(app)
        .post(`/coupons/apply`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`)
        .send({
          couponCode: sampleCoupon3.code,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No product in Cart with that coupon code');
    });
  });

  describe('Giving discount according the the  product coupon', () => {
    it('Should give discont when discount-type is percentage', async () => {
      const response = await request(app)
        .post(`/coupons/apply`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`)
        .send({
          couponCode: sampleCoupon2.code,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        `Coupon Code successfully activated discount on product: ${sampleProduct1.name}`
      );
    });
    it('Should give discont when discount-type is money', async () => {
      const response = await request(app)
        .post(`/coupons/apply`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`)
        .send({
          couponCode: moneyCoupon.code,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        `Coupon Code successfully activated discount on product: ${sampleProduct1.name}`
      );
    });
  });
});
