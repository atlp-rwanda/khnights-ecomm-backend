import { Request, Response } from 'express';
import { responseError, responseSuccess } from '../../utils/response.utils';
import { UserInterface } from '../../entities/User';

const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    // eslint-disable-next-line no-unused-vars
    const { password, twoFactorCode, twoFactorCodeExpiresAt, ...safeUser } = user as UserInterface;
    responseSuccess(res, 200, 'profile fetched successfully', { profile: safeUser });
    return;
  } catch (error) {
    responseError(res, 400, (error as Error).message);
    return;
  }
};

export default getUserProfile;
