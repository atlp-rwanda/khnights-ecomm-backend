import { getConnection, getRepository, Repository } from 'typeorm';
import { User, UserInterface } from '../entities/User';
import { cleanDatabase } from './test-assets/DatabaseCleanup';
import {app, server } from '../index';
import { v4 as uuid } from 'uuid';
import { dbConnection } from '../startups/dbConnection';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const adminId = uuid();

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
  email:process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASS,
  userType: 'Admin',
  gender: 'Male',
  phoneNumber: '126380997',
  photoUrl: 'https://example.com/photo.jpg',
  verified: true,
  role: 'ADMIN',
};



beforeAll(async () => {
  const connection = await dbConnection();
  if (!connection) {
    console.error('Failed to connect to the database');
    return;
  }

  const userRepository = connection.getRepository(User);
  await userRepository.save(sampleAdmin);
});

afterAll(async () => {
    await cleanDatabase();
    server.close();
  });

describe('User profile update service', () => {
  it('should validate a invalid user and return 400', async () => {
    const res = await request(app)
    .put('/user/update')
    .set('Authorization', `Bearer ${getAccessToken(adminId, sampleAdmin.email)}`)
    .send();

    expect(res.statusCode).toBe(400);
  });

  it('should validate a valid user', async () => {
    const res = await request(app)
    .put('/user/update')
    .set('Authorization', `Bearer ${getAccessToken(adminId, sampleAdmin.email)}`)
    .send({
      firstName: 'admin',
      lastName: 'user',
      email: process.env.TEST_USER_EMAIL,
      gender: 'Male',
      phoneNumber: '126380997',
      photoUrl: 'https://example.com/photo.jpg',
      id: sampleAdmin.id,
    });

    expect(res.statusCode).toBe(201);
});

it('should return 403 if user not authorized', async () => {
    const fakeID = uuid();

    const res = await request(app)
   .put('/user/update')
   .send({
    firstName: 'admin',
    lastName: 'user',
    email: process.env.TEST_USER_EMAIL,
    gender: 'Male',
    phoneNumber: '126380997',
    photoUrl: 'https://example.com/photo.jpg',
    id: fakeID,
   });

   expect(res.statusCode).toBe(403);
});
});