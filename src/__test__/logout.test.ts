import request from 'supertest';
import { app, server } from '../index';
import { createConnection, getConnection, getConnectionOptions, getRepository } from 'typeorm';
import { User } from '../entities/User';
import { cleanDatabase } from './test-assets/DatabaseCleanup';

beforeAll(async () => {
  // Connect to the test database
  await createConnection();
});

afterAll(async () => {
  await cleanDatabase();

  server.close();
});

describe('POST /user/logout', () => {
  it('should logout a user', async () => {
    // sign up a user
    const registerUser = {
      firstName: 'Ndevu',
      lastName: 'Elisa',
      email: 'ndevukumurindi@gmail.com',
      gender: 'male',
      phoneNumber: '078907987443',
      photoUrl: 'https://example.com/images/photo.jpg',
      userType: 'vender',
      verified: true,
      status: 'active',
      password: process.env.TEST_USER_LOGIN_PASS,
    };

    await request(app).post('/user/register').send(registerUser);

    const loginUser = {
      email: registerUser.email,
      password: process.env.TEST_USER_LOGIN_PASS,
    };

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: registerUser.email } });
    if (user) {
      const verifyRes = await request(app).get(`/user/verify/${user.id}`);

      if (!verifyRes) throw new Error(`Test User verification failed for ${user.email}`);

      const loginResponse = await request(app).post('/user/login').send(loginUser);
      const setCookie = loginResponse.headers['set-cookie'];

      if (!setCookie) {
        throw new Error('No cookies set in login response');
      }

      const resp = await request(app).post('/user/logout').set('Cookie', setCookie);
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({ Message: 'Logged out successfully' });

      // Clean up: delete the test user
      await userRepository.remove(user);
    }
  });

  it('should not logout a user who is not logged in or with no token', async () => {
    const fakeEmail = 'ndevukkkk@gmail.com';
    const loginUser = {
      email: fakeEmail,
      password: process.env.TEST_USER_LOGIN_PASS,
    };
    const token = '';
    const res = await request(app).post('/user/logout').send(loginUser).set('Cookie', token);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ Message: 'Access denied. You must be logged in' });
  });
});