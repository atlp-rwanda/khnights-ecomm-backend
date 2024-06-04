import request from 'supertest';
import { app, server } from '../index';
import { createConnection, getRepository } from 'typeorm';
import { User, UserInterface } from '../entities/User';
import { cleanDatabase } from './test-assets/DatabaseCleanup';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { dbConnection } from '../startups/dbConnection';


const adminId = uuid();
const adminId1 = uuid();

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


if (!process.env.TEST_USER_EMAIL || !process.env.TEST_BUYER_EMAIL || !process.env.TEST_VENDOR1_EMAIL || !process.env.TEST_VENDOR_EMAIL || !process.env.TEST_USER_PASS) throw new Error('TEST_USER_PASS or TEST_USER_EMAIL not set in .env');

const sampleAdmin: UserInterface = {
    id: adminId,
    firstName: 'admin',
    lastName: 'user',
    email:  process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASS,
    userType: 'Admin',
    gender: 'Male',
    phoneNumber: '126380997',
    photoUrl: 'https://example.com/photo.jpg',
    verified: true,
    role: 'ADMIN',
  };

  const sampleAdmin1: UserInterface = {
    id: adminId1,
    firstName: 'admin',
    lastName: 'user',
    email:  'vendor@example.com',
    password: process.env.TEST_USER_PASS,
    userType: 'Admin',
    gender: 'Male',
    phoneNumber: '126380997',
    photoUrl: 'https://example.com/photo.jpg',
    verified: false,
    role: 'ADMIN',
  };

beforeAll(async () => {
    const connection = await dbConnection();

    const userRepository = connection?.getRepository(User);
    await userRepository?.save([sampleAdmin, sampleAdmin1]);
  });

afterAll(async () => {
  await cleanDatabase();

  server.close();
});

describe('POST /user/login', () => {
  it('should not login a user with unverified email', async () => {

    const loginUser = {
      email: 'vendor@example.com',
      password: process.env.TEST_USER_LOGIN_PASS,
    };

      const loginResponse = await request(app).post('/user/login').send(loginUser);

      expect(loginResponse.status).toBe(400);
      expect(loginResponse.body).toBeDefined();
  });
});
