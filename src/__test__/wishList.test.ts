import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import { getConnection } from 'typeorm';
import { dbConnection } from '../startups/dbConnection';
import { v4 as uuid } from 'uuid';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';
import { wishList } from '../entities/wishList';
import { User, UserInterface } from '../entities/User';
import { cleanDatabase } from './test-assets/DatabaseCleanup';

const buyer1Id = uuid();
const buyer2Id = uuid();
let product1Id: string;
let product2Id: string;
const catId = uuid();
const vendor2Id = uuid();

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
const sampleBuyer2: UserInterface = {
  id: buyer2Id,
  firstName: 'buyer2',
  lastName: 'use',
  email: 'buyer2@example.com',
  password: 'passwo',
  userType: 'Buyer',
  gender: 'Male',
  phoneNumber: '1638099347',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'BUYER',
};
const sampleVendor1: UserInterface = {
  id: vendor2Id,
  firstName: 'vendor1',
  lastName: 'user',
  email: 'vendor11@example.com',
  password: 'password',
  userType: 'Vendor',
  gender: 'Male',
  phoneNumber: '12638090347',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'VENDOR',
};

let productInWishList: number;

beforeAll(async () => {
  const connection = await dbConnection();
  const userRepository = connection?.getRepository(User);
  await userRepository?.save({ ...sampleBuyer1 });
  await userRepository?.save({ ...sampleBuyer2 });
  await userRepository?.save({ ...sampleVendor1 });
});

afterAll(async () => {
  await cleanDatabase()
  server.close();
});
const data1 = {
  id: buyer1Id,
  email: sampleBuyer1.email,
};
const data2 = {
  id: buyer2Id,
  email: sampleBuyer2.email,
};
const vendorData = {
  id: vendor2Id,
  email: sampleVendor1.email,
};

const jwtSecretKey = process.env.JWT_SECRET || '';
describe('Wish list management tests', () => {
  describe('Add product to wish list', () => {
    it('should return 404 when product is not found', async () => {
      const token = jwt.sign(data1, jwtSecretKey);
      const response = await request(app).post(`/wish-list/add/${uuid()}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Product not found' });
    });

    it('should add a new product to wish list', async () => {
      const vendorToken = jwt.sign(vendorData, jwtSecretKey);
      const prod1Response = await request(app)
        .post('/product')
        .field('name', 'test product12')
        .field('description', 'amazing product3')
        .field('newPrice', 2000)
        .field('quantity', 10)
        .field('categories', 'technology')
        .field('categories', 'sample')
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .set('Authorization', `Bearer ${vendorToken}`);

      product1Id = prod1Response.body.data.product.id;

      const prod2Response = await request(app)
        .post('/product')
        .field('name', 'more product2')
        .field('description', 'food product3')
        .field('newPrice', 2000)
        .field('quantity', 10)
        .field('categories', 'technology')
        .field('categories', 'sample')
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .set('Authorization', `Bearer ${vendorToken}`);

      product2Id = prod2Response.body.data.product.id;

      const token = jwt.sign(data1, jwtSecretKey);
      const response1 = await request(app).post(`/wish-list/add/${product1Id}`).set('Authorization', `Bearer ${token}`);
      expect(response1.status).toBe(201);
      expect(response1.body.data.message).toBe('Product Added to wish list');
      productInWishList = response1.body.data.wishlistAdded.id;

      await request(app).post(`/wish-list/add/${product2Id}`).set('Authorization', `Bearer ${token}`);
    });

    it('should tell if there is the product is already in the wish list', async () => {
      const token = jwt.sign(data1, jwtSecretKey);
      const response = await request(app).post(`/wish-list/add/${product1Id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(401);
      expect(response.body.data.message).toBe('Product Already in the wish list');
    });
    it('should return 500 when the  ID is not valid', async () => {
      const token = jwt.sign(data1, jwtSecretKey);
      const response = await request(app)
        .post(`/wish-list/add/kjwxq-wbjk2-2bwqs-21`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(500);
    });
  });

  describe('Get products in wishList', () => {
    it('Returns 404 when buyer has no product in wish list', async () => {
      const token = jwt.sign(data2, jwtSecretKey);
      const response = await request(app).get('/wish-list').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No products in wish list');
    });

    it('Returns products in the wish list for a buyer ', async () => {
      const token = jwt.sign(data1, jwtSecretKey);
      const response = await request(app).get('/wish-list').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Products retrieved');
    });
  });

  describe('Remove a product from wish lsit', () => {
    it('should return 404 when product is not found in wish list', async () => {
      const token = jwt.sign(data1, jwtSecretKey);
      const response = await request(app).delete(`/wish-list/delete/${28}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Product not found in wish list');
    });

    it('should delete a product from wish list', async () => {
      const token = jwt.sign(data1, jwtSecretKey);
      const response = await request(app)
        .delete(`/wish-list/delete/${productInWishList}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Product removed from wish list');
    });
    it('should return 500 when the  ID is not valid', async () => {
      const token = jwt.sign(data1, jwtSecretKey);
      const response = await request(app)
        .delete(`/wish-list/delete/kjwxq-wbjk2-2bwqs-21`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(500);
    });
  });

  describe('Clear all products in wish for a user', () => {
    it('Returns 404 when buyer has no product in wish list', async () => {
      const token = jwt.sign(data2, jwtSecretKey);
      const response = await request(app).delete('/wish-list/clearAll').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No products in wish list');
    });

    it('should delete all products for a nuyer in wish list', async () => {
      const token = jwt.sign(data1, jwtSecretKey);
      const response = await request(app).delete('/wish-list/clearAll').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('All products removed successfully');
    });
  });
});
