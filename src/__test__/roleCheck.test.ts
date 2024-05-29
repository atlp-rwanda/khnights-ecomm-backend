import { Response, NextFunction, Request } from 'express';
import { User } from '../entities/User';
import { hasRole } from '../middlewares';
import { responseError } from '../utils/response.utils';
import { dbConnection } from '../startups/dbConnection';
import { v4 as uuid } from 'uuid';
import { getConnection } from 'typeorm';
import { cleanDatabase } from './test-assets/DatabaseCleanup';

let reqMock: Partial<Request>;
let resMock: Partial<Response>;
let nextMock: NextFunction;

const userId = uuid();

beforeAll(async () => {
  // Connect to the test database
  const connection = await dbConnection();

  const userRepository = connection?.getRepository(User);

  const user = new User();

  user.id = userId;
  user.firstName = 'John2';
  user.lastName = 'Doe';
  user.email = 'john2.doe@example.com';
  user.password = 'password';
  user.gender = 'Male';
  user.phoneNumber = '1234';
  user.userType = 'Buyer';
  user.photoUrl = 'https://example.com/photo.jpg';

  await userRepository?.save(user);
});

afterAll(async () => {
  await cleanDatabase();
});

describe('hasRole MiddleWare Test', () => {
  beforeEach(() => {
    reqMock = {};
    resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextMock = jest.fn();
  });

  it('should return 401, if user is not authentication', async () => {
    await hasRole('ADMIN')(reqMock as Request, resMock as Response, nextMock);
    expect(responseError).toHaveBeenCalled;
    expect(resMock.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 if user is not found', async () => {
    reqMock = { user: { id: uuid() } };

    await hasRole('ADMIN')(reqMock as Request, resMock as Response, nextMock);

    expect(responseError).toHaveBeenCalled;
    expect(resMock.status).toHaveBeenCalledWith(401);
  });

  it('should return 403 if user does not have required role', async () => {
    reqMock = { user: { id: userId } };

    await hasRole('ADMIN')(reqMock as Request, resMock as Response, nextMock);

    expect(responseError).toHaveBeenCalled;
    expect(resMock.status).toHaveBeenCalledWith(403);
  });

  it('should call next() if user has required role', async () => {
    reqMock = { user: { id: userId } };

    await hasRole('BUYER')(reqMock as Request, resMock as Response, nextMock);

    expect(nextMock).toHaveBeenCalled();
  });

  it('should return 400 if user id is of invalid format', async () => {
    reqMock = { user: { id: 'sample userId' } };

    await hasRole('BUYER')(reqMock as Request, resMock as Response, nextMock);

    expect(responseError).toHaveBeenCalled;
    expect(resMock.status).toHaveBeenCalledWith(400);
  });
});
