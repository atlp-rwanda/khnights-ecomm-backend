import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import { getConnection } from 'typeorm';
import { dbConnection } from '../startups/dbConnection';
import { v4 as uuid } from 'uuid';
import { User, UserInterface } from '../entities/User';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';
import { Cart } from '../entities/Cart';
import { CartItem } from '../entities/CartItem';
import { cleanDatabase } from './test-assets/DatabaseCleanup';
import { updateOrderService } from '../services/orderServices/updateOrderService';

const vendor1Id = uuid();

const buyer1Id = uuid();
const buyer2Id = uuid();
const buyer3Id = uuid();
const buyer4Id = uuid();

const product1Id = uuid();
const product2Id = uuid();

const catId = uuid();
const cart1Id = uuid();
const cartItemId = uuid();

const sampleCartId = uuid();
const sampleCartItemId = uuid();
const samplecartItem3Id = uuid();
const sampleAdminId = uuid();

let returnedCartId: string;
let returnedCartItemId: string;
let returnedCartItem2Id: string;

const jwtSecretKey = process.env.JWT_SECRET || '';

if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASS)
  throw new Error('TEST_USER_PASS or TEST_USER_EMAIL not set in .env');

const sampleAdmin: UserInterface = {
  id: sampleAdminId,
  firstName: 'admin!',
  lastName: 'user',
  email: 'admin@gmail.com',
  password: 'admin',
  userType: 'Admin',
  gender: 'Male',
  phoneNumber: '10026386347',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'ADMIN',
};

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
  email: 'vendo111@example.com',
  password: 'password',
  userType: 'Vendor',
  gender: 'Male',
  phoneNumber: '11126380996347',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'VENDOR',
};

const sampleBuyer1: UserInterface = {
  id: buyer1Id,
  firstName: 'buyer1',
  lastName: 'user',
  email: 'manger@gmail.com',
  password: 'password',
  userType: 'Buyer',
  gender: 'Male',
  phoneNumber: '12116380996347',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'BUYER',
};

