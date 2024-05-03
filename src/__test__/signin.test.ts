import request from 'supertest';
import { app, server } from '../index'; // update this with the path to your app file
import { Any, createConnection, getConnection, getConnectionOptions, getRepository } from 'typeorm';
import { User } from '../entities/User';

beforeAll(async () => {
  // Connect to the test database
  const connectionOptions = await getConnectionOptions();
  await createConnection({ ...connectionOptions, name: 'testConnection' });
});

afterAll(async () => {
  await getConnection('testConnection').close();
  server.close();
});

describe('POST /user/login', () => {
  it('should log in a user with email and password', async () => {
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
      password: 'ndevurefu',
    };
    await request(app).post('/user/register').send(registerUser);

    // Arrange
    const loginUser = {
      email: 'ndevukumurindi@gmail.com',
      password: 'ndevurefu',
    };
    const res = await request(app).post('/user/login').send(loginUser);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'success',
      data: {
        code: 200,
        message: 'logged in successful',
        data: expect.any(String),
      },
    });

    // Clean up: delete the test user
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: registerUser.email } });
    if (user) {
      await userRepository.remove(user);
    }
  });

  it('should not log in a user with empty credentials', async () => {
    // Arrange
    const loginUser = {
      email: '',
      password: '',
    };
    const res = await request(app).post('/user/login').send(loginUser);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ Message: 'Email and password are required' });
  });

  it('should not log in a user with wrong email', async () => {
    // sign up a user
    const registerUser = {
      firstName: 'Ndevu',
      lastName: 'Elisa',
      email: 'ndevukkkk@gmail.com',
      gender: 'male',
      phoneNumber: '0789044308',
      photoUrl: 'https://example.com/images/photo.jpg',
      userType: 'vender',
      verified: true,
      status: 'active',
      password: 'ndevu1',
    };
    await request(app).post('/user/register').send(registerUser);
    // Arrange
    const loginUser = {
      email: 'ndevuk@gmail.com',
      password: 'ndevu1',
    };
    const res = await request(app).post('/user/login').send(loginUser);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ Message: 'Invalid email' });

    // Clean up: delete the test user
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: registerUser.email } });
    if (user) {
      await userRepository.remove(user);
    }
  });

  it('should not log in a user with unverified email', async () => {
    // sign up a user
    const registerUser = {
      firstName: 'Ndevu',
      lastName: 'Elisa',
      email: 'ndevumnu@gmail.com',
      gender: 'male',
      phoneNumber: '0789044399',
      photoUrl: 'https://example.com/images/photo.jpg',
      userType: 'vender',
      verified: 'false',
      status: 'active',
      password: 'ndevu2',
    };
    await request(app).post('/user/register').send(registerUser);
    // Arrange
    const loginUser = {
      email: 'ndevumnu@gmail.com',
      password: 'ndevu2',
    };
    const res = await request(app).post('/user/login').send(loginUser);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ Message: 'Email not verified. verified it first' });
    // Clean up: delete the test user
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: registerUser.email } });
    if (user) {
      await userRepository.remove(user);
    }
  });

  it('should not log in a user with suspended account', async () => {
    // sign up a user
    const registerUser = {
      firstName: 'Ndevu',
      lastName: 'Elisa',
      email: 'ndevutest1@gmail.com',
      gender: 'male',
      phoneNumber: '0789044391',
      photoUrl: 'https://example.com/images/photo.jpg',
      userType: 'vender',
      verified: true,
      status: 'suspended',
      password: 'ndevu3',
    };
    await request(app).post('/user/register').send(registerUser);
    // Arrange
    const loginUser = {
      email: 'ndevutest1@gmail.com',
      password: 'ndevu3',
    };
    const res = await request(app).post('/user/login').send(loginUser);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ Message: 'You have been suspended, reach customer service for more details' });

    // Clean up: delete the test user
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: registerUser.email } });
    if (user) {
      await userRepository.remove(user);
    }
  });

  it('should not log in a user with wrong password', async () => {
    // sign up a user
    const registerUser = {
      firstName: 'Ndevu',
      lastName: 'Elisa',
      email: 'ndevumunene@gmail.com',
      gender: 'male',
      phoneNumber: '0709044398',
      photoUrl: 'https://example.com/images/photo.jpg',
      userType: 'vender',
      verified: true,
      status: 'active',
      password: 'ndevu4',
    };
    await request(app).post('/user/register').send(registerUser);
    // Arrange
    const loginUser = {
      email: 'ndevumunene@gmail.com',
      password: 'ndevu123',
    };
    const res = await request(app).post('/user/login').send(loginUser);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ Message: 'Invalid password' });

    // Clean up: delete the test user
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: registerUser.email } });
    if (user) {
      await userRepository.remove(user);
    }
  });
});
