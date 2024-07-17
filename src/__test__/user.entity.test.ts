import { validate } from 'class-validator';
import { getConnection, Repository } from 'typeorm';
import { User, UserInterface } from '../entities/User';
import { Order } from '../entities/Order';
import { Transaction } from '../entities/transaction';
import { Product } from '../entities/Product'; 
import { OrderItem } from '../entities/OrderItem';
import { VendorOrderItem } from '../entities/VendorOrderItem';
import { VendorOrders } from '../entities/vendorOrders';
import { Category } from '../entities/Category';
import { cleanDatabase } from './test-assets/DatabaseCleanup';
import { server } from '../index';
import { v4 as uuid } from 'uuid';
import { dbConnection } from '../startups/dbConnection';

const adminId = uuid();
const vendorId = uuid();
const vendor2Id = uuid();
const buyerId = uuid();
const productId = uuid();
const orderId = uuid();
const order2Id = uuid();
const orderItemId = uuid();
const vendorOrderId = uuid();
const vendorOrderItemId = uuid();
const vendorOrder2Id = uuid();
const catId = uuid();

if (!process.env.TEST_USER_EMAIL 
  || !process.env.TEST_BUYER_EMAIL 
  || !process.env.TEST_VENDOR1_EMAIL 
  || !process.env.TEST_VENDOR_EMAIL 
  || !process.env.TEST_USER_PASS) throw new Error('TEST_USER_PASS or TEST_USER_EMAIL not set in .env');

const sampleAdmin: UserInterface = {
  id: adminId,
  firstName: 'admin',
  lastName: 'user',
  email:process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASS,
  userType: 'Admin',
  gender: 'Male',
  phoneNumber: '126380997',
  photoUrl: 'https://example.com/photo.jpg',
  verified: true,
  role: 'ADMIN',
};
const sampleVendor: UserInterface = {
  id: vendorId,
  firstName: 'vendor',
  lastName: 'user',
  email:process.env.TEST_VENDOR_EMAIL,
  password: process.env.TEST_USER_PASS,
  userType: 'Vendor',
  gender: 'Male',
  phoneNumber: '126380996347',
  photoUrl: 'https://example.com/photo.jpg',
  verified: true,
  role: 'VENDOR',
};
const sampleVendor2: UserInterface = {
  id: vendor2Id,
  firstName: 'vendor',
  lastName: 'user',
  email: process.env.TEST_VENDOR1_EMAIL,
  password: process.env.TEST_USER_PASS,
  userType: 'Vendor',
  gender: 'Male',
  phoneNumber: '18090296347',
  photoUrl: 'https://example.com/photo.jpg',
  verified: true,
  role: 'VENDOR',
};
const sampleBuyer: UserInterface = {
  id: buyerId,
  firstName: 'buyer',
  lastName: 'user',
  email: process.env.TEST_BUYER_EMAIL,
  password: process.env.TEST_USER_PASS,
  userType: 'Buyer',
  gender: 'Male',
  phoneNumber: '6380996347',
  photoUrl: 'https://example.com/photo.jpg',
  verified: true,
  role: 'BUYER',
};
const sampleCat = {
  id: catId,
  name: 'accessories',
};

const sampleProduct = {
  id: productId,
  name: 'test product',
  description: 'amazing product',
  images: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
  newPrice: 200,
  quantity: 10,
  vendor: sampleVendor,
  categories: [sampleCat],
};
const sampleOrder = {
  id: orderId,
  totalPrice: 400,
  quantity: 2,
  orderDate: new Date(),
  buyer: sampleBuyer,
  cartId:uuid(),
  orderStatus: 'received',
  address: 'Rwanda, Kigali, KK20st',
};
const sampleOrderItem = {
  id: orderItemId,
  price: 200,
  quantity: 2,
  order: sampleOrder,
  product: sampleProduct,
};
const sampleVendorOrder = {
  id: vendorOrderId,
  totalPrice: 400,
  quantity: 2,
  vendor: sampleVendor,
  order: sampleOrder,
  buyer: sampleBuyer,
  orderStatus: 'pending',
};
const sampleVendorOrderItem = {
  id: vendorOrderItemId,
  "price/unit": 200,
  quantity: 2,
  order: sampleVendorOrder,
  product: sampleProduct,
};

