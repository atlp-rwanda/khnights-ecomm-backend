import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import { getConnection } from 'typeorm';
import { dbConnection } from '../startups/dbConnection';
import { User } from '../entities/User';
import { v4 as uuid } from 'uuid';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';

const vendor1Id = uuid();
const vendor2Id = uuid();
const vendor3Id = uuid();
const product1Id = uuid();
const product2Id = uuid();
const product3Id = uuid();
const product4Id = uuid();
const product5Id = uuid();
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

const sampleVendor1 = new User();
sampleVendor1.id = vendor1Id;
sampleVendor1.firstName = 'vendor1';
sampleVendor1.lastName = 'user';
sampleVendor1.email = 'vendora1@example.com';
sampleVendor1.password = 'password';
sampleVendor1.userType = 'Vendor';
sampleVendor1.gender = 'Male';
sampleVendor1.phoneNumber = '126380996347';
sampleVendor1.photoUrl = 'https://example.com/photo.jpg';
sampleVendor1.role = 'VENDOR';

const sampleVendor2 = new User();
sampleVendor2.id = vendor2Id;
sampleVendor2.firstName = 'vendor2';
sampleVendor2.lastName = 'user';
sampleVendor2.email = 'vendora2@example.com';
sampleVendor2.password = 'password';
sampleVendor2.userType = 'Vendor';
sampleVendor2.gender = 'Male';
sampleVendor2.phoneNumber = '1638099634';
sampleVendor2.photoUrl = 'https://example.com/photo.jpg';
sampleVendor2.role = 'VENDOR';

const sampleVendor3 = new User();
sampleVendor3.id = vendor3Id;
sampleVendor3.firstName = 'vendor3 ddss';
sampleVendor3.lastName = 'user';
sampleVendor3.email = 'vendor2@example.com';
sampleVendor3.password = 'password';
sampleVendor3.userType = 'Vendor';
sampleVendor3.gender = 'Male';
sampleVendor3.phoneNumber = '1638099634';
sampleVendor3.photoUrl = 'https://example.com/photo.jpg';
sampleVendor3.role = 'VENDOR';

const sampleCat = new Category();
sampleCat.id = catId;
sampleCat.name = 'accessories';

const sampleProduct1 = new Product();
sampleProduct1.id = product1Id;
sampleProduct1.name = 'test product';
sampleProduct1.description = 'amazing product';
sampleProduct1.images = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
sampleProduct1.newPrice = 200;
sampleProduct1.quantity = 10;
sampleProduct1.vendor = sampleVendor1;
sampleProduct1.categories = [sampleCat];

const sampleProduct2 = new Product();
sampleProduct2.id = product2Id;
sampleProduct2.name = 'test product2';
sampleProduct2.description = 'amazing product2';
sampleProduct2.images = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg'];
sampleProduct2.newPrice = 200;
sampleProduct2.quantity = 10;
sampleProduct2.vendor = sampleVendor1;
sampleProduct2.categories = [sampleCat];

const sampleProduct3 = new Product();
sampleProduct3.id = product3Id;
sampleProduct3.name = 'testing product3';
sampleProduct3.description = 'amazing product3';
sampleProduct3.images = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg'];
sampleProduct3.newPrice = 200;
sampleProduct3.quantity = 10;
sampleProduct3.vendor = sampleVendor2;
sampleProduct3.categories = [sampleCat];

const sampleProduct4 = new Product();
sampleProduct4.id = product4Id;
sampleProduct4.name = 'testingmkknkkjiproduct4';
sampleProduct4.description = 'amazing product4';
sampleProduct4.images = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg'];
sampleProduct4.newPrice = 200;
sampleProduct4.quantity = 10;
sampleProduct4.vendor = sampleVendor2;
sampleProduct4.categories = [sampleCat];

const sampleProduct5 = new Product();
sampleProduct5.id = product5Id;
sampleProduct5.name = 'Here is testing with product5';
sampleProduct5.description = 'amazing product5';
sampleProduct5.images = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg'];
sampleProduct5.newPrice = 20;
sampleProduct5.quantity = 10;
sampleProduct5.vendor = sampleVendor1;
sampleProduct5.categories = [sampleCat];
beforeAll(async () => {
  const connection = await dbConnection();

  const categoryRepository = connection?.getRepository(Category);
  const savedCategory = await categoryRepository?.save({ ...sampleCat });

  const userRepository = connection?.getRepository(User);
  const savedVendor1 = await userRepository?.save({ ...sampleVendor1 });
  const savedVendor2 = await userRepository?.save({ ...sampleVendor2 });

  const productRepository = connection?.getRepository(Product);
  await productRepository?.save({ ...sampleProduct1, vendor: savedVendor1, categories: [savedCategory as Category] });
  await productRepository?.save({ ...sampleProduct2, vendor: savedVendor1, categories: [savedCategory as Category] });
  await productRepository?.save({ ...sampleProduct3, vendor: savedVendor2, categories: [savedCategory as Category] });
  await productRepository?.save({ ...sampleProduct5, vendor: savedVendor1, categories: [savedCategory as Category] });

  sampleProduct2.expirationDate = new Date(2020 - 3 - 24);
  productRepository?.save(sampleProduct2);

  sampleProduct5.quantity = 0;
  productRepository?.save(sampleProduct5);
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

describe('Vendor product availability status management tests', () => {
  it('Should update product availability status', async () => {
    const response = await request(app)
      .put(`/product/availability/${product1Id}`)
      .send({
        isAvailable: false,
      })
      .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.message).toBe('Product status updated successfully');
  }, 10000);

  it('should auto update product status to false if product is expired', async () => {
    const response = await request(app)
      .put(`/product/availability/${product2Id}`)
      .send({
        isAvailable: true,
      })
      .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.data.message).toBe('Product status is set to false because it is expired.');
  });

  it('should update product status to false if product is out of stock', async () => {
    const response = await request(app)
      .put(`/product/availability/${product5Id}`)
      .send({
        isAvailable: true,
      })
      .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

    expect(response.statusCode).toBe(202);
    expect(response.body.data.message).toBe('Product status is set to false because it is out of stock.');
  });

  it('should not update product status if it is already updated', async () => {
    const response = await request(app)
      .put(`/product/availability/${product1Id}`)
      .send({
        isAvailable: false,
      })
      .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

    expect(response.statusCode).toBe(400);
  });

  it("should not update product status if it doesn't exists", async () => {
    const response = await request(app)
      .put(`/product/availability/${product4Id}`)
      .send({
        isAvailable: true,
      })
      .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Product not found');
  });

  it('should not update product which is not in VENDOR s stock', async () => {
    const response = await request(app)
      .put(`/product/availability/${product3Id}`)
      .send({
        isAvailable: true,
      })
      .set('Authorization', `Bearer ${getAccessToken(vendor1Id, sampleVendor1.email)}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Product not found in your stock');
  });
});


describe('search product by name availability tests', () => {
  it('Should search product by name', async () => {
    const response = await request(app)
      .get(`/product/search?name=testingmkknkkjiproduct4`)
    expect(response.body.data).toBeDefined;
  }, 10000);

  it('should return empty array if there is product is not found in the database', async () => {
    const response = await request(app)
      .put(`/product/search?name=home`)


    expect(response.statusCode).toBe(401);
    expect(response.body.data).toBeUndefined;
  });

  });

