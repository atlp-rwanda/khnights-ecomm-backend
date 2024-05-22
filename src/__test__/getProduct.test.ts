import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import { getConnection } from 'typeorm';
import { dbConnection } from '../startups/dbConnection';
import { User, UserInterface } from '../entities/User';
import { v4 as uuid } from 'uuid';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';

const vendor1Id = uuid();
const product1Id = uuid();
const Invalidproduct = '11278df2-d026-457a-9471-4749f038df68';
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

beforeAll(async () => {
  const connection = await dbConnection();

  const categoryRepository = connection?.getRepository(Category);
  await categoryRepository?.save({ ...sampleCat });

  const userRepository = connection?.getRepository(User);
  await userRepository?.save({ ...sampleVendor1 });

  const productRepository = connection?.getRepository(Product);
  await productRepository?.save({ ...sampleProduct1 });
});

afterAll(async () => {
  const connection = getConnection();
  const userRepository = connection.getRepository(User);
  const categoryRepository = connection.getRepository(Category);

  const productRepository = await connection.getRepository(Product).delete({});
  if (productRepository) {
    await userRepository.delete({});
    await categoryRepository.delete({});
  }
  await connection.close();
  server.close();
});

describe('Creating new product', () => {
  it('should create new product', async () => {
    const response = await request(app)
      .post('/product')
      .field('name', 'test product3')
      .field('description', 'amazing product3')
      .field('newPrice', 200)
      .field('quantity', 10)
      .field('expirationDate', '10-2-2023')
      .field('categories', 'technology')
      .field('categories', 'sample')
      .attach('images', `${__dirname}/test-assets/photo1.png`)
      .attach('images', `${__dirname}/test-assets/photo2.webp`)
      .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

    expect(response.status).toBe(201);
    expect(response.body.data.product).toBeDefined;
  }, 20000);
});
describe('Get single product', () => {
  it('should get a single product', async () => {
    const response = await request(app)
      .get(`/product/${product1Id}`)
      .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.product).toBeDefined;
    expect(response.body.product.id).toBe(product1Id);
  }, 10000);

  it('should return 400 for invalid product Id', async () => {
    const response = await request(app)
      .get(`/product/non-existing-id`)
      .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Invalid product ID');
  }, 10000);
  it('should return 404 for  product not found', async () => {
    const response = await request(app)
      .get(`/product/${Invalidproduct}`)
      .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Product not found');
  }, 10000);
});
