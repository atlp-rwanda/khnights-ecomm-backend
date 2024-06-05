import { Request, Response } from 'express';
import { chatBot } from '../services';

export const chatBotController = async (req: Request, res: Response) => {
  await chatBot(req, res);
};
