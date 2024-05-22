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
const vendor2Id = uuid();
const buyer1Id = uuid();
const product1Id = uuid();
const product2Id = uuid();
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
  firstName: 'vendor1',
  lastName: 'user',
  email: 'vendor1@example.com',
  password: 'password',
  userType: 'Vendor',
  gender: 'Male',
  phoneNumber: '126380996347',
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

const sampleVendor2: UserInterface = {
  id: vendor2Id,
  firstName: 'vendor2',
  lastName: 'user',
  email: 'vendor2@example.com',
  password: 'password',
  userType: 'Vendor',
  gender: 'Male',
  phoneNumber: '1638099634',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'VENDOR',
};

const sampleCat = {
  id: catId,
  name: 'accessories',
};

const sampleProduct1 = {
  id: product1Id,
  name: 'test product',
  description: 'amazing product',
  images: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
  newPrice: 200,
  quantity: 10,
  vendor: sampleVendor1,
  categories: [sampleCat],
};

const sampleProduct2 = {
  id: product2Id,
  name: 'test product2',
  description: 'amazing product2',
  images: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg'],
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
  await userRepository?.save({ ...sampleVendor2 });
  await userRepository?.save({ ...sampleBuyer1 });

  const productRepository = connection?.getRepository(Product);
  await productRepository?.save({ ...sampleProduct1 });
  await productRepository?.save({ ...sampleProduct2 });
});

afterAll(async () => {
  await cleanDatabase();

  server.close();
});

