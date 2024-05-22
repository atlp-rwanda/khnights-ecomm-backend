import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Feedback } from '../../entities/Feedback';
import { responseError, responseSuccess } from '../../utils/response.utils';
import { User } from '../../entities/User';

export const updateFeedbackService = async (req: Request, res: Response) => {
  const { feedbackId } = req.params;
  const { comment } = req.body;

  try {
    const feedbackRepository = getRepository(Feedback);
 
    const feedback = await feedbackRepository.findOne({
      where: {
        id: feedbackId,
        user: { id: req?.user?.id },
      },
    });

    if (!feedback) {
      return responseError(res, 404, 'You are not allowed to remove this feedback or you are not allowed to edit this feedback');
    }

    feedback.comment = comment;
    await feedbackRepository.save(feedback);

    return responseSuccess(res, 200, 'Feedback updated successfully', feedback);
  } catch (error) {
    return responseError(res, 500, 'Server error');
  }
};
