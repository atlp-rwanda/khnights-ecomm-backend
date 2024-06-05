import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Feedback } from '../../entities/Feedback';
import { responseError, responseSuccess } from '../../utils/response.utils';

export const adminDeleteFeedbackService = async (req: Request, res: Response) => {
  const { feedbackId } = req.params;

  try {
    const feedbackRepository = getRepository(Feedback);
    const feedback = await feedbackRepository.findOne({
      where: { id: feedbackId },
    });

    if (!feedback) {
      return responseError(res, 404, 'Feedback not found');
    }

    await feedbackRepository.remove(feedback);

    return responseSuccess(res, 200, 'Feedback successfully  removed');
  } catch (error) {
    console.log(error)
    return responseError(res, 500, 'Server error');
  }
};
