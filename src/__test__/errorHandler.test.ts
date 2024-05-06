import { Request, Response } from 'express';
import { CustomError, errorHandler } from '../middlewares/errorHandler';

describe('CustomError', () => {
  it('should create a CustomError object with statusCode and status properties', () => {
    const message = 'Test error message';
    const statusCode = 404;
    const customError = new CustomError(message, statusCode);
    expect(customError.message).toBe(message);
    expect(customError.statusCode).toBe(statusCode);
    expect(customError.status).toBe('fail');
  });
});

describe('errorHandler', () => {
  it('should send correct response with status code and message', () => {
    const err = new CustomError('Test error message', 404);
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Test error message',
    });
  });
  it('should handle errors with status code 500', () => {
    const err = new CustomError('something went wrong', 500);
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      message: 'something went wrong',
    });
  });
});
