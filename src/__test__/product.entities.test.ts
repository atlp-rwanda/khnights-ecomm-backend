import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { Product } from '../entities/Product';
import { User } from '../entities/User';
import { Category } from '../entities/Category';
import { Coupon } from '../entities/coupon';
import { v4 as uuid } from 'uuid';
import { cleanDatabase } from './test-assets/DatabaseCleanup';
import { dbConnection } from '../startups/dbConnection';
import { server } from '../index';

// Sample data
const catId = uuid();
const vendor3Id = uuid();
const product1Id = uuid();
const product2Id = uuid();
const couponId1 = uuid();
const couponId2 = uuid();
const couponCode1 = 'DISCOUNT10';
const couponCode2 = 'DISCOUNT20';

if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASS) throw new Error('TEST_USER_PASS or TEST_USER_EMAIL not set in .env');

const sampleVendor3 = new User();
sampleVendor3.id = vendor3Id;
sampleVendor3.firstName = 'Vendor3';
sampleVendor3.lastName = 'User';
sampleVendor3.email = process.env.TEST_USER_EMAIL;
sampleVendor3.password = process.env.TEST_USER_PASS;
sampleVendor3.userType = 'Vendor';
sampleVendor3.gender = 'Male';
sampleVendor3.phoneNumber = '32638099634';
sampleVendor3.photoUrl = 'https://example.com/photo.jpg';
sampleVendor3.role = 'VENDOR';

const sampleProduct1 = new Product();
sampleProduct1.id = product1Id;
sampleProduct1.name = 'Test Product 1';
sampleProduct1.description = 'Amazing product 1';
sampleProduct1.images = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
sampleProduct1.newPrice = 200;
sampleProduct1.quantity = 10;
sampleProduct1.vendor = sampleVendor3;

const sampleProduct2 = new Product();
sampleProduct2.id = product2Id;
sampleProduct2.name = 'Test Product 2';
sampleProduct2.description = 'Amazing product 2';
sampleProduct2.images = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
sampleProduct2.newPrice = 250;
sampleProduct2.quantity = 15;
sampleProduct2.vendor = sampleVendor3;

const sampleCoupon1 = new Coupon();
sampleCoupon1.id = couponId1;
sampleCoupon1.code = couponCode1;
sampleCoupon1.discountRate = 20;
sampleCoupon1.expirationDate = new Date('2025-01-01');
sampleCoupon1.maxUsageLimit = 100;
sampleCoupon1.discountType = 'percentage';
sampleCoupon1.product = sampleProduct1;
sampleCoupon1.vendor = sampleVendor3;

const sampleCoupon2 = new Coupon();
sampleCoupon2.id = couponId2;
sampleCoupon2.code = couponCode2;
sampleCoupon2.discountRate = 15;
sampleCoupon2.expirationDate = new Date('2025-01-01');
sampleCoupon2.maxUsageLimit = 50;
sampleCoupon2.discountType = 'percentage';
sampleCoupon2.product = sampleProduct2;
sampleCoupon2.vendor = sampleVendor3;

const sampleCat = {
  id: catId,
  name: 'accessories',
};

let productRepository: Repository<Product>;
let userRepository: Repository<User>;
let categoryRepository: Repository<Category>;
let couponRepository: Repository<Coupon>;

beforeAll(async () => {
  const connection = await dbConnection();
  if (!connection) {
    console.error('Failed to connect to the database');
    return;
  }

  userRepository = connection.getRepository(User);
  categoryRepository = connection.getRepository(Category);
  couponRepository = connection.getRepository(Coupon);
  productRepository = connection.getRepository(Product);

  await userRepository.save(sampleVendor3);
  await categoryRepository.save(sampleCat);

  const category1 = categoryRepository.create({ name: 'Category 1' });
  const category2 = categoryRepository.create({ name: 'Category 2' });
  await categoryRepository.save([category1, category2]);

  sampleProduct1.categories = [category1];
  sampleProduct2.categories = [category2];
  await productRepository.save([sampleProduct1, sampleProduct2]);
  await couponRepository.save([sampleCoupon1, sampleCoupon2]);
});

afterAll(async () => {
  await cleanDatabase();
  const connection = await dbConnection();
  if (connection) {
    await connection.close();
  }
  server.close();
});

describe('Product Entity', () => {
  it('should create all entities related to product entity', async () => {
    const product = await productRepository.save(sampleProduct2);
    expect(product).toBeDefined();
  });

  it('should not validate a product with missing required fields', async () => {
    const product = new Product();
    const errors = await validate(product);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should enforce array constraints on images', async () => {
    const product = productRepository.create({
      id: uuid(),
      vendor: sampleVendor3,
      name: 'Sample Product',
      description: 'This is a sample product',
      images: [],
      newPrice: 100.0,
      quantity: 10,
      isAvailable: true,
    });

    const errors = await validate(product);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.arrayNotEmpty).toBeDefined();
  });

  it('should handle relationships correctly', async () => {
    const category1 = await categoryRepository.findOne({ where: { name: 'Category 1' } });
    const category2 = await categoryRepository.findOne({ where: { name: 'Category 2' } });

    const product = productRepository.create({
      id: uuid(),
      vendor: sampleVendor3,
      name: 'Sample Product',
      description: 'This is a sample product',
      images: ['image1.jpg', 'image2.jpg'],
      newPrice: 100.0,
      quantity: 10,
      isAvailable: true,
      categories: [category1 as Category, category2 as Category],
    });

    await productRepository.save(product);

    const savedProduct = await productRepository.findOne({
      where: { id: product.id },
      relations: ['vendor', 'categories', 'coupons'],
    });

    expect(savedProduct).toBeDefined();
    expect(savedProduct?.vendor).toBeDefined();
    expect(savedProduct?.categories).toBeDefined();
  });
});