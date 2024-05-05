import { Request, Response } from 'express';
import { loginServices } from '../services';

// Method to login admin
export const login = async (req: Request, res: Response): Promise<void> => {
  await loginServices(req, res);
};