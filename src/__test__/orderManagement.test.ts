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
import { Order } from '../entities/Order';
import { OrderItem } from '../entities/OrderItem';
import { VendorOrders } from '../entities/vendorOrders';
import { VendorOrderItem } from '../entities/VendorOrderItem';

const adminId = uuid();
const vendorId = uuid();
const vendor2Id = uuid();
const buyerId = uuid();

const productId = uuid();
const product2Id = uuid();

const orderId = uuid();
const orderItemId = uuid();
const order2Id = uuid();
const order2ItemId = uuid();

const vendorOrderId = uuid();
const vendorOrderItemId = uuid();
const vendorOrder2Id = uuid();
const vendorOrder2ItemId = uuid();
const catId = uuid();

console.log(adminId, vendorId, buyerId);

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

const sampleAdmin: UserInterface = {
  id: adminId,
  firstName: 'admin',
  lastName: 'user',
  email: 'admin@example.com',
  password: 'password',
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
  email: 'vendor@example.com',
  password: 'password',
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
  email: 'vendor2@example.com',
  password: 'password',
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
  email: 'buyer@example.com',
  password: 'password',
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
const sampleProduct2 = {
  id: product2Id,
  name: 'test product2',
  description: 'amazing products',
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
  orderStatus: 'received',
  address: 'Rwanda, Kigali, KK20st',
  cartId: uuid()
};
const sampleOrder2 = {
  id: order2Id,
  totalPrice: 400,
  quantity: 2,
  orderDate: new Date(),
  buyer: sampleBuyer,
  orderStatus: 'order placed',
  address: 'Rwanda, Kigali, KK20st',
  cartId: uuid()
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
  'id': vendorOrderItemId,
  'price/unit': 200,
  'quantity': 2,
  'order': sampleVendorOrder,
  'product': sampleProduct,
};

beforeAll(async () => {
  const connection = await dbConnection();

  const categoryRepository = connection?.getRepository(Category);
  await categoryRepository?.save({ ...sampleCat });

  const userRepository = connection?.getRepository(User);
  await userRepository?.save([sampleAdmin, sampleVendor, sampleVendor2, sampleBuyer]);

  const productRepository = connection?.getRepository(Product);
  await productRepository?.save({ ...sampleProduct });

  // Order Management
  const orderRepository = connection?.getRepository(Order);
  await orderRepository?.save([sampleOrder, sampleOrder2]);

  const orderItemRepository = connection?.getRepository(OrderItem);
  await orderItemRepository?.save({ ...sampleOrderItem });

  const vendorOrderRepository = connection?.getRepository(VendorOrders);
  await vendorOrderRepository?.save({ ...sampleVendorOrder });

  const vendorOrderItemRepository = connection?.getRepository(VendorOrderItem);
  await vendorOrderItemRepository?.save({ ...sampleVendorOrderItem });
});

afterAll(async () => {
  await cleanDatabase();
  server.close();
});

describe('Vendor Order Management', () => {
  describe('Fetching vendor Order(s)', () => {
    it('Should return all vendor orders', async () => {
      const response = await request(app)
        .get('/product/vendor/orders')
        .set('Authorization', `Bearer ${getAccessToken(vendorId, sampleVendor.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.orders).toBeDefined();
    });

    it("Should return empty array if vendor don't have any order for buyer", async () => {
      const response = await request(app)
        .get('/product/vendor/orders')
        .set('Authorization', `Bearer ${getAccessToken(vendor2Id, sampleVendor2.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.orders).toEqual([]);
    });

    it('Should return single vendor order', async () => {
      const response = await request(app)
        .get(`/product/vendor/orders/${vendorOrderId}`)
        .set('Authorization', `Bearer ${getAccessToken(vendorId, sampleVendor.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.order).toBeDefined();
    });

    it('return 404, for non existing vendor order', async () => {
      const response = await request(app)
        .get(`/product/vendor/orders/${uuid()}`)
        .set('Authorization', `Bearer ${getAccessToken(vendorId, sampleVendor.email)}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Order Not Found.');
    });

    it('return 400, for invalid vendor order id ', async () => {
      const response = await request(app)
        .get(`/product/vendor/orders/32df3`)
        .set('Authorization', `Bearer ${getAccessToken(vendorId, sampleVendor.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(`invalid input syntax for type uuid: "32df3"`);
    });
  });
  describe('Updating vendor order', () => {
    it('should update the order', async () => {
      const response = await request(app)
        .put(`/product/vendor/orders/${vendorOrderId}`)
        .set('Authorization', `Bearer ${getAccessToken(vendorId, sampleVendor.email)}`)
        .send({
          orderStatus: 'delivered',
        });

      expect(response.statusCode).toBe(200);
    });
    it('should not update if orderStatus in not among defined ones', async () => {
      const response = await request(app)
        .put(`/product/vendor/orders/${vendorOrderId}`)
        .set('Authorization', `Bearer ${getAccessToken(vendorId, sampleVendor.email)}`)
        .send({
          orderStatus: 'fakeOrderStatus',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Please provide one of defined statuses.');
    });
    it('should not update, return 404 for non existing vendor order', async () => {
      const response = await request(app)
        .put(`/product/vendor/orders/${uuid()}`)
        .set('Authorization', `Bearer ${getAccessToken(vendorId, sampleVendor.email)}`)
        .send({
          orderStatus: 'is-accepted',
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Order Not Found.');
    });
    it('should not update, if the order has already been cancelled or completed', async () => {
      const response = await request(app)
        .put(`/product/vendor/orders/${vendorOrderId}`)
        .set('Authorization', `Bearer ${getAccessToken(vendorId, sampleVendor.email)}`)
        .send({
          orderStatus: 'is-accepted',
        });

      expect(response.statusCode).toBe(409);
    });
    it('return 400, for invalid vendor order id ', async () => {
      const response = await request(app)
        .put(`/product/vendor/orders/32df3`)
        .set('Authorization', `Bearer ${getAccessToken(vendorId, sampleVendor.email)}`)
        .send({
          orderStatus: 'is-accepted',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(`invalid input syntax for type uuid: "32df3"`);
    });
  });
});

describe('Admin Order Management', () => {
  describe('Fetching buyer and vendor Order(s)', () => {
    it("Should return all orders with it's buyer and related vendors", async () => {
      const response = await request(app)
        .get('/product/admin/orders')
        .set('Authorization', `Bearer ${getAccessToken(adminId, sampleAdmin.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.orders).toBeDefined();
    });

    it('Should return single order details', async () => {
      const response = await request(app)
        .get(`/product/admin/orders/${orderId}`)
        .set('Authorization', `Bearer ${getAccessToken(adminId, sampleAdmin.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.order).toBeDefined();
    });

    it('return 404, for non existing order', async () => {
      const response = await request(app)
        .get(`/product/admin/orders/${uuid()}`)
        .set('Authorization', `Bearer ${getAccessToken(adminId, sampleAdmin.email)}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Order Not Found.');
    });

    it('return 400, for invalid order id ', async () => {
      const response = await request(app)
        .get(`/product/admin/orders/32df3`)
        .set('Authorization', `Bearer ${getAccessToken(adminId, sampleAdmin.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(`invalid input syntax for type uuid: "32df3"`);
    });
  });
  describe('Updating buyer and vendor order', () => {
    it('should not update, return 404 for non existing order', async () => {
      const response = await request(app)
        .put(`/product/admin/orders/${uuid()}`)
        .set('Authorization', `Bearer ${getAccessToken(adminId, sampleAdmin.email)}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Order Not Found.');
    });
    it('should update the order', async () => {
      const response = await request(app)
        .put(`/product/admin/orders/${orderId}`)
        .set('Authorization', `Bearer ${getAccessToken(adminId, sampleAdmin.email)}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.order).toBeDefined();
    });
    it('should not update if it has already been completed(closed)', async () => {
      const response = await request(app)
        .put(`/product/admin/orders/${orderId}`)
        .set('Authorization', `Bearer ${getAccessToken(adminId, sampleAdmin.email)}`);

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('The order has already been completed.');
    });

    it('should not update, if the order has not been marked as received by buyer', async () => {
      const response = await request(app)
        .put(`/product/admin/orders/${order2Id}`)
        .set('Authorization', `Bearer ${getAccessToken(adminId, sampleAdmin.email)}`);

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('Order closure failed: The buyer has not received the item yet.');
    });

    it('return 400, for invalid order id ', async () => {
      const response = await request(app)
        .put(`/product/admin/orders/32df3`)
        .set('Authorization', `Bearer ${getAccessToken(adminId, sampleAdmin.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(`invalid input syntax for type uuid: "32df3"`);
    });
  });
});
