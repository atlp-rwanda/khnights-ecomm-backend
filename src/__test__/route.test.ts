import request from 'supertest';
import { app, server } from '../index';
import { createConnection, getConnection, getConnectionOptions, getRepository } from 'typeorm';
import { User } from '../entities/User';

beforeAll(async () => {
  // Connect to the test database
  const connectionOptions = await getConnectionOptions();

  await createConnection({ ...connectionOptions, name: 'testConnection' });
});

afterAll(async () => {
  const connection = getConnection('testConnection');
  const userRepository = connection.getRepository(User);

  // Delete all records from the User
  await userRepository.clear();

  // Close the connection to the test database
  await connection.close();

  server.close();
});

describe('GET /', () => {
  it('This is a testing route that returns', done => {
    request(app)
      .get('/api/v1/status')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(
        {
          status: 'success',
          data: {
            code: 200,
            message: 'This is a testing route.',
          },
        },
        done
      );
  });
});
describe('POST /user/register', () => {
  it('should register a new user', async () => {
    // Arrange
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe1@example.com',
      password: 'password',
      gender: 'Male',
      phoneNumber: '123456789',
      userType: 'Buyer',
    };

    // Act
    const res = await request(app).post('/user/register').send(newUser);
    // Assert
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      status: 'success',
      data: {
        code: 201,
        message: 'User registered successfully',
      },
    });

    // Clean up: delete the test user
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: newUser.email } });
    if (user) {
      await userRepository.remove(user);
    }
  });
});
describe('POST /user/verify/:id', () => {
  it('should verify a user', async () => {
    // Arrange
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe1@example.com',
      password: 'password',
      gender: 'Male',
      phoneNumber: '123456789',
      userType: 'Buyer',
      photoUrl: 'https://example.com/photo.jpg',
    };

    // Create a new user
    const res = await request(app).post('/user/register').send(newUser);

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: newUser.email } });

    if (user) {
      const verifyRes = await request(app).get(`/user/verify/${user.id}`);

      // Assert
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.text).toEqual('<p>User verified successfully</p>');

      // Check that the user's verified field is now true
      const verifiedUser = await userRepository.findOne({ where: { email: newUser.email } });
      if (verifiedUser) {
        expect(verifiedUser.verified).toBe(true);
      }
    }
  });
});
