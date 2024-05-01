import request from 'supertest';
import { app, server } from '../index'; // update this with the path to your app file
import { createConnection, getConnection, getConnectionOptions } from 'typeorm';
import { User } from '../entities/User';
import { getRepository, Repository } from 'typeorm';

beforeAll(async () => {
  // Connect to the test database
  const connectionOptions = await getConnectionOptions();
  await createConnection({ ...connectionOptions, name: 'testConnection' });
});

afterAll(async () => {
  await getConnection('testConnection').close();
  server.close();
});



describe('GET /', () => {
  it('This is a testing route that returns', done => {
    request(app)
      .get('/api/v1/status')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({
        status: 'success',
        data: {
          code: 202,
          message: 'This is a testing route that returns: 202'
        }
      }, done);
  });
});
describe('POST /user/register', () => {
  it('should register a new user and then delete it', async () => {
    // Arrange
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password',
      gender: 'Male',
      phoneNumber: '1234567890',
      userType: 'Buyer',
      status: 'active',
      verified: true,
      photoUrl: 'https://example.com/photo.jpg',
    };

    // Act
    const res = await request(app)
      .post('/user/register')
      .send(newUser);

    // Assert
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: 'User registered successfully' });

    // Clean up: delete the test user
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: newUser.email } });
    if (user) {
      await userRepository.remove(user);
    }
  });
});
