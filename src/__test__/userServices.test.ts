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
  await userRepository.delete({});

  // Close the connection to the test database
  await connection.close();

  server.close();
});

describe('start2FAProcess', () => {
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
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      status: 'success',
      data: {
        code: 201,
        message: 'User registered successfully',
      },
    });
  });

  it('should return 400 if not sent email in body on enabling 2fa', async () => {
    const data = {};

    const res = await request(app).post('/user/enable-2fa').send(data);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: 'error', message: 'Please provide your email' });
  });

  it('should return 404 if user not exist on enabling 2fa', async () => {
    const data = {
      email: 'example@gmail.com',
    };

    const res = await request(app).post('/user/enable-2fa').send(data);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: 'error', message: 'User not found' });
  });

  it('should enable two-factor authentication', async () => {
    const data = {
      email: 'john.doe1@example.com',
    };

    const res = await request(app).post('/user/enable-2fa').send(data);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'success', message: 'Two factor authentication enabled successfully' });
  });

  it('should return 400 if not sent email in body on disabling 2fa', async () => {
    const data = {};

    const res = await request(app).post('/user/disable-2fa').send(data);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: 'error', message: 'Please provide your email' });
  });

  it('should return 404 if user not exist on disabling 2fa', async () => {
    const data = {
      email: 'example@gmail.com',
    };

    const res = await request(app).post('/user/disable-2fa').send(data);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: 'error', message: 'User not found' });
  });

  it('should disable two-factor authentication', async () => {
    const data = {
      email: 'john.doe1@example.com',
    };

    const res = await request(app).post('/user/disable-2fa').send(data);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'success', message: 'Two factor authentication disabled successfully' });
  });

  it('should return 400 if not sent email and otp in body on verifying OTP', async () => {
    const data = {};

    const res = await request(app).post('/user/verify-otp').send(data);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: 'error', message: 'Please provide an email and OTP code' });
  });

  it('should return 403 if OTP is invalid', async () => {
    const email = 'john.doe1@example.com';
    const user = await getRepository(User).findOneBy({ email });
    if (user) {
      user.twoFactorEnabled = true;
      user.twoFactorCode = '123456';
      await getRepository(User).save(user);
    }

    const data = {
      email: 'john.doe1@example.com',
      otp: '123457',
    };

    const res = await request(app).post('/user/verify-otp').send(data);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ status: 'error', message: 'Invalid authentication code' });
  });

  it('should return 403 if user not exist on verifying OTP', async () => {
    const data = {
      email: 'john.doe10@example.com',
      otp: '123457',
    };

    const res = await request(app).post('/user/verify-otp').send(data);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ status: 'error', message: 'User not found' });
  });

  it('should return 403 if OTP is expired', async () => {
    const email = 'john.doe1@example.com';
    const userRepository = getRepository(User);
    const user = await userRepository.findOneBy({ email });
    if (user) {
      user.twoFactorEnabled = true;
      user.twoFactorCode = '123456';
      user.twoFactorCodeExpiresAt = new Date(Date.now() - 10 * 60 * 1000);
      await getRepository(User).save(user);
    }

    const data = {
      email: email,
      otp: '123456',
    };

    const res = await request(app).post('/user/verify-otp').send(data);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ status: 'error', message: 'Authentication code expired' });
    if (user) {
      await userRepository.remove(user);
    }
  });

  it('should return 400 if not sent email in body on resending OTP', async () => {
    const data = {};

    const res = await request(app).post('/user/resend-otp').send(data);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: 'error', message: 'Please provide an email' });
  });

  it('should return 404 if user not exist on resending OTP', async () => {
    const data = {
      email: 'john.doe10@example.com',
    };

    const res = await request(app).post('/user/resend-otp').send(data);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: 'error', message: 'Incorrect email' });
  });

  it('should resend OTP', async () => {
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe187@example.com',
      password: 'password',
      gender: 'Male',
      phoneNumber: '0785044398',
      userType: 'Buyer',
    };

    // Act
    const resp = await request(app).post('/user/register').send(newUser);
    if (!resp) {
      console.log('Error creating user in resend otp test case');
    }
    const data = {
      email: 'john.doe187@example.com',
    };

    const res = await request(app).post('/user/resend-otp').send(data);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'success', data: { message: 'OTP sent successfully' } });
  }, 20000);

  it('should return 400 if not sent email in body on login', async () => {
    const data = {};

    const res = await request(app).post('/user/login').send(data);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: 'error', message: 'Please provide an email and password' });
  }, 1000);

  it('should return 404 if user not exist on login', async () => {
    const data = {
      email: 'john.doe10@example.com',
      password: 'password',
    };

    const res = await request(app).post('/user/login').send(data);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: 'error', message: 'Incorrect email or password' });
  }, 10000);
});