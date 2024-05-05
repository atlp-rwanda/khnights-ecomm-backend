import { Request, Response } from 'express';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import { responseError, responseServerError, responseSuccess } from '../utils/response.utils';
import { validate } from 'class-validator';
import { userVerificationService, userRegistrationService } from '../services';

export const userRegistration = async (req: Request, res: Response) => {
  await userRegistrationService(req, res);
};
export const userVerification = async (req: Request, res: Response) => {
  await userVerificationService(req, res);
};
