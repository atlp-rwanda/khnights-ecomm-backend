import { isTokenValide } from '../middlewares/isValid';
import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';

jest.mock('typeorm', () => ({
    ...jest.requireActual('typeorm'),
    getRepository: jest.fn().mockImplementation((entity: any) => {
        if (entity === User) {
            return {
                findOne: jest.fn(),
            };
        }
        return jest.requireActual('typeorm').getRepository(entity);
    }),
}));

const mockRequest = (userPayload: any): Request => {
    return {
        cookies: { token: 'mockToken' },
        user: userPayload,
    } as unknown as Request;
};

const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

describe('isTokenValide middleware', () => {
    it('should return 401 if no user payload', async () => {
        const req = mockRequest(null);
        const res = mockResponse();

        await isTokenValide(req as Request, res as Response, mockNext as NextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ Message: 'Sorry, You are not authorized' });
    });
});