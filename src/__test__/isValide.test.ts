import { NextFunction, Request, Response } from 'express';
import { dbConnection } from '../startups/dbConnection';
import { getConnection } from 'typeorm';
import { User } from '../entities/User';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import { isTokenValide } from '../middlewares';

jest.mock('../utils/response.utils');
let reqMock: Partial<Request>;
let resMock: Partial<Response>;
let nextMock: NextFunction;

const activeUserId = uuid();

beforeAll(async () => {
  const connection = await dbConnection();
  const userRepository = connection?.getRepository(User);

  const activeUser = new User();
  activeUser.id = activeUserId;
  activeUser.firstName = 'John2';
  activeUser.lastName = 'Doe';
  activeUser.email = 'active.doe@example.com';
  activeUser.password = 'password';
  activeUser.gender = 'Male';
  activeUser.phoneNumber = '12347';
  activeUser.photoUrl = 'https://example.com/photo.jpg';
  await userRepository?.save(activeUser);
});
afterAll(async () => {
  const connection = getConnection();
  const userRepository = connection.getRepository(User);
  // Close the connection to the test database
  await connection.close();
});

const data = {
  userType: 'Buyer',
  id: activeUserId,
  email: 'active.doe@example.com',
};
describe('Middleware - check user token', () => {
  beforeEach(() => {
    reqMock = {};
    resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextMock = jest.fn();
  });

  it('should validate a token', async () => {
    const token = jwt.sign(data, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    // Mock the request
    reqMock = {
      cookies: {
        token: token,
      },
      body: {
        email: 'active.doe@example.com',
      },
    };

    await isTokenValide(reqMock as Request, resMock as Response, nextMock);

    expect(nextMock).toHaveBeenCalled();
  });

  it('should return 401 if user is not found', async () => {
    reqMock = {
      cookies: {
        token: jwt.sign({ id: uuid(), email: 'nonexistent@example.com' }, process.env.JWT_SECRET as string, {
          expiresIn: '1h',
        }),
      },
    };

    await isTokenValide(reqMock as Request, resMock as Response, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(404);
    expect(resMock.json).toHaveBeenCalledWith({ Message: 'User not found' });
  });

  it('should return 401 if no token is provided', async () => {
    reqMock = { cookies: {} };

    await isTokenValide(reqMock as Request, resMock as Response, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.json).toHaveBeenCalledWith({ Message: 'Sorry, You are not authorized' });
  });
});
