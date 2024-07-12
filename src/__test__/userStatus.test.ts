import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import { getRepository } from 'typeorm';
import { getConnection } from 'typeorm';
import { dbConnection } from '../startups/dbConnection';
import { User } from '../entities/User';
import { v4 as uuid } from 'uuid';
import { cleanDatabase } from './test-assets/DatabaseCleanup';

const adminUserId = uuid();

const jwtSecretKey = process.env.JWT_SECRET || '';

beforeAll(async () => {
  const connection = await dbConnection();

  const userRepository = connection?.getRepository(User);

  const adminUser = new User();
  adminUser.id = adminUserId;
  adminUser.firstName = 'remjsa';
  adminUser.lastName = 'djkchd';
  adminUser.email = 'admin.kjaxs@example.com';
  adminUser.password = 'passwordadmin';
  adminUser.userType = 'Admin';
  adminUser.gender = 'Male';
  adminUser.phoneNumber = '126380996347';
  adminUser.photoUrl = 'https://example.com/photo.jpg';

  await userRepository?.save(adminUser);

  adminUser.role = 'ADMIN';
  adminUser.verified = true;
  await userRepository?.save(adminUser);
});

afterAll(async () => {
  await cleanDatabase();

  server.close();
});

const data = {
  id: adminUserId,
  email: 'admin.kjaxs@example.com',
};

const testUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'checki@testing.com',
  password: 'password',
  gender: 'Male',
  phoneNumber: '4223567890',
  photoUrl: 'https://example.com/photo.jpg',
};

describe('POST /user/deactivate', () => {
  it('should deactivate a user', async () => {
    await request(app).post('/user/register').send(testUser);

    const token = jwt.sign(data, jwtSecretKey);

    const response = await request(app)
      .post(`/user/deactivate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: `${testUser.email}` });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User deactivated successfully');
  }, 60000);

  it('should return 404 when email is not submitted', async () => {
    const token = jwt.sign(data, jwtSecretKey);
    const response = await request(app).post(`/user/deactivate`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Email is needed');
  });
  it('should return message "User is already suspended" if user is already suspended', async () => {
    const token = jwt.sign(data, jwtSecretKey);
    const response = await request(app)
      .post(`/user/deactivate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: `${testUser.email}` });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User is already suspended');
  });

  it('should return 404 if user not found when deactivating', async () => {
    const token = jwt.sign(data, jwtSecretKey);
    const response = await request(app)
      .post(`/user/deactivate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'nonexistent@example.com' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });
});

describe('POST /user/activate', () => {
  it('should activate a user', async () => {
    const token = jwt.sign(data, jwtSecretKey);

    const response = await request(app)
      .post(`/user/activate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: `${testUser.email}` });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User activated successfully');
  }, 60000);

  it('should return 404 when email is not submitted', async () => {
    const token = jwt.sign(data, jwtSecretKey);
    const response = await request(app).post(`/user/activate`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Email is needed');
  });

  it('should return message "User is already active" if user is already active', async () => {
    const token = jwt.sign(data, jwtSecretKey);
    const response = await request(app)
      .post(`/user/activate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: `${testUser.email}` });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User is already active');

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: testUser.email } });
    if (user) {
      await userRepository.remove(user);
    }
  });

  it('should return 404 if user not found when activating', async () => {
    const token = jwt.sign(data, jwtSecretKey);
    const response = await request(app)
      .post('/user/activate')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'nonexistent@example.com' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });
});