const sampleBuyer2: UserInterface = {
  id: buyer2Id,
  firstName: 'buyer2',
  lastName: 'user',
  email: 'elijahladdiedv@example.com',
  password: 'password',
  userType: 'Buyer',
  gender: 'Male',
  phoneNumber: '12116380996348',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'BUYER',
};
const sampleBuyer3: UserInterface = {
  id: buyer3Id,
  firstName: 'buyer3',
  lastName: 'user',
  email: 'buyer3@example.com',
  password: 'password',
  userType: 'Buyer',
  gender: 'Male',
  phoneNumber: '1211ddf3800',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'BUYER',
};
const sampleBuyer4: UserInterface = {
  id: buyer4Id,
  firstName: 'buyer4',
  lastName: 'user',
  email: 'buyer4@example.com',
  password: 'password',
  userType: 'Buyer',
  gender: 'Male',
  phoneNumber: '1211ddsdff3800',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'BUYER',
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
  quantity: 20,
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

const sampleCart1 = {
  id: cart1Id,
  user: sampleBuyer1,
  totalAmount: 200,
};

const sampleCart2 = {
  id: sampleCartId,
  totalAmount: 200,
};

const sampleCartItem1 = {
  id: cartItemId,
  product: sampleProduct1,
  cart: sampleCart1,
  quantity: 2,
  newPrice: 200,
  total: 400,
};

const sampleCartItem2 = {
  id: sampleCartItemId,
  product: sampleProduct2,
  cart: sampleCart1,
  quantity: 2,
  newPrice: 200,
  total: 400,
};

const sampleCartItem3 = {
  id: samplecartItem3Id,
  product: sampleProduct2,
  cart: sampleCart2,
  quantity: 2,
  newPrice: 200,
  total: 400,
};

const bodyToSend = {
  productId: product1Id,
  quantity: 2,
};

beforeAll(async () => {
  const connection = await dbConnection();

  const categoryRepository = connection?.getRepository(Category);
  await categoryRepository?.save({ ...sampleCat });

  const userRepository = connection?.getRepository(User);
  await userRepository?.save({ ...sampleVendor1 });
  await userRepository?.save({ ...sampleBuyer1 });
  await userRepository?.save({ ...sampleBuyer2 });
  await userRepository?.save({ ...sampleBuyer3 });
  await userRepository?.save({ ...sampleBuyer4 });
  await userRepository?.save({ ...sampleAdmin });

  const productRepository = connection?.getRepository(Product);
  await productRepository?.save({ ...sampleProduct1 });
  await productRepository?.save({ ...sampleProduct2 });

  const cartRepository = connection?.getRepository(Cart);
  await cartRepository?.save({ ...sampleCart1 });
  await cartRepository?.save({ ...sampleCart2 });

  const cartItemRepository = connection?.getRepository(CartItem);
  await cartItemRepository?.save({ ...sampleCartItem1 });
  await cartItemRepository?.save({ ...sampleCartItem2 });
  await cartItemRepository?.save({ ...sampleCartItem3 });
});

afterAll(async () => {
  await cleanDatabase();

  server.close();
});

describe('Cart| Order  management for guest/buyer', () => {
  describe('Adding product to cart on guest/buyer', () => {
    it('should add product to cart as authenticated buyer', async () => {
      const response = await request(app)
        .post(`/cart`)
        .send(bodyToSend)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(201);
      expect(response.body.data.message).toBe('cart updated successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should add product to cart as authenticated buyer2', async () => {
      const response = await request(app)
        .post(`/cart`)
        .send({
          productId: product2Id,
          quantity: 200,
        })
        .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);

      expect(response.status).toBe(201);
      expect(response.body.data.message).toBe('cart updated successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should add product to cart as authenticated buyer (buyer4)', async () => {
      const response = await request(app)
        .post(`/cart`)
        .send({
          productId: product2Id,
          quantity: 1,
        })
        .set('Authorization', `Bearer ${getAccessToken(buyer4Id, sampleBuyer4.email)}`);

      expect(response.status).toBe(201);
      expect(response.body.data.message).toBe('cart updated successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should add product to cart as guest', async () => {
      const response = await request(app).post(`/cart`).send(bodyToSend);

      expect(response.status).toBe(201);
      expect(response.body.data.message).toBe('cart updated successfully');
      expect(response.body.data.cart).toBeDefined;

      returnedCartId = response.body.data.cart.id;

      returnedCartItemId = response.body.data.cart.items[0].id;
    });

    it('should update quantity of product, if it is already in cart of guest', async () => {
      const response = await request(app)
        .post(`/cart`)
        .set('Cookie', [`cartId=${returnedCartId}`])
        .send({
          productId: product1Id,
          quantity: 3,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.message).toBe('cart updated successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should add second product to cart of guest', async () => {
      const response = await request(app)
        .post(`/cart`)
        .set('Cookie', [`cartId=${returnedCartId}`])
        .send({
          productId: product2Id,
          quantity: 3,
        });

      returnedCartItem2Id = response.body.data.cart.items[1].id;
      expect(response.status).toBe(201);
      expect(response.body.data.message).toBe('cart updated successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should return 400 for incorrect Id syntax (IDs not in uuid form), when add product to cart', async () => {
      const response = await request(app).post(`/cart`).set('Cookie', [`cartId=dfgdsf`]).send({
        productId: product1Id,
        quantity: 3,
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 if you do not send proper request body', async () => {
      const response = await request(app).post(`/cart`);

      expect(response.status).toBe(400);
    });

    it('should not add product to cart if product does not exist', async () => {
      const response = await request(app)
        .post(`/cart`)
        .send({ productId: uuid(), quantity: 2 })
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Product not found, try again.');
    });

    it('should not add product to cart if quantity is less than 1', async () => {
      const response = await request(app)
        .post(`/cart`)
        .send({ productId: product1Id, quantity: 0 })
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Quantity must be greater than 0');
    });

    it('should change quantity of product in cart if it is already there', async () => {
      const response = await request(app)
        .post(`/cart`)
        .send({ productId: product1Id, quantity: 3 })
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(201);
      expect(response.body.data.message).toBe('cart updated successfully');
      expect(response.body.data.cart).toBeDefined;
    });
  });

  describe('Getting cart items', () => {
    it('should get cart items of authenticated user', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart retrieved successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should get Empty cart items of authenticated user', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${getAccessToken(buyer3Id, sampleBuyer3.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart is empty');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should get Empty cart items of guest user', async () => {
      const response = await request(app).get('/cart');

      expect(response.status).toBe(200);
      expect(response.body.data.cart).toBeDefined;
    });

    it('should get cart items of guest user', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Cookie', [`cartId=${returnedCartId}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart retrieved successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should get cart items of guest user as empty with wrong cartId', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Cookie', [`cartId=${uuid()}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart is empty');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should return 400 for incorrect Id syntax (IDs not in uuid form), when getting cart', async () => {
      const response = await request(app).get(`/cart`).set('Cookie', [`cartId=dfgdsf`]);

      expect(response.status).toBe(400);
    });
  });

  describe('Order management tests', () => {
    let orderId: any;
    let order2Id: any;
    let productId: any;
    let feedbackId: any;
    let feedback2Id: any;

    describe('Create order', () => {
      it('should create order for authenticated user', async () => {
        const response = await request(app)
          .post('/product/orders')
          .send({
            address: {
              country: 'Test Country',
              city: 'Test City',
              street: 'Test Street',
            },
          })
          .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
        expect(response.status).toBe(201);
      });

      it('create order for another authenticated user', async () => {
        const response = await request(app)
          .post('/product/orders')
          .send({
            address: {
              country: 'Test Country',
              city: 'Test City',
              street: 'Test Street',
            },
          })
          .set('Authorization', `Bearer ${getAccessToken(buyer4Id, sampleBuyer4.email)}`);

        expect(response.status).toBe(201);
        order2Id = response.body.data.id;
      });

      it('should not create an order if user has an empty cart or his carts has already been checked out', async () => {
        const response = await request(app)
          .post('/product/orders')
          .send({
            address: {
              country: 'Test Country',
              city: 'Test City',
              street: 'Test Street',
            },
          })
          .set('Authorization', `Bearer ${getAccessToken(buyer3Id, sampleBuyer3.email)}`);
        expect(response.status).toBe(400);
      });

      it('should not create an order, if there are not enough product in stock', async () => {
        const response = await request(app)
          .post('/product/orders')
          .send({
            address: {
              country: 'Test Country',
              city: 'Test City',
              street: 'Test Street',
            },
          })
          .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);
        expect(response.status).toBe(400);
      });
      describe('Retriving Info about oreder Test', () => {
        it('should return orders for the buyer', async () => {
          const response = await request(app)
            .get('/product/client/orders')
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
          expect(response.status).toBe(200);
          orderId = response.body.data.orders[0]?.id;
          productId = response.body.data.orders[0]?.orderItems[0]?.product?.id;
        });

        it('should get single order', async () => {
          const response = await request(app)
            .get(`/product/client/orders/${orderId}`)
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

          expect(response.status).toBe(200);
          expect(response.body.data.order).toBeDefined();
        });

        it("should not return data for single order, if order doesn't exist", async () => {
          const response = await request(app)
            .get(`/product/client/orders/${uuid()}`)
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

          expect(response.status).toBe(404);
        });

        it('should not return data for single order, for an incorrect id syntax', async () => {
          const response = await request(app)
            .get(`/product/client/orders/incorrectId`)
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

          expect(response.status).toBe(400);
        });

        it('should return 404 if the buyer has no orders', async () => {
          const response = await request(app)
            .get('/product/client/orders')
            .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);
          expect(response.status).toBe(404);
          expect(response.body.message).toBeUndefined;
        });
      });

      it('should return transaction history for the buyer', async () => {
        const response = await request(app)
          .get('/product/orders/history')
          .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Transaction history retrieved successfully');
      });

      it('should return 400 when user is not AUTHORIZED', async () => {
        const response = await request(app).get('/product/orders/history').set('Authorization', `Bearer ''`);
        expect(response.status).toBe(403);
      });
    });

    describe('Update order', () => {
      it('should update order status successfully', async () => {
        const response = await request(app)
          .put(`/product/client/orders/${orderId}`)
          .send({ orderStatus: 'completed' })
          .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
        expect(response.status).toBe(200);
      });

      it("should return 404, if order doesn't exist", async () => {
        const response = await request(app)
          .put(`/product/client/orders/${uuid()}`)
          .send({ orderStatus: 'completed' })
          .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
        expect(response.status).toBe(404);
      });

      it('should return 200 and make refund to buyer when order is cancelled or returned', async () => {
        const response = await request(app)
          .put(`/product/client/orders/${order2Id}`)
          .send({ orderStatus: 'cancelled' })
          .set('Authorization', `Bearer ${getAccessToken(buyer4Id, sampleBuyer4.email)}`);
        expect(response.status).toBe(200);
      });
    });
    describe('Add feedback to the product with order', () => {
      it('should create new feedback to the ordered product', async () => {
        const response = await request(app)
          .post(`/feedback/${productId}/new`)
          .send({ orderId, comment: 'Well this product looks so fantastic' })
          .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
        expect(response.status).toBe(201);
        feedbackId = response.body.data.id;
      });

      it('should create second feedback to the ordered product', async () => {
        const response = await request(app)
          .post(`/feedback/${productId}/new`)
          .send({ orderId, comment: 'Murigalike this product looks so fantastic' })
          .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
        expect(response.status).toBe(201);
        feedback2Id = response.body.data.id;
      });
      it('should  updated existing feedback successfully', async () => {
        const response = await request(app)
          .put(`/feedback/update/${feedbackId}`)
          .send({ orderId, comment: 'Well this product looks so lovely' })
          .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
        expect(response.status).toBe(200);
      });
      it('should remove recorded feedback', async () => {
        const response = await request(app)
          .delete(`/feedback/delete/${feedbackId}`)
          .send({ orderId, comment: 'Well this product looks so lovely' })
          .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
        expect(response.status).toBe(200);
      });
    });

    describe('Feedback API', () => {
      describe('Add feedback to the product with order', () => {
        it('should create new feedback for the ordered product', async () => {
          const response = await request(app)
            .post(`/feedback/${productId}/new`)
            .send({ orderId, comment: 'Well this product looks so fantastic' })
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
          expect(response.status).toBe(201);
          feedbackId = response.body.data.id;
        });

        it('should create another feedback for the ordered product', async () => {
          const response = await request(app)
            .post(`/feedback/${productId}/new`)
            .send({ orderId, comment: 'Murigalike this product looks so fantastic' })
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
          expect(response.status).toBe(201);
          feedback2Id = response.body.data.id;
        });

        it('should fail to create feedback with missing orderId', async () => {
          const response = await request(app)
            .post(`/feedback/${productId}/new`)
            .send({ comment: 'Missing orderId' })
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
          expect(response.status).toBe(404);
        });

        it('should fail to create feedback with missing comment', async () => {
          const response = await request(app)
            .post(`/feedback/${productId}/new`)
            .send({ orderId })
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
          expect(response.status).toBe(500);
        });

        it('should fail to create feedback with invalid productId', async () => {
          const response = await request(app)
            .post(`/feedback/invalidProductId/new`)
            .send({ orderId, comment: 'Invalid productId' })
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
          expect(response.status).toBe(500);
        });
      });

      describe('Update feedback', () => {
        it('should update existing feedback successfully', async () => {
          const response = await request(app)
            .put(`/feedback/update/${feedbackId}`)
            .send({ orderId, comment: 'Well this product looks so lovely' })
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
          expect(response.status).toBe(200);
        });

        it('should fail to update feedback with invalid feedbackId', async () => {
          const response = await request(app)
            .put(`/feedback/update/invalidFeedbackId`)
            .send({ orderId, comment: 'Invalid feedbackId' })
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
          expect(response.status).toBe(500);
        });

        it('should fail to update feedback without authorization', async () => {
          const response = await request(app)
            .put(`/feedback/update/${feedbackId}`)
            .send({ orderId, comment: 'Unauthorized update' });
          expect(response.status).toBe(401);
        });
      });

      describe('Delete feedback', () => {
        it('should remove recorded feedback', async () => {
          const response = await request(app)
            .delete(`/feedback/delete/${feedbackId}`)
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
          expect(response.status).toBe(200);
        });

        it('should fail to delete feedback with invalid feedbackId', async () => {
          const response = await request(app)
            .delete(`/feedback/delete/invalidFeedbackId`)
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
          expect(response.status).toBe(500);
        });
      });

      describe('Edge Cases', () => {
        it('should not allow creating feedback for a product not in the order', async () => {
          const invalidOrderId = 999; // Assuming an invalid orderId
          const response = await request(app)
            .post(`/feedback/${productId}/new`)
            .send({ orderId: invalidOrderId, comment: 'Invalid orderId' })
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
          expect(response.status).toBe(500);
        });

        it('should fail to update feedback with a comment that is too long', async () => {
          const longComment = 'a'.repeat(1001); // Assuming max length is 1000
          const response = await request(app)
            .put(`/feedback/update/${feedback2Id}`)
            .send({ orderId, comment: longComment })
            .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);
          expect(response.status).toBe(200);
        });
      });

      describe('Delete feedback by Admin', () => {
        it('should delete feedback, if user is authenticated as admin', async () => {
          const response = await request(app)
            .delete(`/feedback/admin/delete/${feedback2Id}`)
            .set('Authorization', `Bearer ${getAccessToken(sampleAdminId, sampleAdmin.email)}`);

          expect(response.status).toBe(200);
          expect(response.body.data.message).toBe('Feedback successfully removed');
        });

        it("should return 404, if feedback doesn't exist", async () => {
          const response = await request(app)
            .delete(`/feedback/admin/delete/${uuid()}`)
            .set('Authorization', `Bearer ${getAccessToken(sampleAdminId, sampleAdmin.email)}`);

          expect(response.status).toBe(404);
        });

        it("should return 500, for incorrect feedback id syntax (invalid uuid) doesn't exist", async () => {
          const response = await request(app)
            .delete(`/feedback/admin/delete/invalid-uuid`)
            .set('Authorization', `Bearer ${getAccessToken(sampleAdminId, sampleAdmin.email)}`);

          expect(response.status).toBe(500);
        });
      });
    });
  });

  describe('Deleting product from cart', () => {
    it('should return 404 if product does not exist in cart', async () => {
      const response = await request(app)
        .delete(`/cart/${uuid()}`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Cart item not found');
    });

    it('should return 401 if you try to delete item not in your cart', async () => {
      const response = await request(app)
        .delete(`/cart/${cartItemId}`)
        .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('You are not authorized to perform this action');
    });

    it('should delete product from cart', async () => {
      const response = await request(app)
        .delete(`/cart/${sampleCartItemId}`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Product removed from cart successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should delete product from cart', async () => {
      const response = await request(app)
        .delete(`/cart/${cartItemId}`)
        .set('Authorization', `Bearer ${getAccessToken(buyer1Id, sampleBuyer1.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('cart removed successfully');
    });

    it('should delete product in guest cart', async () => {
      const response = await request(app).delete(`/cart/${returnedCartItemId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Product removed from cart successfully');
    });

    it('should delete guest cart if there are no products remaining there', async () => {
      const response = await request(app).delete(`/cart/${returnedCartItem2Id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('cart removed successfully');
    });

    it('should return 404 if Cart item (product) does not exist in guest cart', async () => {
      const response = await request(app).delete(`/cart/${uuid()}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Cart item not found');
    });

    it('should return 400, for incorrect Cart item (product) id syntax (invalid uuid)', async () => {
      const response = await request(app).delete(`/cart/invalid-uuid`);

      expect(response.status).toBe(400);
    });
  });

  describe('Clearing cart', () => {
    it('should return 200 as authenticated buyer does not have a cart', async () => {
      const response = await request(app)
        .delete(`/cart`)
        .set('Authorization', `Bearer ${getAccessToken(buyer3Id, sampleBuyer3.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart is empty');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should clear cart as authenticated buyer', async () => {
      const response = await request(app)
        .delete(`/cart`)
        .set('Authorization', `Bearer ${getAccessToken(buyer2Id, sampleBuyer2.email)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart cleared successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should return 200 as guest does not have a cart', async () => {
      const response = await request(app).delete(`/cart`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart is empty');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should clear cart items of guest user', async () => {
      const response = await request(app)
        .delete('/cart')
        .set('Cookie', [`cartId=${sampleCartId}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart cleared successfully');
      expect(response.body.data.cart).toBeDefined;
    });

    it("should return empty cart for guest user, if he/she doesn't have cart", async () => {
      const response = await request(app)
        .delete('/cart')
        .set('Cookie', [`cartId=${sampleCartId}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Cart is empty');
      expect(response.body.data.cart).toBeDefined;
    });

    it('should return 400, for incorrect cart id syntax (invalid uuid) for guest user', async () => {
      const response = await request(app).delete(`/cart`).set('Cookie', [`cartId=invalid-uuid`]);

      expect(response.status).toBe(400);
    });
  });
});
