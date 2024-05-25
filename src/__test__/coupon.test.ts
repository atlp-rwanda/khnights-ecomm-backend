import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import { getConnection } from 'typeorm';
import { dbConnection } from '../startups/dbConnection';
import { User, UserInterface } from '../entities/User';
import { Coupon } from '../entities/coupon';
import { Product } from '../entities/Product';
import { v4 as uuid } from 'uuid';

const vendor1Id = uuid();
const product1Id = uuid();
const couponCode = 'DISCOUNT20';
const couponCode1 = 'DISCOUNT10';
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

const sampleProduct1 = {
  id: product1Id,
  name: 'Test Product',
  description: 'Amazing product',
  images: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
  newPrice: 200,
  quantity: 10,
  vendor: sampleVendor1,
};

const sampleCoupon = {
  code: couponCode,
  discountRate: 20,
  expirationDate: new Date('2025-01-01'),
  maxUsageLimit: 100,
  discountType: 'PERCENTAGE',
  product: sampleProduct1,
  vendor: sampleVendor1,
};

const sampleCoupon1 = {
  code: couponCode1,
  discountRate: 20,
  expirationDate: new Date('2025-01-01'),
  maxUsageLimit: 100,
  discountType: 'PERCENTAGE',
  product: sampleProduct1,
  vendor: sampleVendor1,
};

beforeAll(async () => {
  const connection = await dbConnection();

  const userRepository = connection?.getRepository(User);
  await userRepository?.save(sampleVendor1);

  const productRepository = connection?.getRepository(Product);
  await productRepository?.save(sampleProduct1);

  const couponRepository = connection?.getRepository(Coupon);
  await couponRepository?.save(sampleCoupon);

  const couponRepository1 = connection?.getRepository(Coupon);
  await couponRepository1?.save(sampleCoupon1);
});

afterAll(async () => {
  const connection = getConnection();

  const couponRepository = connection.getRepository(Coupon);
  await couponRepository.delete({});

  const productRepository = connection.getRepository(Product);
  await productRepository.delete({});

  const userRepository = connection.getRepository(User);
  await userRepository.delete({});

  await connection.close();
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

    it('should return 404 for updating a non-existent coupon', async () => {
      const response = await request(app)
        .put(`/coupons/vendor/${vendor1Id}/update-coupon/${invalidCouponCode}`)
        .send({
          discountRate: 25,
        })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Coupon not found');
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
