import request from 'supertest';
import { app, server } from '../index'; // Adjust the path to your Express app
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { User, UserInterface } from '../entities/User';
import { dbConnection } from '../startups/dbConnection';
import { v4 as uuid } from 'uuid';
import { cleanDatabase } from './test-assets/DatabaseCleanup';

jest.mock('stripe', () => {
  const stripeInstance = {
    paymentIntents: {
      list: jest.fn(),
    },
  };

  return jest.fn(() => stripeInstance);
});
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

afterAll(async () => {
  await cleanDatabase();
  server.close();
});

const Admin = uuid();
const sampleAdmin1: UserInterface = {
  id: Admin,
  firstName: 'vendor1o',
  lastName: 'user',
  email: 'vendor10@example.com',
  password: 'password',
  userType: 'Vendor',
  gender: 'Male',
  phoneNumber: '126380996348',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'ADMIN',
};

const mockStripeInstance = new Stripe('fake-key', { apiVersion: '2024-04-10' }) as jest.Mocked<Stripe>;

describe('Transaction function', () => {
  beforeEach(async () => {
    const connection = await dbConnection();
    (mockStripeInstance.paymentIntents.list as jest.Mock).mockClear();
    const userRepository = connection?.getRepository(User);
    await userRepository?.save({ ...sampleAdmin1 });
  });

  it('should return the correct payment statistics', async () => {
    (mockStripeInstance.paymentIntents.list as jest.Mock).mockResolvedValue({
      data: [
        { amount: 1000, amount_received: 1000, status: 'succeeded' },
        { amount: 2000, amount_received: 0, status: 'pending' },
      ],
    } as any);

    const response = await request(app)
      .get('/product/transaction')
      .set('Authorization', `Bearer ${getAccessToken(Admin, sampleAdmin1.email)}`);

    expect(response.body).toEqual({
      payments: [
        { amount: 1000, amount_received: 1000, status: 'succeeded' },
        { amount: 2000, amount_received: 0, status: 'pending' },
      ],
      statistics: {
        totalPayments: 2,
        totalAmount: 3000,
        totalCapturedAmount: 1000,
        successfulPayments: 1,
        pendingPayments: 1,
        averagePaymentAmount: 1500,
      },
    });
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Something went wrong');
    (mockStripeInstance.paymentIntents.list as jest.Mock).mockRejectedValueOnce(error);

    const response = await request(app)
      .get('/product/transaction')
      .set('Authorization', `Bearer ${getAccessToken(Admin, sampleAdmin1.email)}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Something went wrong' });
  });
});