describe('Vendor product management tests', () => {
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
    }, 60000);

    it('return an error if the number of product images exceeds 6', async () => {
      const response = await request(app)
        .post(`/product/`)
        .field('name', 'test-product-images')
        .field('description', 'amazing product3')
        .field('newPrice', 200)
        .field('quantity', 10)
        .field('expirationDate', '10-2-2023')
        .field('categories', 'technology')
        .field('categories', 'sample')
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Product cannot have more than 6 images');
    });

    it('should not create new product it already exist', async () => {
      const response = await request(app)
        .post('/product')
        .field('name', 'test product3')
        .field('description', 'amazing product3')
        .field('newPrice', 200)
        .field('quantity', 10)
        .field('categories', sampleCat.name)
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(409);
    });

    it('should not create new product, if there are missing field data', async () => {
      const response = await request(app)
        .post('/product')
        .field('description', 'amazing product3')
        .field('newPrice', 200)
        .field('quantity', 10)
        .field('categories', sampleCat.name)
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
    });

    it('should not create new product, images are not at least more than 1', async () => {
      const response = await request(app)
        .post('/product')
        .field('name', 'test-product-image')
        .field('description', 'amazing product3')
        .field('newPrice', 200)
        .field('quantity', 10)
        .field('categories', sampleCat.name)
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
    });
  });

  describe('Updating existing product', () => {
    it('return error, if there are missing field data', async () => {
      const response = await request(app)
        .put(`/product/${sampleProduct2.id}`)
        .field('newPrice', 200)
        .field('quantity', 10)
        .field('expirationDate', '10-2-2023')
        .field('categories', 'technology')
        .field('categories', 'sample')
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
    });

    it('return error, if product do not exist', async () => {
      const response = await request(app)
        .put(`/product/${uuid()}`)
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

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Product not found');
    });

    it('return an error if the number of product images exceeds 6', async () => {
      const response = await request(app)
        .put(`/product/${sampleProduct2.id}`)
        .field('name', 'test product3')
        .field('description', 'amazing product3')
        .field('newPrice', 200)
        .field('quantity', 0)
        .field('expirationDate', '10-2-2023')
        .field('categories', 'technology')
        .field('categories', 'sample')
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .attach('images', `${__dirname}/test-assets/photo2.webp`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Product cannot have more than 6 images');
    });

    it('should update the product', async () => {
      const response = await request(app)
        .put(`/product/${sampleProduct2.id}`)
        .field('name', 'test product3 updated')
        .field('description', 'amazing product3')
        .field('newPrice', 200)
        .field('oldPrice', 100)
        .field('quantity', 10)
        .field('expirationDate', '10-2-2023')
        .field('categories', 'tech')
        .field('categories', 'sample')
        .attach('images', `${__dirname}/test-assets/photo1.png`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Retrieving all vendor product', () => {
    it('should retrieve all product belong to logged vendor', async () => {
      const response = await request(app)
        .get('/product/collection')
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.products).toBeDefined;
    });

    it('should not return any product for a vendor with zero product in stock', async () => {
      const response = await request(app)
        .get(`/product/collection`)
        .set('Authorization', `Bearer ${getAccessToken(vendor2Id, sampleVendor2.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.products).toBeUndefined;
    });

    it('should not return any product for incorrect syntax of input', async () => {
      const response = await request(app)
        .get(`/product/collection?page=sdfsd`)
        .set('Authorization', `Bearer ${getAccessToken(vendor2Id, sampleVendor2.email)}`);

      expect(response.status).toBe(400);
      expect(response.body).toBeUndefined;
    });
  });

  describe('Retrieving single vendor product', () => {
    it('should retrieve single product for the user', async () => {
      const response = await request(app)
        .get(`/product/collection/${product1Id}`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.product).toBeDefined;
    });

    it('should not return any product if product1Id do not exist', async () => {
      const response = await request(app)
        .get(`/product/collection/${uuid()}`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(404);
      expect(response.body.product).toBeUndefined;
    });

    it('should not return any product for incorrect syntax of input', async () => {
      const response = await request(app)
        .get(`/product/collection/id`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.product).toBeUndefined;
    });
  });

  describe('Removing product image', () => {
    it('should remove one image', async () => {
      const response = await request(app)
        .delete(`/product/images/${sampleProduct1.id}`)
        .send({
          image: sampleProduct1.images[2],
        })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(200);
    });

    it('return error, if no image to remove provided', async () => {
      const response = await request(app)
        .delete(`/product/images/${sampleProduct1.id}`)

        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Please provide an image to remove');
    });

    it("return error, if product doesn't exist", async () => {
      const response = await request(app)
        .delete(`/product/images/${uuid()}`)
        .send({
          image: sampleProduct1.images[2],
        })

        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Product not found');
    });

    it('return error, if product has only 2 images', async () => {
      const response = await request(app)
        .delete(`/product/images/${sampleProduct1.id}`)
        .send({
          image: sampleProduct1.images[0],
        })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Product must have at least two image');
    });

    it("return error, if image to remove deosn't exist", async () => {
      const response = await request(app)
        .delete(`/product/images/${sampleProduct1.id}`)
        .send({
          image: 'image',
        })
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Image not found');
    });
  });

  describe('Deleting a vendor product', () => {
    it('should delete a product for the vendor', async () => {
      const response = await request(app)
        .delete(`/product/${product2Id}`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(200);
    });

    it('should return error for non existing products', async () => {
      const response = await request(app)
        .delete(`/product/${uuid()}`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(404);
    });

    it('should return error for invalid input syntax', async () => {
      const response = await request(app)
        .delete(`/product/product2Id`)
        .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

      expect(response.status).toBe(400);
    });
  });

  describe('Retrieving recommended products', () => {
    it('should retrieve  products', async () => {
      const response = await request(app)
        .get('/product/recommended')
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined;
    });

    it('should not return any product for a vendor with zero product in stock', async () => {
      const response = await request(app)
        .get(`/product/recommended`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.products).toBeUndefined;
    });

    it('should not return any product for incorrect syntax of input', async () => {
      const response = await request(app)
        .get(`/product/recommended?page=sdfsd`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(400);
      expect(response.body).toBeUndefined;
    });
  });

  describe('List all products service', () => {
    it('should return all products for a given category', async () => {
      const response = await request(app).get('/product/all');

      expect(response.status).toBe(200);
      expect(response.body.data.products).toBeDefined();
    });

    it('should return no products for a non-existent category', async () => {
      const response = await request(app)
        .get('/product/all')
        .query({ page: 1, limit: 10, category: 'nonexistentcategory' });

      expect(response.status).toBe(200);
      expect(response.body.data.products).toBeUndefined();
    });

    it('should return an error for invalid input syntax', async () => {
      const response = await request(app)
        .get('/product/all')
        .query({ page: 'invalid', limit: 'limit', category: 'technology' });

      expect(response.status).toBe(400);
    });
  });
});
