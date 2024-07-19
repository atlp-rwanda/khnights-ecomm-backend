import { Request, Response } from 'express';
import { User, UserInterface } from '../../entities/User';
import { getRepository } from 'typeorm';
import { sendNotification } from '../../utils/sendNotification';
import { responseError, responseSuccess } from '../../utils/response.utils';

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
      content: 'You disabled Two factor authentication on you account',
      type: 'user',
      user: user,
    });

    const newUser = await userRepository.findOne({
      where: {
        email: email,
      },
    });

    // eslint-disable-next-line no-unused-vars
    const { password, twoFactorCode, twoFactorCodeExpiresAt, ...safeUser } = newUser as UserInterface;
    return responseSuccess(res, 200, 'Two factor authentication disabled successfully', {
      profile: safeUser,
    });
  } catch (error) {
    responseError(res, 400, (error as Error).message);
  }
};
