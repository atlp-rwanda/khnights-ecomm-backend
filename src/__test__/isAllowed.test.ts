import { NextFunction, Request, Response } from 'express';
import { checkUserStatus } from '../middlewares/isAllowed';
import { dbConnection } from '../startups/dbConnection';
import { getConnection } from 'typeorm';
import { User } from '../entities/User';
import { responseError } from '../utils/response.utils';
import { v4 as uuid } from 'uuid';
import { cleanDatabase } from './test-assets/DatabaseCleanup';

jest.mock('../utils/response.utils');

let reqMock: Partial<Request>;
let resMock: Partial<Response>;
let nextMock: NextFunction;

const activeUserId = uuid();
const suspendedUserId = uuid();

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

  const suspendedUser = new User();
  suspendedUser.id = suspendedUserId;
  suspendedUser.firstName = 'John2';
  suspendedUser.lastName = 'Doe';
  suspendedUser.email = 'suspended.doe@example.com';
  suspendedUser.password = 'password';
  suspendedUser.gender = 'Male';
  suspendedUser.status = 'suspended';
  suspendedUser.phoneNumber = '12349';
  suspendedUser.photoUrl = 'https://example.com/photo.jpg';

  await userRepository?.save(suspendedUser);
});

afterAll(async () => {
  await cleanDatabase()

});

describe('Middleware - checkUserStatus', () => {
    beforeEach(() => {
        reqMock = {};
        resMock = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextMock = jest.fn();
    });

    it('should return 401 if user is not authenticated', async () => {
        await checkUserStatus(reqMock as Request, resMock as Response, nextMock);
        expect(responseError).toHaveBeenCalledWith(resMock, 401, 'Authentication required');
    });

  it('should return 401 if user is not found', async () => {
    reqMock = { user: { id: uuid() } };

    await checkUserStatus(reqMock as Request, resMock as Response, nextMock);

    expect(responseError).toHaveBeenCalledWith(resMock, 401, 'User not found');
  });

  it('should pass if user status is active', async () => {
    reqMock = { user: { id: activeUserId } };
    await checkUserStatus(reqMock as Request, resMock as Response, nextMock);
    expect(nextMock).toHaveBeenCalled();
  });
  it('should return 403 if user status is suspended', async () => {
    reqMock = { user: { id: suspendedUserId } };
    await checkUserStatus(reqMock as Request, resMock as Response, nextMock);
    expect(responseError).toHaveBeenCalledWith(
      resMock,
      403,
      'You have been suspended. Please contact our support team.'
    );
  });
});
