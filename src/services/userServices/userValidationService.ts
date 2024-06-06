import { Request, Response } from 'express';
import { User } from '../../entities/User';
import { getRepository } from 'typeorm';
import { responseError } from '../../utils/response.utils';

export const userVerificationService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate user input
    if (!id) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOneBy({ id });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.verified = true;

    await userRepository.save(user);

    return res.status(200).send('<p>User verified successfully</p>');
  } catch (error) {
    responseError(res, 400, (error as Error).message);
  }
};
