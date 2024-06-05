import { Request, Response } from 'express';
import { User } from '../../entities/User';
import { getRepository } from 'typeorm';
import { sendNotification } from '../../utils/sendNotification';

export const userDisableTwoFactorAuth = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Please provide your email' });
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.twoFactorEnabled = false;
    await userRepository.save(user);

    await sendNotification({
      content: "You disabled Two factor authentication on you account",
      type: 'user',
      user: user
    })
    return res.status(200).json({ status: 'success', message: 'Two factor authentication disabled successfully' });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
};
