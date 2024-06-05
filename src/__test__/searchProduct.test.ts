import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import { getConnection } from 'typeorm';
import { dbConnection } from '../startups/dbConnection';
import { User, UserInterface } from '../entities/User';
import { v4 as uuid } from 'uuid';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';
import { cleanDatabase } from './test-assets/DatabaseCleanup';

const vendor1Id = uuid();
const product1Id = uuid();
const product2Id = uuid();
const InvalidID = uuid();
const expiredProductId = uuid();
const catId = uuid();
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
  firstName: 'vendor1o',
  lastName: 'user',
  email: 'vendor10@example.com',
  password: 'password',
  userType: 'Vendor',
  gender: 'Male',
  phoneNumber: '126380996348',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'VENDOR',
};

const sampleCat = {
  id: catId,
  name: 'accessories',
};

const sampleProduct1 = {
  id: product1Id,
  name: 'test product single',
  description: 'amazing product',
  images: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
  newPrice: 200,
  quantity: 10,
  vendor: sampleVendor1,
  categories: [sampleCat],
};

const sampleProduct2 = {
  id: product2Id,
  name: 'another test product',
  description: 'another amazing product',
  images: ['photo4.jpg', 'photo5.jpg'],
  newPrice: 150,
  quantity: 5,
  vendor: sampleVendor1,
  categories: [sampleCat],
};

const expiredProduct = {
  id: expiredProductId,
  name: 'expired product',
  description: 'this product is expired',
  images: ['photo6.jpg'],
  newPrice: 100,
  quantity: 3,
  vendor: sampleVendor1,
  categories: [sampleCat],
  expirationDate: new Date('2023-01-01'),
};

beforeAll(async () => {
  const connection = await dbConnection();

  const categoryRepository = connection?.getRepository(Category);
  await categoryRepository?.save({ ...sampleCat });

  const userRepository = connection?.getRepository(User);
  await userRepository?.save({ ...sampleVendor1 });

  const productRepository = connection?.getRepository(Product);
  await productRepository?.save({ ...sampleProduct1 });
  await productRepository?.save({ ...sampleProduct2 });
  await productRepository?.save({ ...expiredProduct });
});

afterAll(async () => {
  await cleanDatabase();
  server.close();
});

describe('Get single product', () => {
  it('should get a single product', async () => {
    const response = await request(app)
      .get(`/product/${product1Id}`)
      .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.product).toBeDefined();
    expect(response.body.product.id).toBe(product1Id);
  });

  it('should return 400 if product is expired', async () => {
    const response = await request(app)
      .get(`/product/${expiredProductId}`)
      .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Product expired');
  });

  it('should return 400 for invalid product id', async () => {
    const response = await request(app)
      .get(`/product/${InvalidID}`)
      .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Product not found');
  });

    it('should return 404 if product not found', async () => {
        const response = await request(app)
          .get(`/product/${InvalidID}`)
          .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

        expect(response.status).toBe(404);
  });
});

describe('GET / product search', () => {
  it('should sort products by newPrice in descending order', async () => {
    const response = await request(app)
      .get(`/product/search/`)
      .query({ name: 'test', sortBy: 'newPrice', sortOrder: 'DESC' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveLength(2);
  });

  it('should return 400 if no name is provided', async () => {
    const response = await request(app)
      .get(`/product/search/`)
      .query({ name: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Please provide a search term');
  });

  it('should return a 404 error if no products are found', async () => {
    const response = await request(app)
      .get('/product/search')
      .query({ name: 'nonexistentproduct' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('No products found');
  });
});
