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
      phoneNumber: '0789412421',
      userType: 'Buyer',
    };

    // Act
    const res = await request(app).post('/user/register').send(newUser);
    // Assert
    expect(res.body).toEqual({
      status: 'success',
      data: {
        code: 201,
        message: 'User registered successfully',
      },
    });
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

describe('Send password reset link', () => {
  it('Attempt to send email with rate limiting', async () => {
    const email = 'elijahladdiedv@gmail.com';

    const requests = Array.from({ length: 5 }, async () => {
      return await request(app).post(`/user/password/reset/link?email=${email}`);
    });

    const responses = await Promise.all(requests);
    const lastResponse = responses[responses.length - 1];
    expect(lastResponse.status).toBe(404);
    expect(lastResponse.body.message).toEqual('User not found');
  }, 20000);

  it('Attempt to send email with invalid email template', async () => {
    const email = 'elijahladdiedv@gmail.com';

    const res = await request(app).post(`/user/password/reset/link?email=${email}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('User not found');
  }, 10000);

  it('Send email to a user with special characters in email address', async () => {
    const email = 'user+test@example.com';

    const res = await request(app).post(`/user/password/reset/link?email=${encodeURIComponent(email)}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual('User not found');
  }, 10000);
});
describe('Password Reset Service', () => {
  it('Should reset password successfully', async () => {
    const data = {
      newPassword: 'user',
      confirmPassword: 'user',
    };
    const email = 'elijahladdiedv@gmail.com';
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: email } });
    if (user) {
      const res: any = await request(app).post(`/user/password/reset?userid=${user.id}&email=${email}`).send(data);
      // Assert
      expect(res.status).toBe(200);
      expect(res.data.message).toEqual('Password updated successful');
    }
  });

  it('Should return 404 if user not found', async () => {
    const data = {
      newPassword: 'user',
      confirmPassword: 'user',
    };
    const email = 'nonexistentemail@example.com';
    const userId = 'nonexistentuserid';
    const res: any = await request(app).post(`/user/password/reset?userid=${userId}&email=${email}`).send(data);
    // Asser
    expect(res).toBeTruthy;
  });

  it('Should return 204 if required fields are missing', async () => {
    const data = {
      //
    };
    const email = 'elijahladdiedv@gmail.com';

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: email } });
    if (user) {
      const res: any = await request(app).post(`/user/password/reset?userid=${user.id}&email=${email}`).send(data);
      expect(res.status).toBe(204);
      expect(res.data.error).toEqual('Please provide all required fields');
    }
  });

  it('Should return 204 if newPassword and confirmPassword do not match', async () => {
    const data = {
      newPassword: 'user123',
      confirmPassword: 'user456',
    };
    const email = 'elijahladdiedv@gmail.com';

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: email } });
    if (user) {
      const res: any = await request(app).post(`/user/password/reset?userid=${user.id}&email=${email}`).send(data);
      expect(res.status).toBe(204);
      expect(res.data.error).toEqual('New password must match confirm password');
    }
  });
});
