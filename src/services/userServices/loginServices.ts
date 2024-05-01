import { Request, Response } from 'express';
import { User } from '../../entities/User';
import { responseSuccess } from '../../utils/response.utils';
import { getRepository } from 'typeorm';
import { tokenize, check } from '../../helpers/TokenizeAndVerifyPass';

// Method to login admin
export const loginServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ Message: 'Email and password are required' });
      return;
    }

    const getrepository = getRepository(User);
    const user = await getrepository.findOneBy({ email: email });

    if (!user) {
      console.log('Invalid email');
      res.status(400).json({ Message: 'Invalid email or password' });
      return;
    }

    if (!user.verified) {
      res.status(400).json({ Message: 'Email not verified. verified it first' });
      return;
    }

    if (user.status !== 'active') {
      res.status(400).json({ Message: 'You have been suspended, reach customer service for more details' });
      return;
    }

    const isPasswordValid = await check(user.password, password);
    if (!isPasswordValid) {
      res.status(400).json({ Message: 'Invalid password' });
      return;
    }

    const accessToken = tokenize({
      id: user.id,
      email: user.email,
      role: user.userType,
    });

    if (process.env.APP_ENV === 'production') {
      res.cookie('token', accessToken, { httpOnly: true, sameSite: false, secure: true });
    } else {
      res.cookie('token', accessToken, { httpOnly: true, sameSite: 'lax', secure: false });
    }

    responseSuccess(res, 200, 'logged in successful', accessToken);
  } catch (error) {
    console.error('Error logging in a user:', error);
    res.status(500).json({ error: 'Sorry, Something went wrong' });
  }
};