let userRepository: Repository<User>;
let orderRepository: Repository<Order>;
let transactionRepository: Repository<Transaction>;

beforeAll(async () => {
  const connection = await dbConnection();
  if (!connection) {
    console.error('Failed to connect to the database');
    return;
  }

  userRepository = connection.getRepository(User);
  orderRepository = connection.getRepository(Order);
  transactionRepository = connection.getRepository(Transaction);

  const categoryRepository = connection.getRepository(Category);
  await categoryRepository.save(sampleCat);

  await userRepository.save([sampleAdmin, sampleVendor, sampleVendor2, sampleBuyer]);

  const productRepository = connection.getRepository(Product);
  await productRepository.save(sampleProduct);

  await orderRepository.save(sampleOrder);

  const orderItemRepository = connection.getRepository(OrderItem);
  await orderItemRepository.save(sampleOrderItem);

  const vendorOrderRepository = connection.getRepository(VendorOrders);
  await vendorOrderRepository.save(sampleVendorOrder);

  const vendorOrderItemRepository = connection.getRepository(VendorOrderItem);
  await vendorOrderItemRepository.save(sampleVendorOrderItem);
});

afterAll(async () => {
  await cleanDatabase();
  const connection = getConnection();
  if (connection.isConnected) {
    await connection.close();
  }
  server.close();
});

describe('User Entity', () => {
  it('should validate a valid user', async () => {
    const user = userRepository.create({
      id: uuid(),
      firstName: 'John',
      lastName: 'Doe',
      email: process.env.TEST_SAMPLE_BUYER_EMAIL,
      password: process.env.TEST_USER_PASS,
      gender: 'male',
      phoneNumber: '1234567890',
      verified: true,
      status: 'active',
      userType: 'Buyer',
      twoFactorEnabled: false,
      accountBalance: 0.0,
    });

    const errors = await validate(user);
    expect(errors.length).toBe(0);

    const savedUser = await userRepository.save(user);
    expect(savedUser.id).toBeDefined();
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });

  it('should not validate a user with missing required fields', async () => {
    const user = new User();

    const errors = await validate(user);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should set the role based on userType', async () => {
    const user = userRepository.create({
      id: vendorOrder2Id,
      firstName: 'Jane',
      lastName: 'Doe',
      email: process.env.TEST_VENDOR2_EMAIL,
      password: process.env.TEST_USER_PASS,
      gender: 'female',
      phoneNumber: '0987654321',
      userType: 'Vendor',
    });

    await userRepository.save(user);
    expect(user.role).toBe('VENDOR');
  });

  it('should handle relationships correctly', async () => {
    const user = userRepository.create({
      id: uuid(),
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      password: process.env.TEST_USER_PASS,
      gender: 'female',
      phoneNumber: '1122334455',
      userType: 'Buyer',
    });

    const savedUser = await userRepository.save(user);

    const order = orderRepository.create({
      id: order2Id,
      totalPrice: 400,
      quantity: 2,
      orderDate: new Date(),
      buyer: savedUser,
      orderStatus: 'order placed',
      address: 'Rwanda, Kigali, KK20st',
      cartId: uuid(),
    });

    const savedOrder = await orderRepository.save(order);

    const transaction = transactionRepository.create({
      id: uuid(),
      order: savedOrder,
      user: savedUser,
      product: sampleProduct,
      amount: 400,
      previousBalance: 0,
      currentBalance: 400,
      type: 'credit',
      description: 'order placed',
    });

    await transactionRepository.save(transaction);

    const foundUser = await userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['orders', 'transactions'],
    });

    expect(foundUser).toBeDefined();
    expect(foundUser?.orders.length).toBe(1);
    expect(foundUser?.transactions.length).toBe(1);
  });
});