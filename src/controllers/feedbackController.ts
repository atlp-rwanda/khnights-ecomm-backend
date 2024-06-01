import { Request, Response } from 'express';
import { createFeedbackService } from '../services/feedbackServices/createFeedback';
import { updateFeedbackService } from '../services/feedbackServices/updateFeedback';
import { deleteFeedbackService } from '../services/feedbackServices/deleteFeedback';
import { adminDeleteFeedbackService } from '../services/feedbackServices/adminDeleteFeedback';

export const createFeedback = async (req: Request, res: Response) => {
  await createFeedbackService(req, res);
};

export const updateFeedback = async (req: Request, res: Response) => {
  await updateFeedbackService(req, res);
};

export const deleteFeedback = async (req: Request, res: Response) => {
  await deleteFeedbackService(req, res);
};

export const adminDeleteFeedback = async (req: Request, res: Response) => {
  await adminDeleteFeedbackService(req, res);
};
