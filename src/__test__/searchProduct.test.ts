import { Product } from '../entities/Product';
import { app, server } from '../index';
import { dbConnection } from '../startups/dbConnection';
import { User, UserInterface } from '../entities/User';
import { v4 as uuid } from 'uuid';
import { Category } from '../entities/Category';
import { cleanDatabase } from './test-assets/DatabaseCleanup';

import { searchProductService } from '../services/productServices/searchProduct';

const vendor1Id = uuid();
const vendor2Id = uuid();
const buyerId = uuid();
const product1Id = uuid();
const product2Id = uuid();
const product3Id = uuid();
const catId = uuid();

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

const sampleVendor2: UserInterface = {
  id: vendor2Id,
  firstName: 'vendor2o',
  lastName: 'user',
  email: 'vendor20@example.com',
  password: 'password',
  userType: 'Vendor',
  gender: 'Female',
  phoneNumber: '1234567890',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'VENDOR',
};

const sampleBuyer1: UserInterface = {
  id: buyerId,
  firstName: 'buyer1o',
  lastName: 'user',
  email: 'buyer10@example.com',
  password: 'password',
  userType: 'Buyer',
  gender: 'Male',
  phoneNumber: '000380996348',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'BUYER',
};

const sampleCat: Category = {
  id: catId,
  name: 'accessories',
} as Category;

const sampleProduct1: Product = {
  id: product1Id,
  name: 'Product A',
  description: 'Amazing product A',
  images: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
  newPrice: 100,
  quantity: 10,
  vendor: sampleVendor1,
  categories: [sampleCat],
} as Product;

const sampleProduct2: Product = {
  id: product2Id,
  name: 'Product B',
  description: 'Amazing product B',
  images: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
  newPrice: 200,
  quantity: 20,
  vendor: sampleVendor1,
  categories: [sampleCat],
} as Product;

const sampleProduct3: Product = {
  id: product3Id,
  name: 'Product C',
  description: 'Amazing product C',
  images: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
  newPrice: 300,
  quantity: 30,
  vendor: sampleVendor2,
  categories: [sampleCat],
} as Product;

beforeAll(async () => {
  const connection = await dbConnection();

  const categoryRepository = connection?.getRepository(Category);
  await categoryRepository?.save(sampleCat);

  const userRepository = connection?.getRepository(User);
  await userRepository?.save(sampleVendor1);
  await userRepository?.save(sampleVendor2);
  await userRepository?.save(sampleBuyer1);

  const productRepository = connection?.getRepository(Product);
  await productRepository?.save(sampleProduct1);
  await productRepository?.save(sampleProduct2);
  await productRepository?.save(sampleProduct3);
});

afterAll(async () => {
  await cleanDatabase();
  server.close();
});

describe('searchProductService', () => {
  it('should return all products without filters', async () => {
    const result = await searchProductService({});
    expect(result.data.length).toBe(3);
    expect(result.pagination.totalItems).toBe(3);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('should return products matching the name filter', async () => {
    const result = await searchProductService({ name: 'Product A' });
    expect(result.data.length).toBe(1);
    expect(result.data[0].name).toBe('Product A');
    expect(result.pagination.totalItems).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('should return sorted products by price in descending order', async () => {
    const result = await searchProductService({ sortBy: 'newPrice', sortOrder: 'DESC' });
    expect(result.data.length).toBe(3);
    expect(result.data[0].newPrice).toBe("300");
    expect(result.data[1].newPrice).toBe("200");
    expect(result.data[2].newPrice).toBe("100");
  });

  it('should return paginated results', async () => {
    const result = await searchProductService({ page: 1, limit: 2 });
    expect(result.data.length).toBe(2);
    expect(result.pagination.totalItems).toBe(3);
    expect(result.pagination.totalPages).toBe(2);

    const resultPage2 = await searchProductService({ page: 2, limit: 2 });
    expect(resultPage2.data.length).toBe(1);
    expect(resultPage2.pagination.currentPage).toBe(2);
  });

  it('should handle sorting and pagination together', async () => {
    const result = await searchProductService({ sortBy: 'newPrice', sortOrder: 'ASC', page: 1, limit: 2 });
    expect(result.data.length).toBe(2);
    expect(result.data[0].newPrice).toBe("100");
    expect(result.data[1].newPrice).toBe("200");

    const resultPage2 = await searchProductService({ sortBy: 'newPrice', sortOrder: 'ASC', page: 2, limit: 2 });
    expect(resultPage2.data.length).toBe(1);
    expect(resultPage2.data[0].newPrice).toBe("300");
  });
});
