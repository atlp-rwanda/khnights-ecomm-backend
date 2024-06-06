import request from 'supertest';
import { app, server } from '../index';
import { createConnection, getRepository } from 'typeorm';
import { User, UserInterface } from '../entities/User';

import { cleanDatabase } from './test-assets/DatabaseCleanup';
import { v4 as uuid } from 'uuid';
import { dbConnection } from '../startups/dbConnection';

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

const userId = uuid();
const user1Id = uuid();
const user2Id = uuid();
const user3Id = uuid();

const getAccessToken = (id: string, email: string) => {
  return jwt.sign(
    {
      id: id,
      email: email,
    },
    process.env.JWT_SECRET || ''
  );
};

const sampleUser: UserInterface = {
  id: userId,
  firstName: 'user',
  lastName: 'user',
  email: 'user@example.com',
  password: '',
  userType: 'Vendor',
  verified: true,
  gender: 'Male',
  phoneNumber: '12638096347',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'VENDOR',
};

const sampleUser1: UserInterface = {
  id: user1Id,
  firstName: 'user1',
  lastName: 'user',
  email: 'user1@example.com',
  password: 'password',
  userType: 'Vendor',
  verified: true,
  status: 'suspended',
  gender: 'Male',
  phoneNumber: '126380996347',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'VENDOR',
};

const sampleUser2: UserInterface = {
  id: user2Id,
  firstName: 'user2',
  lastName: 'user',
  email: 'user2@example.com',
  password: '',
  userType: 'Vendor',
  verified: true,
  twoFactorEnabled: true,
  gender: 'Male',
  phoneNumber: '126380996347',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'VENDOR',
};

const sampleUser3: UserInterface = {
  id: user3Id,
  firstName: 'user3',
  lastName: 'user',
  email: 'user3@example.com',
  password: '',
  userType: 'Vendor',
  verified: true,
  twoFactorEnabled: true,
  twoFactorCode: '123456',
  twoFactorCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
  gender: 'Male',
  phoneNumber: '126380996347',
  photoUrl: 'https://example.com/photo.jpg',
  role: 'VENDOR',
};

beforeAll(async () => {
  const connection = await dbConnection();
  sampleUser.password = await bcrypt.hash('password', 10);
  sampleUser2.password = await bcrypt.hash('password', 10);
  sampleUser3.password = await bcrypt.hash('password', 10);

  const userRepository = connection?.getRepository(User);
  await userRepository?.save({ ...sampleUser });
  await userRepository?.save({ ...sampleUser1 });
  await userRepository?.save({ ...sampleUser2 });
  await userRepository?.save({ ...sampleUser3 });
});

afterAll(async () => {
  await cleanDatabase();
  server.close();
});

describe('User service Test', () => {
  describe('User Authentication', () => {
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

    it('should Login a user, with valid credentials', async () => {
      const res = await request(app)
        .post('/user/login')
        .send({
          email: 'user@example.com',
          password: 'password',
        });
      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('should send OTP, if 2FA is enabled', async () => {
      const res = await request(app)
        .post('/user/login')
        .send({
          email: 'user2@example.com',
          password: 'password',
        });
      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Please provide the OTP sent to your email or phone');
    });

    it('should not Login a user, with invalid credentials', async () => {
      const res = await request(app)
        .post('/user/login')
        .send({
          email: 'user@example.com',
          password: 'passwo',
        });
      // Assert
      expect(res.status).toBe(401);
    });

    it('should not login User if user email is not verified', async () => {
      const res = await request(app)
        .post('/user/login')
        .send({
          email: 'john.doe1@example.com',
          password: 'password',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Please verify your account");
    });

    it('should not login User if user is currently suspended', async () => {
      const res = await request(app)
        .post('/user/login')
        .send({
          email: sampleUser1.email,
          password: sampleUser1.password,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Your account has been suspended");
    });
  });

  describe('User Profile update', () => {
    it('should update user profile', async () => {
      const res = await request(app)
        .put('/user/update')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          gender: 'Male',
          phoneNumber: '0789412421',
          photoUrl: 'photo.jpg',
        })
        .set('Authorization', `Bearer ${getAccessToken(userId, sampleUser.email)}`);

      expect(res.status).toBe(200);
    });

    it('should not update user profile, if there is no request body sent', async () => {
      const res = await request(app)
        .put('/user/update')
        .set('Authorization', `Bearer ${getAccessToken(userId, sampleUser.email)}`);

      expect(res.status).toBe(400);
    });

    it('should not update user profile, when some required fields are not provided', async () => {
      const res = await request(app)
        .put('/user/update')
        .send({
          firstName: 'firstName updated',
          lastName: 'lastName updated'
        })
        .set('Authorization', `Bearer ${getAccessToken(userId, sampleUser.email)}`);

      expect(res.status).toBe(400);
    });
  });

  describe('User Reset Password', () => {
    it('should return response error, if no email and userID provided', async () => {
      const respond = await request(app)
        .post('/user/password/reset');

      expect(respond.status).toBe(400);
    });

    it('should not reset password, for no existing Users', async () => {
      const respond = await request(app)
        .post('/user/password/reset')
        .query({
          email: 'example@gmail.com',
          userid: uuid()
        });

      expect(respond.status).toBe(404);
    });

    it('should not reset password, if no new password sent', async () => {
      const respond = await request(app)
        .post('/user/password/reset')
        .query({
          email: sampleUser.email,
          userid: sampleUser.id
        });

      expect(respond.status).toBe(400);
      expect(respond.body.message).toBe('Please provide all required fields');
    });

    it('should not reset password, if new password doesn\'t match password in confirmPassword field', async () => {
      const respond = await request(app)
        .post('/user/password/reset')
        .query({
          email: sampleUser.email,
          userid: sampleUser.id
        })
        .send({
          newPassword: 'new-password',
          confirmPassword: 'password'
        });

      expect(respond.status).toBe(400);
      expect(respond.body.message).toBe('new password must match confirm password');
    });

    it('should not reset password, for incorrect user id syntax (invalid uuid)', async () => {
      const respond = await request(app)
        .post('/user/password/reset')
        .query({
          email: sampleUser.email,
          userid: 'invalid-=uuid'
        });

      expect(respond.status).toBe(500);
    });
    it('should reset password for the user', async () => {
      const respond = await request(app)
        .post('/user/password/reset')
        .query({
          email: sampleUser.email,
          userid: sampleUser.id
        })
        .send({
          newPassword: 'new-password',
          confirmPassword: 'new-password'
        });

      expect(respond.status).toBe(200);
      expect(respond.body.data.message).toBe('Password updated successfully');
    });
  });

  describe('User password reset link', () => {
    it('should send link to reset password', async () => {
      const response = await request(app)
        .post('/user/password/reset/link')
        .query({ email: sampleUser.email });

      expect(response.status).toBe(200);
    });

    it('should not send link to reset password, if no email provided', async () => {
      const response = await request(app)
        .post('/user/password/reset/link');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required field');
    });

    it('should not send link to reset password, if email doesn\'t exist in DB', async () => {
      const response = await request(app)
        .post('/user/password/reset/link')
        .query({ email: 'nonexistingemail@gmail.com' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('Start@FAProcess', () => {

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
    });

    it('should login user, if OTP provided is valid', async () => {
      const res = await request(app)
        .post('/user/verify-otp')
        .send({
          email: sampleUser3.email,
          otp: '123456',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
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
    });

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
});
